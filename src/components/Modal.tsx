import { Cross2Icon } from '@radix-ui/react-icons'
import { Close, Content, Overlay, Portal, Root, Trigger } from '@radix-ui/react-dialog'

import Flex from 'components/Flex'
import Button from 'components/Button'
import IconButton from 'components/IconButton'

const Modal: ModalComponent = ({ children, title, trigger }) => {
  return (
    <Root>
      <Trigger asChild>{trigger}</Trigger>
      <Portal>
        <Overlay className="z-40 fixed inset-0 flex flex-col  p-10 animate-modal-overlay overflow-y-auto bg-zinc-900/80">
          <Content className="z-50 m-auto outline-none min-w-[400px] max-w-[75%] animate-modal-content bg-zinc-800 rounded-md shadow shadow-black/75">
            <Flex
              as="header"
              alignItems="center"
              justifyContent="between"
              className="p-0 pl-4 pr-2 py-2.5 bg-zinc-900 border-b border-black/10 font-bold"
            >
              {title}
              <Close asChild>
                <IconButton className="rounded-full !p-1" tabIndex={-1}>
                  <Cross2Icon />
                </IconButton>
              </Close>
            </Flex>
            <div className="p-4 pt-3">{children}</div>
          </Content>
        </Overlay>
      </Portal>
    </Root>
  )
}

const Footer: React.FC = ({ children }) => {
  return (
    <Flex justifyContent="end" className="pt-4">
      <Close asChild>
        <Button>Close</Button>
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

interface Props {
  title: string
  trigger: React.ReactNode
}
