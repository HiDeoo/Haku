import {
  useCombobox,
  type UseComboboxStateChangeOptions,
  type UseComboboxState,
  type UseComboboxStateChange,
} from 'downshift'
import { useState } from 'react'
import { FzfHighlight, useFzf } from 'react-fzf'

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
  const [query, setQuery] = useState('')

  const { getFzfHighlightProps, results } = useFzf({
    items,
    itemToString,
    query,
  })

  const { getInputProps, getItemProps, getMenuProps, highlightedIndex, inputValue } = useCombobox({
    initialHighlightedIndex: 0,
    isOpen: true,
    items: results,
    itemToString,
    onSelectedItemChange: handleSelectedItemChange,
    stateReducer,
  })

  function stateReducer(state: UseComboboxState<TItem>, { type, changes }: UseComboboxStateChangeOptions<TItem>) {
    switch (type) {
      case useCombobox.stateChangeTypes.InputBlur: {
        return state
      }
      case useCombobox.stateChangeTypes.InputChange: {
        setQuery(changes.inputValue ?? '')

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

  const baseMenuItemClasses = 'px-3 py-1.5 cursor-pointer text-ellipsis overflow-hidden'

  return (
    <>
      <div className="relative p-3">
        <TextInput
          enterKeyHint={enterKeyHint}
          {...getInputProps({
            className: isLoading ? 'pr-8' : undefined,
            onKeyDown: handleKeyDown,
            placeholder,
            spellCheck: false,
          })}
        />
        {isLoading ? <Spinner className="absolute right-5 bottom-1/3 my-0.5 h-4 w-4" color="text-zinc-100/80" /> : null}
      </div>
      <ul {...getMenuProps({ className: 'h-full overflow-y-auto' })}>
        {(isEmpty(results) && inputValue.length > 0) || isLoading ? (
          <li className={clst(baseMenuItemClasses, 'mb-1.5 opacity-75')}>
            {isLoading ? 'Loading…' : 'No matching results'}
          </li>
        ) : (
          results.map((item, index) => {
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
                <div className="min-w-0 truncate" key={`${itemStr}-${index}-label`}>
                  <FzfHighlight
                    {...getFzfHighlightProps({
                      className: isHighlighted ? 'text-blue-300' : 'text-blue-400',
                      index,
                      item,
                    })}
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

type PalettePickerProps<TItem extends PaletteItem> = Omit<PaletteProps<TItem>, 'title'>
