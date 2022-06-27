import { Close, Content, DialogContentImplProps, Overlay, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { RiCloseLine } from 'react-icons/ri'

import { Button } from 'components/form/Button'
import { IconButton } from 'components/form/IconButton'
import { Flex } from 'components/ui/Flex'
import { clst } from 'styles/clst'

export const MODAL_CONTENT_CLASSES = clst(
  'z-50 my-auto xs:m-auto w-full xs:w-auto xs:min-w-[400px] xs:max-w-[75%] bg-zinc-800 rounded-md',
  'outline-none shadow shadow-black/75'
)

export const MODAL_OVERLAY_CLASSES =
  'animate-modal-overlay fixed inset-0 z-40 flex flex-col overflow-y-auto bg-zinc-900/80 p-4 md:p-10'

export const Modal: ModalComponent = ({
  children,
  className,
  contentClassName,
  disabled,
  onCloseAutoFocus,
  onOpenChange,
  opened,
  role,
  title,
  trigger,
}) => {
  function handleClose(event: KeyboardEvent | CustomEvent) {
    if (disabled) {
      event.preventDefault()
    }
  }

  const contentClasses = clst(MODAL_CONTENT_CLASSES, 'animate-modal-content', contentClassName)
  const childrenClasses = clst('p-4 pt-3', className)

  return (
    <Root open={opened} onOpenChange={onOpenChange}>
      {trigger ? <Trigger asChild>{trigger}</Trigger> : null}
      <Portal>
        <Overlay className={MODAL_OVERLAY_CLASSES}>
          <Content
            role={role}
            className={contentClasses}
            onEscapeKeyDown={handleClose}
            onInteractOutside={handleClose}
            onPointerDownOutside={handleClose}
            onCloseAutoFocus={onCloseAutoFocus}
          >
            <Flex
              as="header"
              alignItems="center"
              justifyContent="between"
              className="border-b border-black/10 bg-zinc-900 p-0 py-2.5 pl-4 pr-2 font-bold"
            >
              <Title>{title}</Title>
              <Close asChild>
                <IconButton
                  tabIndex={-1}
                  tooltip="Close"
                  icon={RiCloseLine}
                  disabled={disabled}
                  className="ml-2.5 rounded-full p-1"
                />
              </Close>
            </Flex>
            <div className={childrenClasses}>{children}</div>
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

type ModalComponent = React.FC<ModalProps> & {
  Footer: typeof Footer
}

export interface ModalProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  disabled?: boolean
  onCloseAutoFocus?: DialogContentImplProps['onCloseAutoFocus']
  onOpenChange: (opened: boolean) => void
  opened: boolean
  role?: React.HtmlHTMLAttributes<HTMLElement>['role']
  title: string
  trigger?: React.ReactNode
}

interface FooterProps extends Pick<ModalProps, 'disabled'> {
  children: React.ReactNode
  closeText?: string
}
