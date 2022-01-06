import { Presence } from '@radix-ui/react-presence'
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
import { RiArrowDownSLine } from 'react-icons/ri'

import Button from 'components/Button'
import Icon from 'components/Icon'
import Label from 'components/Label'
import Spinner from 'components/Spinner'
import TextInput from 'components/TextInput'
import clst from 'styles/clst'

const menuWindowBottomOffsetInPixels = 20
const menuMaxHeightInPixels = 210

const Combobox = <Item, FormFields extends FieldValues>({
  control,
  defaultItem,
  disabled,
  errorMessage,
  items,
  itemToMenuItem,
  itemToString,
  label,
  loading,
  name,
}: ComboboxProps<Item, FormFields>) => {
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
    selectItem,
  } = useCombobox({
    circularNavigation: true,
    initialSelectedItem: value,
    items: filteredItems,
    itemToString: renderItem,
    onSelectedItemChange,
    stateReducer,
  })

  const inputProps = getInputProps()

  const searchableItems = useMemo(
    () => items.map((item) => ({ item, str: itemToMenuItem ? itemToMenuItem(item) : renderItem(item) })),
    [items, itemToMenuItem, renderItem]
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
    setFilteredItems(items)
  }, [items])

  useEffect(() => {
    selectItem(defaultItem)
  }, [defaultItem, selectItem])

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

  function stateReducer(state: UseComboboxState<Item>, { type, changes }: UseComboboxStateChangeOptions<Item>) {
    switch (type) {
      case useCombobox.stateChangeTypes.InputChange: {
        const needle = changes.inputValue?.toLowerCase() ?? ''
        const results = changes.inputValue
          ? fuzzaldrin.filter(searchableItems, needle, { key: 'str' }).map((result) => result.item)
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
        onChange(state.selectedItem)

        return {
          ...changes,
          inputValue: renderItem(state.selectedItem ?? null),
          isOpen: false,
          selectedItem: state.selectedItem,
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

  function renderFilteredItem(item: Item, isHighlighted: boolean) {
    const itemStr = itemToMenuItem ? itemToMenuItem(item) : renderItem(item)

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

  const triggerIconClasses = clst('motion-safe:transition-transform motion-safe:duration-200', { 'rotate-180': isOpen })
  const menuClasses = clst('rounded-md bg-zinc-700 shadow-sm shadow-zinc-900/50 overflow-auto origin-top', {
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
          disabled={isDisabled()}
          aria-label="Toggle Menu"
          className="min-w-0 px-2 disabled:bg-zinc-600"
        >
          <Icon icon={RiArrowDownSLine} className={triggerIconClasses} />
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

              const menuItemClasses = clst('px-3 py-1.5 cursor-pointer text-ellipsis overflow-hidden', {
                'bg-blue-600': isHighlighted,
              })

              return (
                <li
                  {...getItemProps({ item, index })}
                  className={menuItemClasses}
                  key={`${renderItem(item)}-${index}`}
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

interface ComboboxProps<Item, FormFields extends FieldValues> {
  control: Control<FormFields>
  defaultItem: Item
  disabled?: boolean
  errorMessage?: string
  items: Item[]
  itemToMenuItem?: (item: Item | null) => string
  itemToString?: (item: Item | null) => string
  label: string
  loading?: boolean
  name: FieldPath<FormFields>
}
