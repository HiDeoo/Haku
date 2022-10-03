import { Children, cloneElement, isValidElement } from 'react'

import { Flex, type FlexProps } from 'components/ui/Flex'
import { useDelay } from 'hooks/useDelay'
import { clst } from 'styles/clst'

const shimmerChildrenOpacityMap: Record<number, string> = {
  0: 'opacity-100',
  1: 'opacity-100',
  2: 'opacity-90',
  3: 'opacity-90',
  4: 'opacity-80',
  5: 'opacity-80',
  6: 'opacity-60',
  7: 'opacity-60',
  8: 'opacity-40',
  9: 'opacity-40',
}

export const Shimmer = ({ children, className }: ShimmerProps) => {
  const pastDelay = useDelay()

  const shimmerClasses = clst('h-full w-full select-none gap-2.5 p-2.5', className)

  return (
    <Flex direction="col" className={shimmerClasses}>
      {pastDelay
        ? Children.map(children, (child, index) => {
            if (!isValidElement(child)) {
              return null
            }

            return cloneElement(child, {
              ...child.props,
              containerClassName: shimmerChildrenOpacityMap[index] ?? 'opacity-20',
            })
          })
        : null}
    </Flex>
  )
}

const Line = ({ className, containerClassName, style }: LineProps) => {
  const lineClasses = clst('bg-zinc-400/10 w-full h-3.5 py-2.5 motion-safe:animate-pulse', className)

  return (
    <div style={style} className={containerClassName}>
      <div className={lineClasses} />
    </div>
  )
}

Shimmer.Line = Line

interface ShimmerProps {
  children: React.ReactNode
  className?: string
}

interface LineProps {
  className?: string
  containerClassName?: string
  style?: FlexProps['style']
}
