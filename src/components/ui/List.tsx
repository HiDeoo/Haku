import IconButton, { type IconButtonProps } from 'components/form/IconButton'
import Shimmer from 'components/ui/Shimmer'
import clst from 'styles/clst'

const itemClasses = clst(
  'flex items-center justify-between gap-3 px-3 py-3 bg-zinc-700/40',
  'border border-zinc-900 border-b-0 last:border-b first:rounded-t-lg last:rounded-b-lg',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset'
)
const shimmerClasses = clst(itemClasses, 'min-h-[2.8125rem] block')

const List: ListComponent = ({ children, className, isLoading, shimmerClassNames, shimmerItemCount, title }) => {
  return (
    <div className={className}>
      {title ? <h1 className="mb-1.5 ml-0.5 text-lg">{title}</h1> : null}
      <div>
        {isLoading
          ? Array.from({ length: shimmerItemCount }).map((_, index) => (
              <Shimmer key={`shimmer-${index}`} className={shimmerClasses}>
                <Shimmer.Line className={shimmerClassNames[index]} />
              </Shimmer>
            ))
          : children}
      </div>
    </div>
  )
}

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
  return (
    <IconButton
      {...props}
      iconClassName="h-5 w-5"
      pressedClassName="bg-zinc-900/75 hover:bg-zinc-900/75"
      className="rounded-full bg-transparent p-1 hover:bg-zinc-800"
    />
  )
}

List.Button = ListButton

type ListComponent = React.FC<ListProps> & {
  Item: typeof ListItem
  Button: typeof ListButton
}

interface ListProps {
  children: React.ReactNode
  className?: string
  isLoading?: boolean
  shimmerClassNames: string[]
  shimmerItemCount: number
  title?: string
}

interface ListItemProps {
  children: React.ReactNode | ((itemProps: { className: string }) => JSX.Element)
  className?: string
}

type ListButtonProps = Omit<IconButtonProps, 'className' | 'pressedClassName'>