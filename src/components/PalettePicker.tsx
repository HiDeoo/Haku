import {
  useCombobox,
  type UseComboboxStateChangeOptions,
  type UseComboboxState,
  type UseComboboxStateChange,
} from 'downshift'
import fuzzaldrin from 'fuzzaldrin-plus'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Icon from 'components/Icon'
import { type PaletteProps } from 'components/Palette'
import Spinner from 'components/Spinner'
import TextInput from 'components/TextInput'
import clst from 'styles/clst'
import { getShortcutMap, isShortcutEvent } from 'libs/shortcut'

const shortcutMap = getShortcutMap([{ keybinding: 'Escape', label: '' }])

const PalettePicker = <TItem,>({
  isLoading,
  items,
  itemToIcon,
  itemToString,
  onOpenChange,
  onPick,
  placeholder,
}: PaletteProps<TItem>) => {
  const inputValueRef = useRef('')

  const [filteredItems, setFilteredItems] = useState(items)

  const searchableItems = useMemo(() => items.map((item) => ({ item, str: itemToString(item) })), [items, itemToString])

  const { getComboboxProps, getInputProps, getItemProps, getMenuProps, highlightedIndex, inputValue } = useCombobox({
    circularNavigation: true,
    initialHighlightedIndex: 0,
    isOpen: true,
    items: filteredItems,
    itemToString,
    onSelectedItemChange,
    stateReducer,
  })

  inputValueRef.current = inputValue

  const updateFilteredItems = useCallback(
    (inputValue?: string) => {
      const needle = inputValue?.toLowerCase() ?? ''
      const results = inputValue
        ? fuzzaldrin.filter(searchableItems, needle, { key: 'str' }).map((result) => result.item)
        : items

      setFilteredItems(results)
    },
    [items, searchableItems]
  )

  useEffect(() => {
    updateFilteredItems(inputValueRef.current)
  }, [updateFilteredItems])

  function stateReducer(state: UseComboboxState<TItem>, { type, changes }: UseComboboxStateChangeOptions<TItem>) {
    switch (type) {
      case useCombobox.stateChangeTypes.InputChange: {
        updateFilteredItems(changes.inputValue)

        return {
          ...changes,
          highlightedIndex: 0,
        }
      }
      case useCombobox.stateChangeTypes.InputKeyDownEnter:
      case useCombobox.stateChangeTypes.ItemClick: {
        // Do not fill the input value with the selected item when picking an item.
        return { ...changes, inputValue: state.inputValue }
      }
      default: {
        return changes
      }
    }
  }

  function onSelectedItemChange(changes: UseComboboxStateChange<TItem>) {
    onOpenChange(false)
    onPick(changes.selectedItem)
  }

  function renderFilteredItem(item: TItem, isHighlighted: boolean) {
    const itemStr = itemToString(item)

    if (inputValue.length === 0) {
      return itemStr
    }

    return fuzzaldrin.wrap(itemStr, inputValue, {
      wrap: { tagClass: isHighlighted ? 'text-blue-300' : 'text-blue-400' },
    })
  }

  const baseMenuItemClasses = 'px-3 py-1.5 cursor-pointer text-ellipsis overflow-hidden'

  return (
    <>
      <div {...getComboboxProps({ className: 'relative p-3' })}>
        <TextInput
          {...getInputProps({
            className: isLoading ? 'pr-8' : undefined,
            placeholder,
            spellCheck: false,
            onKeyDown: (event) => {
              if (isShortcutEvent(event, shortcutMap['Escape'])) {
                onOpenChange(false)
              }
            },
          })}
        />
        {isLoading ? <Spinner className="absolute right-5 bottom-1/3 my-0.5 h-4 w-4" color="text-blue-50/80" /> : null}
      </div>
      <ul {...getMenuProps({ className: 'h-full overflow-y-auto' })}>
        {(filteredItems.length === 0 && inputValue.length > 0) || isLoading ? (
          <li className={clst(baseMenuItemClasses, 'mb-1.5 opacity-75')}>
            {isLoading ? 'Loading…' : 'No matching results'}
          </li>
        ) : (
          filteredItems.map((item, index) => {
            const itemStr = itemToString(item)
            const itemIcon = itemToIcon ? itemToIcon(item) : undefined
            const isHighlighted = highlightedIndex === index
            const menuItemClasses = clst(baseMenuItemClasses, 'flex gap-3 items-center', {
              'bg-blue-600': isHighlighted,
            })

            return (
              <li {...getItemProps({ className: menuItemClasses, item, index })} key={`${itemStr}-${index}`}>
                {itemIcon ? (
                  <Icon
                    icon={itemIcon}
                    label={itemStr}
                    className="shrink-0 opacity-70"
                    key={`${itemStr}-${index}-icon`}
                  />
                ) : null}
                <span
                  className="truncate"
                  key={`${itemStr}-${index}-label`}
                  dangerouslySetInnerHTML={{ __html: renderFilteredItem(item, isHighlighted) }}
                />
              </li>
            )
          })
        )}
      </ul>
    </>
  )
}

export default PalettePicker
