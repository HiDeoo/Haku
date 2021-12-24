import { Cross2Icon } from '@radix-ui/react-icons'
import { Close, Content, Overlay, Portal, Root, Trigger } from '@radix-ui/react-dialog'
import { type ReactNode } from 'react'

import Flex from 'components/Flex'
import Button from 'components/Button'
import IconButton from 'components/IconButton'
import styles from 'styles/Modal.module.css'

const Modal: ModalComponent = ({ children, title, trigger }) => {
  return (
    <Root>
      <Trigger asChild>{trigger}</Trigger>
      <Portal>
        <Overlay className={styles.overlay} />
        <Content className={styles.contentContainer}>
          <Flex as="header" justifyContent="between" alignItems="center" className={styles.header}>
            {title}
            <Close asChild>
              <IconButton className={styles.close} tabIndex={-1}>
                <Cross2Icon />
              </IconButton>
            </Close>
          </Flex>
          <div className={styles.content}>{children}</div>
        </Content>
      </Portal>
    </Root>
  )
}

const Footer: React.FC = ({ children }) => {
  return (
    <Flex justifyContent="end" className={styles.footer}>
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
  trigger: ReactNode
}
