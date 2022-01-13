import { useSelect, UseSelectStateChange } from 'downshift'
import { useCallback, useRef } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'

import Button, { ButtonProps } from 'components/Button'
import ControlMenu, { type ControlMenuProps } from 'components/ControlMenu'
import Flex from 'components/Flex'
import Icon from 'components/Icon'
import Label from 'components/Label'
import clst from 'styles/clst'

const Select = <Item,>({
  className,
  defaultItem,
  disabled,
  items,
  itemToString,
  label,
  menuClassName,
  onChange,
  tabIndex,
  triggerClassName,
  triggerPressedClassName,
}: SelectProps<Item>) => {
  const container = useRef<HTMLDivElement>(null)

  const renderItem = useCallback(
    (item: Item | null): string => {
      if (!item || !itemToString) {
        return item ? String(item) : ''
      }

      return itemToString(item)
    },
    [itemToString]
  )

  const { getItemProps, getLabelProps, getMenuProps, getToggleButtonProps, highlightedIndex, isOpen, selectedItem } =
    useSelect({
      circularNavigation: true,
      initialSelectedItem: defaultItem,
      items,
      itemToString: renderItem,
      onSelectedItemChange,
    })

  function onSelectedItemChange(changes: UseSelectStateChange<Item>) {
    if (changes.selectedItem) {
      onChange(changes.selectedItem)
    }
  }

  const labelItem = selectedItem ?? defaultItem

  const containerClasses = clst('relative', className)
  const triggerClasses = clst('w-full', triggerClassName)
  const triggerIconClasses = clst('shrink-0 motion-safe:transition-transform motion-safe:duration-200', {
    'rotate-180': isOpen,
  })

  return (
    <div className={containerClasses} ref={container} contentEditable={false}>
      {label ? (
        <Label {...getLabelProps()} disabled={disabled}>
          {label}
        </Label>
      ) : null}
      <Button
        {...getToggleButtonProps()}
        disabled={disabled}
        tabIndex={tabIndex}
        aria-label="Toggle Menu"
        className={triggerClasses}
        pressedClassName={triggerPressedClassName}
      >
        <Flex alignItems="center" justifyContent="between" className="gap-1">
          <div className="truncate">{renderItem(labelItem)}</div>
          <Icon icon={RiArrowDownSLine} className={triggerIconClasses} />
        </Flex>
      </Button>
      <ControlMenu
        items={items}
        isOpen={isOpen}
        container={container}
        itemToString={renderItem}
        menuProps={getMenuProps()}
        getItemProps={getItemProps}
        menuClassName={menuClassName}
        highlightedIndex={highlightedIndex}
      />
    </div>
  )
}

export default Select

interface SelectProps<Item> {
  className?: string
  defaultItem: Item
  disabled?: boolean
  items: Item[]
  itemToString?: (item: Item | null) => string
  label?: string
  menuClassName?: ControlMenuProps<Item>['menuClassName']
  onChange: (item: Item) => void
  tabIndex?: ButtonProps['tabIndex']
  triggerClassName?: string
  triggerPressedClassName?: string
}
