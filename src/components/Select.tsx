import { useSelect } from 'downshift'
import { useCallback, useRef } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'

import Button from 'components/Button'
import ControlMenu from 'components/ControlMenu'
import Flex from 'components/Flex'
import Icon from 'components/Icon'
import Label from 'components/Label'
import clst from 'styles/clst'

const Select = <Item,>({ defaultItem, disabled, items, itemToString, label }: SelectProps<Item>) => {
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
    useSelect({ circularNavigation: true, initialSelectedItem: defaultItem, items, itemToString: renderItem })

  const labelItem = selectedItem ?? defaultItem

  const triggerIconClasses = clst('motion-safe:transition-transform motion-safe:duration-200', { 'rotate-180': isOpen })

  return (
    <div className="relative" ref={container}>
      <Label {...getLabelProps()} disabled={disabled}>
        {label}
      </Label>
      <Button {...getToggleButtonProps()} disabled={disabled} aria-label="Toggle Menu" className="w-full">
        <Flex alignItems="center" justifyContent="between" className="gap-3">
          <div className="text-ellipsis overflow-hidden">{renderItem(labelItem)}</div>
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
        highlightedIndex={highlightedIndex}
      />
    </div>
  )
}

export default Select

interface SelectProps<Item> {
  defaultItem: Item
  disabled?: boolean
  items: Item[]
  itemToString?: (item: Item | null) => string
  label: string
}
