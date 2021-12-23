import clsx from 'clsx'
import { type PropsWithChildren, type ElementType } from 'react'

const Flex = <Element extends ElementType = 'div'>({
  alignItems,
  as,
  children,
  className,
  direction = 'row',
  flex,
  fullHeight,
  fullWidth,
  justifyContent,
}: PropsWithChildren<Props<Element>>) => {
  const Element = as || 'div'

  const classes = clsx(
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

  return <Element className={classes}>{children}</Element>
}

export default Flex

interface Props<Element extends ElementType> {
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  as?: Element
  className?: string
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse'
  flex?: true | 'auto' | 'initial' | 'none'
  fullHeight?: boolean
  fullWidth?: boolean
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
}
