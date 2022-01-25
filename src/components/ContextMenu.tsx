import {
  Content,
  Item as MenuItem,
  Label as MenuLabel,
  Root,
  Separator as MenuSeparator,
  Trigger,
} from '@radix-ui/react-context-menu'
import { forwardRef } from 'react'

import clst from 'styles/clst'

const itemClasses = 'block w-full text-left focus:outline-none px-2 py-1 rounded'

const ContextMenu: ContextMenuComponent = ({ children, trigger }) => {
  return (
    <Root>
      <Trigger asChild>{trigger}</Trigger>
      <Content className="min-w-[8rem] overflow-hidden rounded-md bg-zinc-700 p-1.5 shadow shadow-black/75">
        {children}
      </Content>
    </Root>
  )
}

const Item = forwardRef<HTMLButtonElement, React.PropsWithChildren<ItemProps>>(
  ({ intent, onClick, text }, forwardedRef) => {
    const buttonClasses = clst(itemClasses, 'font-medium', {
      'focus:bg-blue-600': !intent,
      'text-red-400 focus:bg-red-500 focus:text-red-50': intent === 'error',
    })

    return (
      <MenuItem asChild>
        <button ref={forwardedRef} onClick={onClick} className={buttonClasses}>
          {text}
        </button>
      </MenuItem>
    )
  }
)

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
  trigger: React.ReactNode
}

interface ItemProps {
  intent?: undefined | 'error'
  onClick: () => void
  text: string
}

interface LabelProps {
  text: string
}
