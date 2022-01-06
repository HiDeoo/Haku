import { Close, Content, Overlay, Portal, Root, Trigger } from '@radix-ui/react-dialog'
import { RiCloseLine } from 'react-icons/ri'

import Flex from 'components/Flex'
import Button from 'components/Button'
import IconButton from 'components/IconButton'
import clst from 'styles/clst'

const Modal: ModalComponent = ({ children, contentClassName, disabled, onOpenChange, opened, title, trigger }) => {
  function onCloseInteraction(event: KeyboardEvent | CustomEvent) {
    if (disabled) {
      event.preventDefault()
    }
  }

  const contentClasses = clst(
    'z-50 m-auto outline-none min-w-[400px] max-w-[75%] animate-modal-content bg-zinc-800 rounded-md shadow shadow-black/75',
    contentClassName
  )

  return (
    <Root open={opened} onOpenChange={onOpenChange}>
      {trigger ? <Trigger asChild>{trigger}</Trigger> : null}
      <Portal>
        <Overlay className="z-40 fixed inset-0 flex flex-col  p-10 animate-modal-overlay overflow-y-auto bg-zinc-900/80">
          <Content
            className={contentClasses}
            onEscapeKeyDown={onCloseInteraction}
            onInteractOutside={onCloseInteraction}
            onPointerDownOutside={onCloseInteraction}
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
                  className="rounded-full p-1 ml-2.5"
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

const Footer: React.FC<FooterProps> = ({ children, closeText = 'Close', disabled }) => {
  return (
    <Flex justifyContent="end" className="pt-4">
      <Close asChild>
        <Button disabled={disabled}>{closeText}</Button>
      </Close>
      {children}
    </Flex>
  )
}

Modal.Footer = Footer

export default Modal

type ModalComponent = React.FC<ModalProps> & {
  Footer: typeof Footer
}

export interface ModalProps {
  contentClassName?: string
  disabled?: boolean
  opened: boolean
  onOpenChange: (opened: boolean) => void
  title: string
  trigger?: React.ReactNode
}

interface FooterProps extends Pick<ModalProps, 'disabled'> {
  closeText?: string
}
