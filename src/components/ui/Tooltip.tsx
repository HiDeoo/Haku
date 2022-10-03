import { Arrow, Content, Portal, Root, Trigger } from '@radix-ui/react-tooltip'

export const Tooltip = ({ children, content }: TooltipProps) => {
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

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
}
