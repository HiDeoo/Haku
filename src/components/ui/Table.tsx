import { Children, cloneElement, isValidElement } from 'react'

import clst from 'styles/clst'

const Table: TableComponent = ({ children }) => {
  return <table className="w-full table-auto">{children}</table>
}

export default Table

const TableHead: React.FC<TableBaseProps> = ({ children }) => {
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

const TableBody: React.FC<TableBaseProps> = ({ children }) => {
  return <tbody>{children}</tbody>
}

Table.Body = TableBody

const TableRow: React.FC<TableRowProps> = ({ children, inTableHead }) => {
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

const TableCell: React.FC<TableCellProps> = ({ children, className, inTableHead = false }) => {
  const Element = inTableHead ? 'th' : 'td'

  const cellClasses = clst('py-2 pr-2 text-left', className)

  return <Element className={cellClasses}>{children}</Element>
}

Table.Cell = TableCell

type TableComponent = React.FC<TableBaseProps> & {
  Body: typeof TableBody
  Cell: typeof TableCell
  Head: typeof TableHead
  Row: typeof TableRow
}

interface TableBaseProps {
  children: React.ReactNode
}

interface TableRowProps extends TableBaseProps {
  inTableHead?: boolean
}

interface TableCellProps extends TableRowProps {
  className?: string
}
