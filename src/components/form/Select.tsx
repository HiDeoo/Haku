import { useSelect, UseSelectStateChange } from 'downshift'
import { useCallback, useRef } from 'react'
import { forwardRef } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'

import Button, { ButtonProps } from 'components/form/Button'
import ControlMenu, { type ControlMenuProps } from 'components/form/ControlMenu'
import Label from 'components/form/Label'
import Flex from 'components/ui/Flex'
import Icon from 'components/ui/Icon'
import clst from 'styles/clst'

const Select = <TItem,>(
  {
    className,
    defaultItem,
    disabled,
    items,
    itemToString,
    label,
    menuClassName,
    onButtonKeyDown,
    onChange,
    tabIndex,
    triggerClassName,
    triggerPressedClassName,
  }: SelectProps<TItem>,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>
) => {
  const container = useRef<HTMLDivElement>(null)

  const renderItem = useCallback(
    (item: TItem | null): string => {
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
      onSelectedItemChange: handleSelectedItemChange,
    })

  function handleSelectedItemChange(changes: UseSelectStateChange<TItem>) {
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
      {label ? <Label {...getLabelProps({ disabled })}>{label}</Label> : null}
      <Button
        {...getToggleButtonProps({
          'aria-label': 'Toggle Menu',
          className: triggerClasses,
          disabled,
          onKeyDown: onButtonKeyDown,
          ref: forwardedRef,
          tabIndex,
        })}
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
        className="z-20"
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

export default forwardRef(Select) as <TItem>(
  props: SelectProps<TItem> & { ref?: React.ForwardedRef<HTMLButtonElement> }
) => ReturnType<typeof Select>

interface SelectProps<TItem> {
  className?: string
  defaultItem: TItem
  disabled?: boolean
  items: TItem[]
  itemToString?: (item: TItem | null) => string
  label?: string
  menuClassName?: ControlMenuProps<TItem>['menuClassName']
  onButtonKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  onChange: (item: TItem) => void
  tabIndex?: ButtonProps['tabIndex']
  triggerClassName?: string
  triggerPressedClassName?: string
}
