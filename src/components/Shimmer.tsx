import Flex from 'components/Flex'
import useDelay from 'hooks/useDelay'
import clst from 'styles/clst'

const Shimmer: ShimmerComponent = ({ children }) => {
  const pastDelay = useDelay()

  return (
    <Flex direction="col" className="h-full w-full p-2.5 gap-3">
      {pastDelay ? children : null}
    </Flex>
  )
}

const Line: React.FC<LineProps> = ({ className, style }) => {
  const lineClasses = clst('bg-zinc-400/[.15] w-full h-3.5 py-2.5 motion-safe:animate-pulse', className)

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
