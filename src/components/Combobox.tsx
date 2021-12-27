import { Presence } from '@radix-ui/react-presence'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'
import { useCombobox, UseComboboxStateChange } from 'downshift'
import { useLayoutEffect, useRef, useState } from 'react'
import {
  type Control,
  useController,
  type FieldValues,
  type FieldPath,
  type UnpackNestedValue,
  type PathValue,
  type Path,
} from 'react-hook-form'

import Button from 'components/Button'
import Label from 'components/Label'
import TextInput from 'components/TextInput'

const menuWindowBottomOffsetInPixels = 20
const menuMaxHeightInPixels = 210

const Select = <ItemType, FormFields extends FieldValues>({
  control,
  defaultItem,
  disabled,
  errorMessage,
  items,
  itemToString,
  label,
  name,
}: Props<ItemType, FormFields>) => {
  const container = useRef<HTMLDivElement>(null)

  const [filteredItems, setFilteredItems] = useState(items)
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)

  const {
    field: { onChange, value },
  } = useController({
    control,
    defaultValue: defaultItem,
    name,
    rules: { required: `required` },
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
  } = useCombobox({
    circularNavigation: true,
    initialSelectedItem: value,
    items: filteredItems,
    itemToString: renderItem,
    onInputValueChange,
    onSelectedItemChange,
  })

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

  function renderItem(item: ItemType | null): string {
    if (!item || !itemToString) {
      return item ? String(item) : ''
    }

    return itemToString(item)
  }

  function onSelectedItemChange(changes: UseComboboxStateChange<ItemType>) {
    onChange(changes.selectedItem)
  }

  function onInputValueChange({ inputValue }: UseComboboxStateChange<ItemType>) {
    // TODO(HiDeoo)
    const newFilteredItems = inputValue
      ? items.filter((item) => renderItem(item).toLowerCase().startsWith(inputValue.toLowerCase()))
      : items

    setFilteredItems(newFilteredItems)
  }

  const triggerIconClasses = clsx('motion-safe:transition-transform motion-safe:duration-200', { 'rotate-180': isOpen })

  return (
    <div className="relative mb-3" ref={container}>
      <Label {...getLabelProps()} errorMessage={errorMessage} disabled={disabled}>
        {label}
      </Label>
      <div {...getComboboxProps()} className="flex">
        <TextInput {...getInputProps()} className="mr-1.5" disabled={disabled} />
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
            data-state={isOpen ? 'open' : 'closed'}
            style={{ maxHeight: maxHeight ? `${maxHeight}px` : 'initial' }}
            className="rounded-md bg-zinc-700 shadow-sm shadow-zinc-900/50 overflow-auto origin-top animate-combobox"
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

interface Props<ItemType, FormFields extends FieldValues> {
  control: Control<FormFields>
  defaultItem: UnpackNestedValue<PathValue<FormFields, Path<FormFields>>>
  disabled?: boolean
  errorMessage?: string
  items: ItemType[]
  itemToString?: (item: ItemType | null) => string
  label: string
  name: FieldPath<FormFields>
}
