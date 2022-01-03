import clsx from 'clsx'

import Flex from 'components/Flex'

const Shimmer: ShimmerComponent = ({ children }) => {
  return (
    <Flex direction="col" className="h-full w-full p-2.5 gap-3">
      {children}
    </Flex>
  )
}

const Line: React.FC<LineProps> = ({ className, style }) => {
  const lineClasses = clsx('bg-zinc-400/[.15] w-full h-3.5 py-2.5 motion-safe:animate-pulse', className)

  return (
    <div style={style}>
      <div className={lineClasses} />
    </div>
  )
}

Shimmer.Line = Line

export default Shimmer

type ShimmerComponent = React.FC & {
  Line: typeof Line
}

interface LineProps {
  className?: string
  style?: React.HtmlHTMLAttributes<HTMLElement>['style']
}
