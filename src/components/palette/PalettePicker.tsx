import {
  useCombobox,
  type UseComboboxStateChangeOptions,
  type UseComboboxState,
  type UseComboboxStateChange,
} from 'downshift'
import fuzzaldrin from 'fuzzaldrin-plus'
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'

import TextInput from 'components/form/TextInput'
import { type PaletteItem, type PaletteProps } from 'components/palette/Palette'
import Icon from 'components/ui/Icon'
import Spinner from 'components/ui/Spinner'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { isNonEmptyArray } from 'libs/array'
import { getShortcutMap, isShortcutEvent } from 'libs/shortcut'
import clst from 'styles/clst'
import styles from 'styles/PalettePicker.module.css'

const shortcutMap = getShortcutMap([{ keybinding: 'Escape' }])

const PalettePicker = <TItem extends PaletteItem>(
  {
    enterKeyHint,
    fuzzy = true,
    infinite = false,
    initialQuery = '',
    isLoading,
    isLoadingMore,
    itemDetailsToString,
    items,
    itemToIcon,
    itemToString,
    loadMore,
    minQueryLength = 1,
    onOpenChange,
    onPick,
    onQueryChange,
    placeholder,
  }: PalettePickerProps<TItem>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
) => {
  const currentInputValue = useRef('')
  const infiniteDetectorElement = useRef<HTMLLIElement>(null)

  const [isPending, startTransition] = useTransition()

  const [filteredItems, setFilteredItems] = useState(items)

  const searchableItems = useMemo(() => items.map((item) => ({ item, str: itemToString(item) })), [items, itemToString])

  const { getComboboxProps, getInputProps, getItemProps, getMenuProps, highlightedIndex, inputValue } = useCombobox({
    circularNavigation: true,
    initialHighlightedIndex: 0,
    initialInputValue: initialQuery,
    isOpen: true,
    items: filteredItems,
    itemToString,
    onInputValueChange,
    onSelectedItemChange,
    stateReducer,
  })

  const isInfiniteEnabled = infinite && !isLoading && isNonEmptyArray(filteredItems) && typeof loadMore === 'function'

  const shouldLoadMore = useIntersectionObserver(infiniteDetectorElement, { enabled: isInfiniteEnabled })

  useEffect(() => {
    if (isInfiniteEnabled && shouldLoadMore && loadMore) {
      loadMore()
    }
  }, [isInfiniteEnabled, loadMore, shouldLoadMore])

  currentInputValue.current = inputValue

  const updateFilteredItems = useCallback(
    (inputValue?: string) => {
      if (!fuzzy) {
        setFilteredItems(items)

        return
      }

      const needle = inputValue?.toLowerCase() ?? ''
      const results = inputValue
        ? fuzzaldrin.filter(searchableItems, needle, { key: 'str' }).map((result) => result.item)
        : items

      setFilteredItems(results)
    },
    [fuzzy, items, searchableItems]
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

  function onInputValueChange(changes: UseComboboxStateChange<TItem>) {
    if (onQueryChange) {
      startTransition(() => {
        onQueryChange(changes.inputValue)
      })
    }
  }

  function onSelectedItemChange(changes: UseComboboxStateChange<TItem>) {
    onOpenChange(false)
    onPick(changes.selectedItem)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (isShortcutEvent(event, shortcutMap['Escape'])) {
      onOpenChange(false)
    }
  }

  function onBlur() {
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
  const showLoadingSpinner = isPending || isLoading || isLoadingMore

  return (
    <>
      <div {...getComboboxProps({ className: 'relative p-3' })}>
        <TextInput
          enterKeyHint={enterKeyHint}
          {...getInputProps({
            className: showLoadingSpinner ? 'pr-8' : undefined,
            onKeyDown,
            onBlur,
            placeholder,
            ref: forwardedRef,
            spellCheck: false,
          })}
        />
        {showLoadingSpinner ? (
          <Spinner className="absolute right-5 bottom-1/3 my-0.5 h-4 w-4" color="text-blue-50/80" />
        ) : null}
      </div>
      <ul {...getMenuProps({ className: 'h-full overflow-y-auto' })}>
        {(!isNonEmptyArray(filteredItems) && inputValue.length >= minQueryLength) || isLoading ? (
          <li className={clst(baseMenuItemClasses, 'mb-1.5 opacity-75')}>
            {isLoading ? 'Loading…' : 'No matching results'}
          </li>
        ) : (
          <>
            {filteredItems.map((item, index) => {
              if (item.disabled) {
                return null
              }

              const itemStr = itemToString(item)
              const itemIcon = itemToIcon ? itemToIcon(item) : undefined
              const isHighlighted = highlightedIndex === index
              const menuItemClasses = clst(baseMenuItemClasses, 'flex gap-3 items-center', {
                'bg-blue-600': isHighlighted,
              })
              const itemDetailsClasses = clst(
                styles.itemDetails,
                { highlighted: isHighlighted },
                'truncate text-xs italic text-zinc-400'
              )

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
                    {itemDetailsToString ? (
                      <div
                        className={itemDetailsClasses}
                        dangerouslySetInnerHTML={{ __html: itemDetailsToString(item) }}
                      />
                    ) : null}
                  </div>
                </li>
              )
            })}
            {isInfiniteEnabled ? <li ref={infiniteDetectorElement}>load more</li> : null}
          </>
        )}
      </ul>
    </>
  )
}

PalettePicker.displayName = 'PalettePicker'

export default forwardRef(PalettePicker) as <TItem>(
  props: PalettePickerProps<TItem> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => ReturnType<typeof PalettePicker>

type PalettePickerProps<TItem> = Omit<PaletteProps<TItem>, 'title'>
