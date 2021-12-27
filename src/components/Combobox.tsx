import { Presence } from '@radix-ui/react-presence'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'
import fuzzaldrin from 'fuzzaldrin-plus'
import {
  useCombobox,
  type UseComboboxStateChangeOptions,
  type UseComboboxState,
  type UseComboboxStateChange,
} from 'downshift'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  type Control,
  useController,
  type FieldValues,
  type FieldPath,
  type UnpackNestedValue,
  type PathValue,
  type Path,
  type ValidateResult,
} from 'react-hook-form'

import Button from 'components/Button'
import Label from 'components/Label'
import TextInput from 'components/TextInput'

const menuWindowBottomOffsetInPixels = 20
const menuMaxHeightInPixels = 210

const Select = <Item, FormFields extends FieldValues>({
  control,
  defaultItem,
  disabled,
  errorMessage,
  items,
  itemToString,
  label,
  name,
}: Props<Item, FormFields>) => {
  const container = useRef<HTMLDivElement>(null)

  const [filteredItems, setFilteredItems] = useState(items)
  const [disableMenuAnimation, setDisableMenuAnimation] = useState(false)
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)

  const renderItem = useCallback(
    (item: Item | null): string => {
      if (!item || !itemToString) {
        return item ? String(item) : ''
      }

      return itemToString(item)
    },
    [itemToString]
  )

  const {
    field: { onChange, value },
  } = useController({
    control,
    defaultValue: defaultItem,
    name,
    rules: { validate },
  })

  const {
    getComboboxProps,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    getToggleButtonProps,
    highlightedIndex,
    isOpen,
    selectedItem,
  } = useCombobox({
    circularNavigation: true,
    initialSelectedItem: value,
    items: filteredItems,
    itemToString: renderItem,
    onInputValueChange,
    onSelectedItemChange,
    stateReducer,
  })

  const searchableItems = useMemo(
    () =>
      items.map((item) => {
        return { item, str: renderItem(item) }
      }),
    [items, renderItem]
  )

  useLayoutEffect(() => {
    function calculateMaxHeight() {
      const rect = container.current?.getBoundingClientRect()

      setMaxHeight(
        rect
          ? Math.min(window.innerHeight - rect.bottom - menuWindowBottomOffsetInPixels, menuMaxHeightInPixels)
          : undefined
      )
    }

    calculateMaxHeight()

    window.addEventListener('resize', calculateMaxHeight)

    return () => {
      window.removeEventListener('resize', calculateMaxHeight)
    }
  }, [])

  useEffect(() => {
    let animationFrame: ReturnType<typeof requestAnimationFrame>

    if (disableMenuAnimation) {
      animationFrame = requestAnimationFrame(() => {
        setDisableMenuAnimation(false)
      })
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [disableMenuAnimation])

  function stateReducer(_: UseComboboxState<Item>, { type, changes }: UseComboboxStateChangeOptions<Item>) {
    switch (type) {
      case useCombobox.stateChangeTypes.InputChange: {
        const results = changes.inputValue
          ? fuzzaldrin
              .filter(searchableItems, changes.inputValue.toLowerCase() ?? '', { key: 'str' })
              .map((result) => result.item)
          : items

        setFilteredItems(results)

        return changes
      }
      case useCombobox.stateChangeTypes.InputKeyDownEscape:
      case useCombobox.stateChangeTypes.ToggleButtonClick:
      case useCombobox.stateChangeTypes.InputBlur: {
        if (type === useCombobox.stateChangeTypes.ToggleButtonClick && !isOpen) {
          return changes
        }

        setDisableMenuAnimation(true)

        return {
          ...changes,
          inputValue: renderItem(changes.selectedItem ?? null),
          isOpen: false,
        }
      }
      default: {
        return changes
      }
    }
  }

  function validate(): ValidateResult {
    return !isOpen || 'required'
  }

  function onSelectedItemChange(changes: UseComboboxStateChange<Item>) {
    onChange(changes.selectedItem)
  }

  function onInputValueChange() {
    onChange(selectedItem)
  }

  const triggerIconClasses = clsx('motion-safe:transition-transform motion-safe:duration-200', { 'rotate-180': isOpen })
  const menuClasses = clsx('rounded-md bg-zinc-700 shadow-sm shadow-zinc-900/50 overflow-auto origin-top', {
    'animate-combobox': !disableMenuAnimation,
  })

  return (
    <div className="relative mb-3" ref={container}>
      <Label {...getLabelProps()} errorMessage={errorMessage} disabled={disabled}>
        {label}
      </Label>
      <div {...getComboboxProps()} className="flex">
        <TextInput {...getInputProps()} className="mr-1.5" errorMessage={errorMessage} disabled={disabled} />
        <Button
          {...getToggleButtonProps()}
          aria-label="Toggle Menu"
          className="min-w-0 px-2.5 disabled:bg-zinc-600"
          disabled={disabled}
        >
          <ChevronDownIcon className={triggerIconClasses} />
        </Button>
      </div>
      <div {...getMenuProps()} className="absolute top-full inset-x-0 mt-0.5 mr-10 outline-none">
        <Presence present={isOpen}>
          <ul
            className={menuClasses}
            data-state={isOpen ? 'open' : 'closed'}
            style={{ maxHeight: maxHeight ? `${maxHeight}px` : 'initial' }}
          >
            {filteredItems.map((item, index) => {
              const menuItemClasses = clsx('px-3 py-1.5 cursor-pointer text-ellipsis overflow-hidden', {
                'bg-blue-600': highlightedIndex === index,
              })

              return (
                <li {...getItemProps({ item, index })} key={`${renderItem(item)}-${index}`} className={menuItemClasses}>
                  {renderItem(item)}
                </li>
              )
            })}
          </ul>
        </Presence>
      </div>
    </div>
  )
}

export default Select

interface Props<Item, FormFields extends FieldValues> {
  control: Control<FormFields>
  defaultItem: UnpackNestedValue<PathValue<FormFields, Path<FormFields>>>
  disabled?: boolean
  errorMessage?: string
  items: Item[]
  itemToString?: (item: Item | null) => string
  label: string
  name: FieldPath<FormFields>
}
