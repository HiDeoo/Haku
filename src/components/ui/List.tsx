import Shimmer from 'components/ui/Shimmer'
import clst from 'styles/clst'

const itemClasses = clst(
  'flex items-center justify-between gap-3 px-3 py-3 bg-zinc-700/40',
  'border border-zinc-900 border-b-0 last:border-b first:rounded-t-lg last:rounded-b-lg',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset'
)
const shimmerClasses = clst(itemClasses, 'min-h-[2.8125rem] block')

const List: ListComponent = ({ children, isLoading, shimmerClassnames, shimmerItemCount, title }) => {
  return (
    <>
      {title ? <h1 className="mb-1.5 ml-0.5 text-lg">{title}</h1> : null}
      <div>
        {isLoading
          ? Array.from({ length: shimmerItemCount }).map((_, index) => (
              <Shimmer key={`shimmer-${index}`} className={shimmerClasses}>
                <Shimmer.Line className={shimmerClassnames[index]} />
              </Shimmer>
            ))
          : children}
      </div>
    </>
  )
}

export default List

const ListItem: React.FC<ListItemProps> = ({ children }) => {
  const itemsProps = { className: itemClasses }

  if (typeof children === 'function') {
    return children(itemsProps)
  }

  return <div {...itemsProps}>{children}</div>
}

List.Item = ListItem

type ListComponent = React.FC<ListProps> & {
  Item: typeof ListItem
}

interface ListProps {
  children: React.ReactNode
  isLoading?: boolean
  shimmerClassnames: string[]
  shimmerItemCount: number
  title?: string
}

interface ListItemProps {
  children: React.ReactNode | ((itemProps: { className: string }) => JSX.Element)
}
