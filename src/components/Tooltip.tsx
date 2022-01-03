import { Arrow, Content, Root, Trigger } from '@radix-ui/react-tooltip'

const Tooltip: React.FC<Props> = ({ children, content }) => {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Content className="px-2 py-1 rounded text-xs font-semibold bg-zinc-100 text-zinc-900 animate-tooltip">
        {content}
        <Arrow offset={5} width={11} height={5} className="fill-zinc-100" />
      </Content>
    </Root>
  )
}

export default Tooltip

interface Props {
  content: React.ReactNode
}
