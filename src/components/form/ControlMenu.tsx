import { Presence } from '@radix-ui/react-presence'
import { type UseSelectPropGetters, type UseSelectState } from 'downshift'
import { type RefObject, useEffect, useState } from 'react'

import { clst } from 'styles/clst'

const menuWindowBottomOffsetInPixels = 20
const menuMaxHeightInPixels = 210

export const ControlMenu = <TItem,>({
  className,
  container,
  getItemProps,
  highlightedIndex,
  isOpen,
  itemRenderer,
  items,
  itemToString,
  menuClassName,
  menuProps,
}: ControlMenuProps<TItem>) => {
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    function calculateMaxHeight() {
      const rect = container.current?.getBoundingClientRect()

      setMaxHeight(
        rect
          ? Math.min(window.innerHeight - rect.bottom - menuWindowBottomOffsetInPixels, menuMaxHeightInPixels)
          : undefined
      )
    }

    calculateMaxHeight()

    const eventListenerOptions: AddEventListenerOptions & EventListenerOptions = { capture: true, passive: true }

    window.addEventListener('resize', calculateMaxHeight, eventListenerOptions)
    window.addEventListener('scroll', calculateMaxHeight, eventListenerOptions)

    return () => {
      window.removeEventListener('resize', calculateMaxHeight, eventListenerOptions)
      window.removeEventListener('scroll', calculateMaxHeight, eventListenerOptions)
    }
  }, [container])

  const containerClasses = clst('absolute top-full inset-x-0 mt-0.5 outline-none', className)
  const menuClasses = clst(
    'animate-control-menu rounded-md bg-zinc-700 shadow-sm shadow-zinc-900/50 overflow-auto origin-top',
    menuClassName
  )

  return (
    <div {...menuProps} className={containerClasses}>
      <Presence present={isOpen}>
        <ul
          className={menuClasses}
          data-state={isOpen ? 'open' : 'closed'}
          style={{ maxHeight: maxHeight ? `${maxHeight}px` : 'initial' }}
        >
          {items.map((item, index) => {
            const isHighlighted = highlightedIndex === index

            const menuItemClasses = clst(
              'px-3 py-1.5 cursor-pointer text-ellipsis overflow-hidden',
              isHighlighted && 'bg-blue-600'
            )

            return (
              <li
                key={`${itemToString(item)}-${index}`}
                {...getItemProps({ className: menuItemClasses, item: item, index })}
              >
                {itemRenderer ? itemRenderer(item, isHighlighted, index) : itemToString(item)}
              </li>
            )
          })}
        </ul>
      </Presence>
    </div>
  )
}

export interface ControlMenuProps<TItem> {
  className?: string
  container: RefObject<HTMLDivElement>
  getItemProps: UseSelectPropGetters<TItem>['getItemProps']
  highlightedIndex: UseSelectState<TItem>['highlightedIndex']
  isOpen: UseSelectState<TItem>['isOpen']
  itemRenderer?: (item: TItem, isHighlighted: boolean, index: number) => React.ReactNode
  items: TItem[]
  itemToString: (item: TItem | null) => string
  menuClassName?: string
  menuProps: ReturnType<UseSelectPropGetters<TItem>['getMenuProps']>
}
