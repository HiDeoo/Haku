import { Arrow, Content, Root, Trigger } from '@radix-ui/react-tooltip'
import { type ReactNode } from 'react'

import styles from 'styles/Tooltip.module.css'

const Tooltip: React.FC<Props> = ({ children, content }) => {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Content className={styles.content}>
        {content}
        <Arrow offset={5} width={11} height={5} className={styles.arrow} />
      </Content>
    </Root>
  )
}

export default Tooltip

interface Props {
  content: ReactNode
}
