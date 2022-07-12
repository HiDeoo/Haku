import { forwardRef, useMemo } from 'react'

import { clst } from 'styles/clst'

const FlexComponent = <TElement extends React.ElementType = 'div'>(
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
    wrap,
    ...props
  }: FlexProps<TElement>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>
) => {
  const Element = as ?? 'div'

  const elementClasses = useMemo(
    () =>
      clst(
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
        {
          'flex-wrap': wrap === true,
          'flex-wrap-reverse': wrap === 'reverse',
        },
        className
      ),
    [direction, flex, justifyContent, alignItems, fullHeight, fullWidth, wrap, className]
  )

  return (
    <Element ref={forwardedRef} className={elementClasses} {...props}>
      {children}
    </Element>
  )
}

export const Flex = forwardRef(FlexComponent) as <TElement extends React.ElementType = 'div'>(
  props: FlexProps<TElement> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReturnType<typeof FlexComponent>

interface FlexProps<TElement extends React.ElementType> {
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  as?: TElement
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse'
  flex?: true | 'auto' | 'initial' | 'none'
  fullHeight?: boolean
  fullWidth?: boolean
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  id?: React.HtmlHTMLAttributes<HTMLElement>['id']
  role?: React.HtmlHTMLAttributes<HTMLElement>['role']
  style?: React.HtmlHTMLAttributes<HTMLElement>['style']
  wrap?: true | 'reverse'
}
