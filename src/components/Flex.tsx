import clsx from 'clsx'
import { forwardRef } from 'react'

const Flex = <Element extends React.ElementType = 'div'>(
  {
    alignItems,
    as,
    children,
    className,
    direction = 'row',
    flex,
    fullHeight,
    fullWidth,
    justifyContent,
    ...props
  }: React.PropsWithChildren<Props<Element>>,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const Element = as || 'div'

  const elementClasses = clsx(
    'flex',
    {
      'flex-row': direction === 'row',
      'flex-row-reverse': direction === 'row-reverse',
      'flex-col': direction === 'col',
      'flex-col-reverse': direction === 'col-reverse',
    },
    {
      'flex-1': flex === true,
      'flex-auto': flex === 'auto',
      'flex-initial': flex === 'initial',
      'flex-none': flex === 'none',
    },
    {
      'justify-start': justifyContent === 'start',
      'justify-end': justifyContent === 'end',
      'justify-center': justifyContent === 'center',
      'justify-between': justifyContent === 'between',
      'justify-around': justifyContent === 'around',
      'justify-evenly': justifyContent === 'evenly',
    },
    {
      'items-start': alignItems === 'start',
      'items-end': alignItems === 'end',
      'items-center': alignItems === 'center',
      'items-baseline': alignItems === 'baseline',
      'items-stretch': alignItems === 'stretch',
    },
    {
      'h-full': fullHeight,
      'w-full': fullWidth,
    },
    className
  )

  return (
    <Element ref={ref} className={elementClasses} {...props}>
      {children}
    </Element>
  )
}

export default forwardRef(Flex) as <Element extends React.ElementType = 'div'>(
  props: React.PropsWithChildren<Props<Element>> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReturnType<typeof Flex>

interface Props<Element extends React.ElementType> {
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  as?: Element
  className?: string
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse'
  flex?: true | 'auto' | 'initial' | 'none'
  fullHeight?: boolean
  fullWidth?: boolean
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
}
