import { Close, Content, Overlay, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { RiCloseLine } from 'react-icons/ri'

import IconButton from 'components/form/IconButton'
import Flex from 'components/ui/Flex'

const drawerContentClasses = 'animate-drawer-content flex flex-col md:w-[700px] w-full bg-zinc-800 h-full outline-none'

const drawerOverlayClasses = 'animate-modal-overlay fixed inset-0 z-40 bg-zinc-900/80'

const Drawer: React.FC<DrawerProps> = ({ children, onOpenChange, opened, title, trigger }) => {
  return (
    <Root open={opened} onOpenChange={onOpenChange}>
      {trigger ? <Trigger asChild>{trigger}</Trigger> : null}
      <Portal>
        <Overlay className={drawerOverlayClasses}>
          <Content className={drawerContentClasses}>
            <Flex
              as="header"
              alignItems="center"
              justifyContent="between"
              className="border-b border-black/10 bg-zinc-900 py-2 pl-3 pr-2 font-bold"
            >
              <Title>{title}</Title>
              <Close asChild>
                <IconButton tooltip="Close" icon={RiCloseLine} className="rounded-full p-1" />
              </Close>
            </Flex>
            <div className="grow overflow-y-auto py-2 px-3">{children}</div>
          </Content>
        </Overlay>
      </Portal>
    </Root>
  )
}

export default Drawer

interface DrawerProps {
  children: React.ReactNode
  onOpenChange: (opened: boolean) => void
  opened: boolean
  title: string
  trigger?: React.ReactNode
}
