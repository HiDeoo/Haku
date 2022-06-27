import { Flex } from 'components/ui/Flex'

export const Box: BoxComponent = ({ children, details, title }) => {
  return (
    <div className="w-full md:w-96">
      {title ? <h1 className="mb-1.5 ml-0.5 truncate text-lg">{title}</h1> : null}
      {details ? <div className="mb-3 ml-0.5 flex flex-col gap-2">{details}</div> : null}
      <div className="rounded-lg border border-zinc-900 bg-zinc-700/40 px-3 pt-2 pb-3">{children}</div>
    </div>
  )
}

const Footer: React.FC<FooterProps> = ({ children }) => {
  return (
    <Flex justifyContent="end" className="pt-1">
      {children}
    </Flex>
  )
}

Box.Footer = Footer

type BoxComponent = React.FC<BoxProps> & {
  Footer: typeof Footer
}

interface BoxProps {
  children: React.ReactNode
  details?: React.ReactNode
  title?: string
}

interface FooterProps {
  children: React.ReactNode
}
