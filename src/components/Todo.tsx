import { selectAtom, useAtomCallback, useAtomValue, useResetAtom, useUpdateAtom } from 'jotai/utils'
import { useCallback, useContext, useEffect, useRef } from 'react'

import { resetTodoAtomsAtom, type TodoEditorState, todoEditorStateAtom, todoFocusMapAtom } from 'atoms/todo'
import { todoNodeChildrenAtom, todoNodeNodesAtom } from 'atoms/todoNode'
import Flex from 'components/Flex'
import Shimmer from 'components/Shimmer'
import TodoNavbar from 'components/TodoNavbar'
import TodoNodeChildren from 'components/TodoNodeChildren'
import { type TodoNodeItemHandle, TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS } from 'components/TodoNodeItem'
import useNavigationPrompt from 'hooks/useNavigationPrompt'
import useRouteChange from 'hooks/useRouteChange'
import useTodo from 'hooks/useTodo'
import { TodoContext, todoNodeContentRefs } from 'hooks/useTodoNode'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodeData } from 'libs/db/todoNodes'

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
  const didFocusOnMount = useRef<boolean>(false)

  const todoNodeItems = useContext(TodoContext)

  const pristine = useAtomValue(selectAtom(todoEditorStateAtom, pristineStateSelector))
  const resetTodoAtoms = useResetAtom(resetTodoAtomsAtom)

  const getFocusedTodoNode = useAtomCallback(useCallback((get) => get(todoFocusMapAtom)[id], [id]))
  const setFocusedTodoNodes = useUpdateAtom(todoFocusMapAtom)

  const setTodoChildren = useUpdateAtom(todoNodeChildrenAtom)
  const setTodoNodes = useUpdateAtom(todoNodeNodesAtom)

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

  const setTodoNodeItemRef = useCallback(
    async (id: TodoNodeData['id'], item: TodoNodeItemHandle | null) => {
      if (item) {
        todoNodeItems.set(id, item)
      } else {
        todoNodeItems.delete(id)
      }

      if (didFocusOnMount.current) {
        return
      }

      didFocusOnMount.current = true

      requestAnimationFrame(async () => {
        const focusedTodoNodeId = await getFocusedTodoNode()
        const focusedTodoNode: TodoNodeItemHandle | undefined = focusedTodoNodeId
          ? todoNodeItems.get(focusedTodoNodeId)
          : todoNodeItems.values().next().value

        focusedTodoNode?.focusContent()
        focusedTodoNode?.scrollIntoView()
      })
    },
    [getFocusedTodoNode, todoNodeItems]
  )

  const setTodoFocus = useCallback(
    (todoNodeId: TodoNodeData['id']) => {
      setFocusedTodoNodes((prevFocusedTodoNodes) => ({ ...prevFocusedTodoNodes, [id]: todoNodeId }))
    },
    [id, setFocusedTodoNodes]
  )

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
            <TodoNodeChildren onFocusTodoNode={setTodoFocus} setTodoNodeItemRef={setTodoNodeItemRef} />
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
