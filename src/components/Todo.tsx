import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'

import { todoChildrenAtom, todoNodesAtom } from 'atoms/todos'
import Flex from 'components/Flex'
import Shimmer from 'components/Shimmer'
import TodoNavbar from 'components/TodoNavbar'
import TodoNodeChildren from 'components/TodoNodeChildren'
import { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS } from 'components/TodoNodeItem'
import useContentId from 'hooks/useContentId'
import useTodo from 'hooks/useTodo'
import { TodoContext, todoNodeContentRefs } from 'hooks/useTodoNode'

const shimmerClassesAndLevels = [
  ['w-2/5', 0],
  ['w-11/12', 1],
  ['w-2/6', 1],
  ['w-10/12', 2],
  ['w-9/12', 3],
  ['w-8/12', 3],
  ['w-3/5', 2],
  ['w-3/6', 2],
  ['w-4/5', 0],
  ['w-10/12', 1],
  ['w-9/12', 0],
  ['w-4/6', 0],
  ['w-10/12', 1],
  ['w-11/12', 1],
  ['w-9/12', 2],
  ['w-4/6', 2],
] as const

const Todo: React.FC = () => {
  // TODO(HiDeoo)
  const [enabled, setEnabled] = useState(true)

  const setTodoChildren = useUpdateAtom(todoChildrenAtom)
  const setTodoNodes = useUpdateAtom(todoNodesAtom)

  const contentId = useContentId()
  const { isLoading } = useTodo(contentId, {
    // TODO(HiDeoo)
    enabled,
    onSuccess: ({ children, nodes }) => {
      // TODO(HiDeoo)
      setEnabled(false)

      setTodoChildren(children)
      setTodoNodes(nodes)
    },
  })

  useEffect(() => {
    return () => {
      todoNodeContentRefs.clear()
    }
  }, [])

  return (
    <Flex direction="col" fullHeight className="relative overflow-hidden">
      <TodoNavbar disabled={isLoading} todoId={contentId} />
      {isLoading ? (
        <Shimmer>
          {shimmerClassesAndLevels.map(([classes, level], index) => (
            <Shimmer.Line
              key={index}
              className={classes}
              style={{ paddingLeft: level * TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS }}
            />
          ))}
        </Shimmer>
      ) : (
        <TodoContext.Provider value={todoNodeContentRefs}>
          <div className="h-full w-full overflow-y-auto">
            <TodoNodeChildren />
          </div>
        </TodoContext.Provider>
      )}
    </Flex>
  )
}

export default Todo
