import fuzzaldrin from 'fuzzaldrin-plus'
import {
  useCombobox,
  type UseComboboxStateChangeOptions,
  type UseComboboxState,
  type UseComboboxStateChange,
} from 'downshift'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

import Button from 'components/form/Button'
import ControlMenu from 'components/form/ControlMenu'
import Flex from 'components/ui/Flex'
import Icon from 'components/ui/Icon'
import Label from 'components/form/Label'
import Spinner from 'components/ui/Spinner'
import TextInput from 'components/form/TextInput'
import clst from 'styles/clst'

const Combobox = <TItem, TFormFields extends FieldValues>({
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
}: ComboboxProps<TItem, TFormFields>) => {
  const container = useRef<HTMLDivElement>(null)

  const [filteredItems, setFilteredItems] = useState(items)
  const [disableMenuAnimation, setDisableMenuAnimation] = useState(false)

  const renderItem = useCallback(
    (item: TItem | null): string => {
      if (!item || !itemToString) {
        return item ? String(item) : ''
      }

      return itemToString(item)
    },
    [itemToString]
  )

  const {
    field: { onChange, value },
  } = useController<TFormFields>({
    control,
    // https://github.com/react-hook-form/react-hook-form/issues/2978#issuecomment-1001992272
    defaultValue: defaultItem as UnpackNestedValue<PathValue<TFormFields, Path<TFormFields>>>,
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

  function stateReducer(state: UseComboboxState<TItem>, { type, changes }: UseComboboxStateChangeOptions<TItem>) {
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

  function onSelectedItemChange(changes: UseComboboxStateChange<TItem>) {
    onChange(changes.selectedItem)
  }

  function renderFilteredItem(item: TItem, isHighlighted: boolean) {
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

  return (
    <div className="relative mb-3" ref={container}>
      <Label {...getLabelProps({ disabled: isDisabled() })} errorMessage={errorMessage}>
        {label}
      </Label>
      <Flex {...getComboboxProps({ className: 'relative' })}>
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
          {...getToggleButtonProps({
            'aria-label': 'Toggle Menu',
            className: 'min-w-0 px-2 disabled:bg-zinc-600',
            disabled: isDisabled(),
          })}
        >
          <Icon icon={RiArrowDownSLine} className={triggerIconClasses} />
        </Button>
      </Flex>
      <ControlMenu
        isOpen={isOpen}
        className="mr-9"
        container={container}
        items={filteredItems}
        itemToString={renderItem}
        menuProps={getMenuProps()}
        getItemProps={getItemProps}
        highlightedIndex={highlightedIndex}
        itemToInnerHtml={renderFilteredItem}
        disableAnimation={disableMenuAnimation}
      />
    </div>
  )
}

export default Combobox

interface ComboboxProps<TItem, TFormFields extends FieldValues> {
  control: Control<TFormFields>
  defaultItem: TItem
  disabled?: boolean
  errorMessage?: string
  items: TItem[]
  itemToMenuItem?: (item: TItem | null) => string
  itemToString?: (item: TItem | null) => string
  label: string
  loading?: boolean
  name: FieldPath<TFormFields>
}
