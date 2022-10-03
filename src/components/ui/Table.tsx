import { Children, cloneElement, isValidElement } from 'react'

import { clst } from 'styles/clst'

export const Table = ({ children }: TableProps) => {
  return <table className="w-full table-auto">{children}</table>
}

const TableHead = ({ children }: TableProps) => {
  return (
    <thead>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return null
        }

        return cloneElement(child, { ...child.props, inTableHead: true })
      })}
    </thead>
  )
}

Table.Head = TableHead

const TableBody = ({ children }: TableProps) => {
  return <tbody>{children}</tbody>
}

Table.Body = TableBody

const TableRow = ({ children, inTableHead }: TableRowProps) => {
  const rowClasses = clst('border-b border-zinc-600', !inTableHead && 'last-of-type:border-0')

  return (
    <tr className={rowClasses}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return null
        }

        return cloneElement(child, { ...child.props, inTableHead })
      })}
    </tr>
  )
}

Table.Row = TableRow

const TableCell = ({ children, className, inTableHead = false }: TableCellProps) => {
  const Element = inTableHead ? 'th' : 'td'

  const cellClasses = clst('py-2 pr-2 text-left', className)

  return <Element className={cellClasses}>{children}</Element>
}

Table.Cell = TableCell

interface TableProps {
  children: React.ReactNode
}

interface TableRowProps extends TableProps {
  inTableHead?: boolean
}

interface TableCellProps extends TableRowProps {
  className?: string
}
