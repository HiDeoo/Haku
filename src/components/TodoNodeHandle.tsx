import { memo } from 'react'
import { RiCheckboxBlankCircleFill, RiCheckboxBlankCircleLine } from 'react-icons/ri'

import Icon from 'components/Icon'
import clst from 'styles/clst'

const TodoNodeHandle: React.FC<TodoNodeHandleProps> = ({ collapsed, completed }) => {
  const circleClasses = clst('mt-[0.57rem] mr-2 h-[0.45rem] w-[0.45rem] shrink-0 text-zinc-300', {
    'text-zinc-400': completed,
  })

  const collapsedCircleClasses = clst('absolute h-[0.9rem] w-[0.9rem] top-[0.35rem] -left-[0.23rem]', {
    'text-zinc-400': completed,
  })

  const circle = <Icon icon={RiCheckboxBlankCircleFill} className={circleClasses} />

  return collapsed ? (
    <div className="relative">
      <Icon icon={RiCheckboxBlankCircleLine} className={collapsedCircleClasses} />
      {circle}
    </div>
  ) : (
    circle
  )
}

export default memo(TodoNodeHandle)

interface TodoNodeHandleProps {
  collapsed: boolean
  completed: boolean
}
