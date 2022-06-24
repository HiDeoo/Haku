import { forwardRef } from 'react'

import IconButton, { type IconButtonProps } from 'components/form/IconButton'
import Shimmer from 'components/ui/Shimmer'
import clst from 'styles/clst'

export const LIST_BUTTON_CLASSES = 'rounded-full bg-transparent hover:bg-zinc-800'
export const LIST_BUTTON_PRESSED_CLASSES = 'bg-zinc-900/75 hover:bg-zinc-900/75'

const itemClasses = clst(
  'flex items-center justify-between gap-3 p-3 bg-zinc-700/40',
  'border border-zinc-900 border-b-0 last:border-b first:rounded-t-lg last:rounded-b-lg',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset'
)
const shimmerClasses = clst(itemClasses, 'min-h-[2.8125rem] block')

const List = forwardRef(({ children, className, isLoading, shimmerClassNames, title, ...props }, forwardedRef) => {
  return (
    <div className={className}>
      {title ? <h1 className="mb-1.5 ml-0.5 truncate text-lg">{title}</h1> : null}
      <div ref={forwardedRef} {...props}>
        {isLoading && shimmerClassNames
          ? Array.from({ length: shimmerClassNames.length }).map((_, index) => (
              <Shimmer key={`shimmer-${index}`} className={shimmerClasses}>
                <Shimmer.Line className={shimmerClassNames[index]} />
              </Shimmer>
            ))
          : children}
      </div>
    </div>
  )
}) as ListComponent

List.displayName = 'List'

export default List

const ListItem: React.FC<ListItemProps> = ({ children, className }) => {
  const itemsProps = { className: clst(itemClasses, className) }

  if (typeof children === 'function') {
    return children(itemsProps)
  }

  return <div {...itemsProps}>{children}</div>
}

List.Item = ListItem

const ListButton: React.FC<ListButtonProps> = (props) => {
  return <IconButton {...props} className={LIST_BUTTON_CLASSES} pressedClassName={LIST_BUTTON_PRESSED_CLASSES} />
}

List.Button = ListButton

export type ListComponent = React.ForwardRefExoticComponent<ListProps & React.RefAttributes<HTMLDivElement>> & {
  Item: typeof ListItem
  Button: typeof ListButton
}

interface ListProps {
  children: React.ReactNode
  className?: string
  isLoading?: boolean
  shimmerClassNames?: string[]
  title?: string
}

interface ListItemProps {
  children: React.ReactNode | ((itemProps: { className: string }) => JSX.Element)
  className?: string
}

type ListButtonProps = Omit<IconButtonProps, 'className' | 'iconClassName' | 'pressedClassName'>
