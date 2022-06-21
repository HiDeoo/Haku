import {
  Content,
  Item as MenuItem,
  Label as MenuLabel,
  Portal,
  Root,
  Separator as MenuSeparator,
  Trigger,
} from '@radix-ui/react-context-menu'
import { forwardRef } from 'react'

import clst from 'styles/clst'

const itemClasses = 'block w-full text-left [&[data-highlighted]]:outline-none px-2 py-1 rounded select-none'
const contentClasses = 'min-w-[theme(spacing.32)] overflow-hidden rounded-md bg-zinc-700 p-1.5 shadow shadow-black/75'

const ContextMenu: ContextMenuComponent = ({ children, trigger }) => {
  return (
    <Root>
      <Trigger asChild>{trigger}</Trigger>
      <Portal>
        <Content className={contentClasses}>{children}</Content>
      </Portal>
    </Root>
  )
}

const Item = forwardRef<HTMLButtonElement, ItemProps>(({ disabled, intent, onClick, text }, forwardedRef) => {
  const buttonClasses = clst(itemClasses, 'font-medium disabled:cursor-not-allowed disabled:opacity-50', {
    '[&[data-highlighted]]:bg-blue-600': !intent,
    'text-red-400 [&[data-highlighted]]:bg-red-500 [&[data-highlighted]]:text-red-50': intent === 'error',
    'disabled:opacity-100 disabled:text-red-400/75': intent === 'error',
  })

  return (
    <MenuItem asChild disabled={disabled}>
      <button ref={forwardedRef} onClick={onClick} className={buttonClasses} disabled={disabled}>
        {text}
      </button>
    </MenuItem>
  )
})

Item.displayName = 'Item'
ContextMenu.Item = Item

const Label: React.FC<LabelProps> = ({ text }) => {
  return <MenuLabel className={itemClasses}>{text}</MenuLabel>
}

ContextMenu.Label = Label

const Separator: React.FC = () => {
  return <MenuSeparator className="my-1 h-px bg-blue-50/25" />
}

ContextMenu.Separator = Separator

export default ContextMenu

type ContextMenuComponent = React.FC<ContextMenuProps> & {
  Item: typeof Item
  Label: typeof Label
  Separator: typeof Separator
}

interface ContextMenuProps {
  children: React.ReactNode
  trigger: React.ReactNode
}

interface ItemProps {
  disabled?: boolean
  intent?: undefined | 'error'
  onClick: () => void
  text: string
}

interface LabelProps {
  text: string
}
