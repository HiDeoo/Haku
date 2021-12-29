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
import Spinner from 'components/Spinner'
import TextInput from 'components/TextInput'

const menuWindowBottomOffsetInPixels = 20
const menuMaxHeightInPixels = 210

const Combobox = <Item, FormFields extends FieldValues>({
  control,
  defaultItem,
  disabled,
  errorMessage,
  items,
  itemToString,
  label,
  loading,
  name,
}: Props<Item, FormFields>) => {
  const isMenuOpened = useRef(false)
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
  } = useController<FormFields>({
    control,
    // https://github.com/react-hook-form/react-hook-form/issues/2978#issuecomment-1001992272
    defaultValue: defaultItem as UnpackNestedValue<PathValue<FormFields, Path<FormFields>>>,
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
    inputValue,
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

  isMenuOpened.current = isOpen

  const inputProps = getInputProps()

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
    if (isMenuOpened.current) {
      onChange(selectedItem)
    }
  }

  function renderFilteredItem(item: Item, isHighlighted: boolean) {
    const itemStr = renderItem(item)

    if (inputValue.length === 0) {
      return itemStr
    }

    return fuzzaldrin.wrap(itemStr, inputValue, {
      wrap: { tagClass: isHighlighted ? 'text-blue-300' : 'text-blue-400' },
    })
  }

  function isDisabled() {
    return disabled || loading
  }

  function getInputValue() {
    return loading ? 'Loading…' : inputProps.value
  }

  const triggerIconClasses = clsx('motion-safe:transition-transform motion-safe:duration-200', { 'rotate-180': isOpen })
  const menuClasses = clsx('rounded-md bg-zinc-700 shadow-sm shadow-zinc-900/50 overflow-auto origin-top', {
    'animate-combobox': !disableMenuAnimation,
  })

  return (
    <div className="relative mb-3" ref={container}>
      <Label {...getLabelProps()} errorMessage={errorMessage} disabled={isDisabled()}>
        {label}
      </Label>
      <div {...getComboboxProps()} className="flex relative">
        {loading ? <Spinner className="absolute top-1.5 right-12 h-5 w-5 text-blue-500" /> : null}
        <TextInput
          {...inputProps}
          className="mr-1.5"
          spellCheck={false}
          disabled={isDisabled()}
          value={getInputValue()}
          errorMessage={errorMessage}
        />
        <Button
          {...getToggleButtonProps()}
          aria-label="Toggle Menu"
          className="min-w-0 px-2.5 disabled:bg-zinc-600"
          disabled={isDisabled()}
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
              const isHighlighted = highlightedIndex === index

              const menuItemClasses = clsx('px-3 py-1.5 cursor-pointer text-ellipsis overflow-hidden', {
                'bg-blue-600': isHighlighted,
              })

              return (
                <li
                  {...getItemProps({ item, index })}
                  key={`${renderItem(item)}-${index}`}
                  className={menuItemClasses}
                  dangerouslySetInnerHTML={{ __html: renderFilteredItem(item, isHighlighted) }}
                />
              )
            })}
          </ul>
        </Presence>
      </div>
    </div>
  )
}

export default Combobox

interface Props<Item, FormFields extends FieldValues> {
  control: Control<FormFields>
  defaultItem: Item
  disabled?: boolean
  errorMessage?: string
  items: Item[]
  itemToString?: (item: Item | null) => string
  label: string
  loading?: boolean
  name: FieldPath<FormFields>
}
