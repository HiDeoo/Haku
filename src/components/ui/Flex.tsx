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
        direction === 'row' && 'flex-row',
        direction === 'row-reverse' && 'flex-row-reverse',
        direction === 'col' && 'flex-col',
        direction === 'col-reverse' && 'flex-col-reverse',
        flex === true && 'flex-1',
        flex === 'auto' && 'flex-auto',
        flex === 'initial' && 'flex-initial',
        flex === 'none' && 'flex-none',
        justifyContent === 'start' && 'justify-start',
        justifyContent === 'end' && 'justify-end',
        justifyContent === 'center' && 'justify-center',
        justifyContent === 'between' && 'justify-between',
        justifyContent === 'around' && 'justify-around',
        justifyContent === 'evenly' && 'justify-evenly',
        alignItems === 'start' && 'items-start',
        alignItems === 'end' && 'items-end',
        alignItems === 'center' && 'items-center',
        alignItems === 'baseline' && 'items-baseline',
        alignItems === 'stretch' && 'items-stretch',
        fullHeight && 'h-full',
        fullWidth && 'w-full',
        wrap === true && 'flex-wrap',
        wrap === 'reverse' && 'flex-wrap-reverse',
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
  props: FlexProps<TElement> & React.RefAttributes<HTMLDivElement>
) => ReturnType<typeof FlexComponent>

export interface FlexProps<TElement extends React.ElementType = 'div'> {
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  as?: TElement
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse'
  flex?: true | 'auto' | 'initial' | 'none'
  fullHeight?: boolean
  fullWidth?: boolean
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  id?: React.ComponentPropsWithoutRef<'div'>['id']
  role?: React.ComponentPropsWithoutRef<'div'>['role']
  style?: React.ComponentPropsWithoutRef<'div'>['style']
  wrap?: true | 'reverse'
}
