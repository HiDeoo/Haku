import { memo } from 'react'
import { RiAddLine, RiCheckboxBlankCircleFill, RiCheckboxBlankCircleLine, RiSubtractLine } from 'react-icons/ri'

import { type AtomParamsWithParentId } from 'atoms/todoNode'
import Button from 'components/form/Button'
import Icon from 'components/ui/Icon'
import { type TodoNodeData } from 'libs/db/todoNodes'
import clst from 'styles/clst'

const TodoNodeHandle: React.FC<TodoNodeHandleProps> = ({ collapsed, completed, hasChildren, id, toggleCollapsed }) => {
  const buttonClasses = clst(
    'relative m-0 min-w-0 shrink-0 bg-transparent p-0 text-zinc-300 shadow-none last-of-type:mr-1 rounded-none py-1 pr-1',
    'hover:bg-inherit disabled:opacity-100 disabled:cursor-default disabled:bg-transparent',
    { 'text-zinc-400': completed }
  )

  const circleBaseClasses = { 'group-hover:invisible': hasChildren }

  const circleClasses = clst('h-[0.45rem] w-[0.45rem]', circleBaseClasses)

  const collapsedCircleClasses = clst(
    'absolute h-[0.93rem] w-[0.93rem] top-[0.02rem] -left-1 group-hover:invisible',
    circleBaseClasses
  )

  const actionClasses = clst('absolute h-4 w-4 -left-1 -top-0 hidden group-hover:inline')

  function onPress() {
    toggleCollapsed({ id })
  }

  return (
    <Button
      onPress={onPress}
      aria-label={'tooltip'}
      disabled={!hasChildren}
      className={buttonClasses}
      pressedClassName={'pressedButtonClasses'}
    >
      {collapsed ? <Icon icon={RiCheckboxBlankCircleLine} className={collapsedCircleClasses} /> : null}
      <Icon icon={RiCheckboxBlankCircleFill} className={circleClasses} />
      {hasChildren ? <Icon icon={collapsed ? RiAddLine : RiSubtractLine} className={actionClasses} /> : null}
    </Button>
  )
}

export default memo(TodoNodeHandle)

interface TodoNodeHandleProps {
  collapsed: boolean
  completed: boolean
  hasChildren: boolean
  id: TodoNodeData['id']
  toggleCollapsed: (update: AtomParamsWithParentId) => void
}
