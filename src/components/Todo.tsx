import { selectAtom, useAtomValue, useResetAtom, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { resetTodoAtomsAtom, todoChildrenAtom, TodoEditorState, todoEditorStateAtom, todoNodesAtom } from 'atoms/todos'
import Flex from 'components/Flex'
import Shimmer from 'components/Shimmer'
import TodoNavbar from 'components/TodoNavbar'
import TodoNodeChildren from 'components/TodoNodeChildren'
import { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS } from 'components/TodoNodeItem'
import useNavigationPrompt from 'hooks/useNavigationPrompt'
import useRouteChange from 'hooks/useRouteChange'
import useTodo from 'hooks/useTodo'
import { TodoContext, todoNodeContentRefs } from 'hooks/useTodoNode'
import { type TodoMetadata } from 'libs/db/todo'

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

function pristineStateSelector(state: TodoEditorState) {
  return state.pristine
}

const Todo: React.FC<TodoProps> = ({ id }) => {
  const pristine = useAtomValue(selectAtom(todoEditorStateAtom, pristineStateSelector))
  const resetTodoAtoms = useResetAtom(resetTodoAtomsAtom)

  const setTodoChildren = useUpdateAtom(todoChildrenAtom)
  const setTodoNodes = useUpdateAtom(todoNodesAtom)

  useNavigationPrompt(!pristine)

  const { isLoading } = useTodo(id, {
    enabled: pristine,
    onSuccess: ({ children, nodes }) => {
      setTodoChildren(children)
      setTodoNodes(nodes)
    },
  })

  useEffect(() => {
    return () => {
      todoNodeContentRefs.clear()
    }
  }, [])

  useRouteChange(() => {
    resetTodoAtoms()
  })

  return (
    <Flex direction="col" fullHeight className="overflow-hidden">
      <TodoNavbar disabled={isLoading} todoId={id} />
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
          <Flex fullHeight fullWidth direction="col" className="overflow-y-auto">
            <TodoNodeChildren />
          </Flex>
        </TodoContext.Provider>
      )}
    </Flex>
  )
}

export default Todo

interface TodoProps {
  id: TodoMetadata['id']
}
