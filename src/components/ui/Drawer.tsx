import { Close, Content, Overlay, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { RiCloseLine } from 'react-icons/ri'

import IconButton from 'components/form/IconButton'
import Flex from 'components/ui/Flex'
import clst from 'styles/clst'

const drawerContentClasses = clst(
  'animate-drawer-content flex flex-col md:w-[700px] w-full bg-zinc-800 h-full',
  'outline-none md:shadow-[1px_0_3px_0_rgba(0,0,0,0.75),1px_0_2px_-1px_rgba(0,0,0,0.75)]'
)

const drawerOverlayClasses = 'animate-modal-overlay fixed inset-0 z-40 bg-zinc-900/80'

const headerClasses = clst(
  'border-b border-black/10 bg-zinc-900 py-2 pl-3 pr-2 font-bold',
  'supports-max:pl-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-left)))]'
)

const Drawer: React.FC<DrawerProps> = ({ children, className, onOpenChange, opened, title, trigger }) => {
  const childrenClasses = clst('grow overflow-y-auto', className)

  return (
    <Root open={opened} onOpenChange={onOpenChange}>
      {trigger ? <Trigger asChild>{trigger}</Trigger> : null}
      <Portal>
        <Overlay className={drawerOverlayClasses}>
          <Content className={drawerContentClasses}>
            <Flex as="header" alignItems="center" justifyContent="between" className={headerClasses}>
              <Title>{title}</Title>
              <Close asChild>
                <IconButton tooltip="Close" icon={RiCloseLine} className="rounded-full p-1" />
              </Close>
            </Flex>
            <div className={childrenClasses}>{children}</div>
          </Content>
        </Overlay>
      </Portal>
    </Root>
  )
}

export default Drawer

interface DrawerProps {
  children: React.ReactNode
  className?: string
  onOpenChange: (opened: boolean) => void
  opened: boolean
  title: string
  trigger?: React.ReactNode
}
