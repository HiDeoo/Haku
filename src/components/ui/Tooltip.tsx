import { Arrow, Content, Portal, Root, Trigger } from '@radix-ui/react-tooltip'

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content className="animate-tooltip z-40 rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-900">
          {content}
          <Arrow offset={5} width={11} height={5} className="fill-zinc-100" />
        </Content>
      </Portal>
    </Root>
  )
}

export default Tooltip

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
}
