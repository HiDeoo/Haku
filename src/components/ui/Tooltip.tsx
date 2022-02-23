import { Arrow, Content, Root, Trigger } from '@radix-ui/react-tooltip'

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Content className="animate-tooltip rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-900">
        {content}
        <Arrow offset={5} width={11} height={5} className="fill-zinc-100" />
      </Content>
    </Root>
  )
}

export default Tooltip

interface TooltipProps {
  content: React.StrictReactNode
}
