import { TodoNodeStatus } from '@prisma/client'
import { memo } from 'react'
import IconAddLine from '~icons/ri/add-line'
import IconCheckboxBlankCircleFill from '~icons/ri/checkbox-blank-circle-fill'
import IconCheckboxBlankCircleLine from '~icons/ri/checkbox-blank-circle-line'
import IconSubtractLine from '~icons/ri/subtract-line'

import { type AtomParamsWithParentId } from 'atoms/todoNode'
import { Button } from 'components/form/Button'
import { Icon } from 'components/ui/Icon'
import { type TodoNodeData } from 'libs/db/todoNodes'
import { clst } from 'styles/clst'
import styles from 'styles/TodoNodeItem.module.css'

export const TodoNodeHandle = memo(({ collapsed, hasChildren, id, status, toggleCollapsed }: TodoNodeHandleProps) => {
  const buttonClasses = clst(
    styles['handle'],
    'relative m-0 min-w-0 shrink-0 p-0 last-of-type:mr-1 py-1 pr-1',
    'bg-transparent text-zinc-300 shadow-none rounded-none',
    'hover:bg-inherit disabled:opacity-100 disabled:cursor-default disabled:bg-transparent',
    status === TodoNodeStatus.COMPLETED && 'text-zinc-400',
    status === TodoNodeStatus.CANCELLED && 'text-zinc-500'
  )

  const circleBaseClasses = hasChildren && 'group-hover:invisible'

  const circleClasses = clst('h-[0.45rem] w-[0.45rem]', circleBaseClasses)

  const collapsedCircleClasses = clst(
    'absolute h-[0.93rem] w-[0.93rem] top-[0.02rem] -left-1 group-hover:invisible',
    circleBaseClasses
  )

  const actionClasses = clst('absolute h-4 w-4 -left-1 -top-0 hidden group-hover:inline')

  function handlePress() {
    toggleCollapsed({ id })
  }

  return (
    <Button
      onPress={handlePress}
      aria-label={'tooltip'}
      disabled={!hasChildren}
      className={buttonClasses}
      pressedClassName={'pressedButtonClasses'}
    >
      {collapsed ? <Icon icon={IconCheckboxBlankCircleLine} className={collapsedCircleClasses} /> : null}
      <Icon icon={IconCheckboxBlankCircleFill} className={circleClasses} />
      {hasChildren ? <Icon icon={collapsed ? IconAddLine : IconSubtractLine} className={actionClasses} /> : null}
    </Button>
  )
})

TodoNodeHandle.displayName = 'TodoNodeHandle'

interface TodoNodeHandleProps {
  collapsed: boolean
  hasChildren: boolean
  id: TodoNodeData['id']
  status: TodoNodeStatus
  toggleCollapsed: (update: AtomParamsWithParentId) => void
}
