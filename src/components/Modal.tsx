import { Close, Content, Overlay, Portal, Root, Trigger } from '@radix-ui/react-dialog'
import { RiCloseLine } from 'react-icons/ri'

import Flex from 'components/Flex'
import Button from 'components/Button'
import IconButton from 'components/IconButton'

const Modal: ModalComponent = ({ children, disabled, opened, setOpened, title, trigger }) => {
  function onCloseInteraction(event: KeyboardEvent | CustomEvent) {
    if (disabled) {
      event.preventDefault()
    }
  }

  return (
    <Root open={opened} onOpenChange={setOpened}>
      {trigger ? <Trigger asChild>{trigger}</Trigger> : null}
      <Portal>
        <Overlay className="z-40 fixed inset-0 flex flex-col  p-10 animate-modal-overlay overflow-y-auto bg-zinc-900/80">
          <Content
            onEscapeKeyDown={onCloseInteraction}
            onInteractOutside={onCloseInteraction}
            onPointerDownOutside={onCloseInteraction}
            className="z-50 m-auto outline-none min-w-[400px] max-w-[75%] animate-modal-content bg-zinc-800 rounded-md shadow shadow-black/75"
          >
            <Flex
              as="header"
              alignItems="center"
              justifyContent="between"
              className="p-0 pl-4 pr-2 py-2.5 bg-zinc-900 border-b border-black/10 font-bold"
            >
              {title}
              <Close asChild>
                <IconButton
                  tabIndex={-1}
                  tooltip="Close"
                  icon={RiCloseLine}
                  disabled={disabled}
                  className="rounded-full !p-1 !ml-2.5"
                />
              </Close>
            </Flex>
            <div className="p-4 pt-3">{children}</div>
          </Content>
        </Overlay>
      </Portal>
    </Root>
  )
}

const Footer: React.FC<Pick<Props, 'disabled'>> = ({ children, disabled }) => {
  return (
    <Flex justifyContent="end" className="pt-4">
      <Close asChild>
        <Button disabled={disabled}>Close</Button>
      </Close>
      {children}
    </Flex>
  )
}

Modal.Footer = Footer

export default Modal

type ModalComponent = React.FC<Props> & {
  Footer: typeof Footer
}

export interface ControlledModalProps {
  opened: boolean
  setOpened: (open: boolean) => void
}

interface Props extends Partial<ControlledModalProps> {
  disabled?: boolean
  title: string
  trigger?: React.ReactNode
}
