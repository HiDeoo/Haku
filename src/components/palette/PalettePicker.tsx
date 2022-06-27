import {
  useCombobox,
  type UseComboboxStateChangeOptions,
  type UseComboboxState,
  type UseComboboxStateChange,
} from 'downshift'
import fuzzaldrin from 'fuzzaldrin-plus'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { TextInput } from 'components/form/TextInput'
import { type PaletteItem, type PaletteProps } from 'components/palette/Palette'
import { Icon } from 'components/ui/Icon'
import { Spinner } from 'components/ui/Spinner'
import { isEmpty } from 'libs/array'
import { getShortcutMap, isShortcutEvent } from 'libs/shortcut'
import { clst } from 'styles/clst'

const shortcutMap = getShortcutMap([{ keybinding: 'Escape' }])

export const PalettePicker = <TItem extends PaletteItem>({
  enterKeyHint,
  isLoading,
  items,
  itemToIcon,
  itemToString,
  onOpenChange,
  onPick,
  placeholder,
}: PalettePickerProps<TItem>) => {
  const currentInputValue = useRef('')

  const [filteredItems, setFilteredItems] = useState(items)

  const searchableItems = useMemo(() => items.map((item) => ({ item, str: itemToString(item) })), [items, itemToString])

  const { getComboboxProps, getInputProps, getItemProps, getMenuProps, highlightedIndex, inputValue } = useCombobox({
    circularNavigation: true,
    initialHighlightedIndex: 0,
    isOpen: true,
    items: filteredItems,
    itemToString,
    onSelectedItemChange: handleSelectedItemChange,
    stateReducer,
  })

  currentInputValue.current = inputValue

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
    updateFilteredItems(currentInputValue.current)
  }, [updateFilteredItems])

  function stateReducer(state: UseComboboxState<TItem>, { type, changes }: UseComboboxStateChangeOptions<TItem>) {
    switch (type) {
      case useCombobox.stateChangeTypes.InputBlur: {
        return state
      }
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

  function handleSelectedItemChange(changes: UseComboboxStateChange<TItem>) {
    onOpenChange(false)
    onPick(changes.selectedItem)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (isShortcutEvent(event, shortcutMap['Escape'])) {
      onOpenChange(false)
    }
  }

  function handleBlur() {
    onOpenChange(false)
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
          enterKeyHint={enterKeyHint}
          {...getInputProps({
            className: isLoading ? 'pr-8' : undefined,
            onKeyDown: handleKeyDown,
            onBlur: handleBlur,
            placeholder,
            spellCheck: false,
          })}
        />
        {isLoading ? <Spinner className="absolute right-5 bottom-1/3 my-0.5 h-4 w-4" color="text-zinc-100/80" /> : null}
      </div>
      <ul {...getMenuProps({ className: 'h-full overflow-y-auto' })}>
        {(isEmpty(filteredItems) && inputValue.length > 0) || isLoading ? (
          <li className={clst(baseMenuItemClasses, 'mb-1.5 opacity-75')}>
            {isLoading ? 'Loading…' : 'No matching results'}
          </li>
        ) : (
          filteredItems.map((item, index) => {
            if (item.disabled) {
              return null
            }

            const itemStr = itemToString(item)
            const itemIcon = itemToIcon ? itemToIcon(item) : undefined
            const isHighlighted = highlightedIndex === index
            const menuItemClasses = clst(baseMenuItemClasses, 'flex gap-3 items-center', isHighlighted && 'bg-blue-600')

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
                <div className="min-w-0" key={`${itemStr}-${index}-label`}>
                  <div
                    className="truncate"
                    dangerouslySetInnerHTML={{ __html: renderFilteredItem(item, isHighlighted) }}
                  />
                </div>
              </li>
            )
          })
        )}
      </ul>
    </>
  )
}

type PalettePickerProps<TItem> = Omit<PaletteProps<TItem>, 'title'>
