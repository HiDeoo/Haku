import { selectAtom, useAtomCallback, useAtomValue, useResetAtom, useUpdateAtom } from 'jotai/utils'
import { useCallback, useContext, useEffect, useRef } from 'react'

import { resetTodoAtomsAtom, type TodoEditorState, todoEditorStateAtom, todoFocusMapAtom } from 'atoms/todo'
import { todoNodeChildrenAtom, todoNodeNodesAtom } from 'atoms/todoNode'
import TodoNavbar from 'components/todo/TodoNavbar'
import TodoNodeChildren from 'components/todo/TodoNodeChildren'
import { type TodoNodeItemHandle } from 'components/todo/TodoNodeItem'
import Flex from 'components/ui/Flex'
import Shimmer from 'components/ui/Shimmer'
import { TODO_SHIMMER_CLASSES_AND_LEVELS } from 'constants/shimmer'
import { TODO_NODE_ITEM_SHORTCUTS } from 'constants/shortcut'
import { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS } from 'constants/ui'
import useLocalShortcuts from 'hooks/useLocalShortcuts'
import useNavigationPrompt from 'hooks/useNavigationPrompt'
import useRouteChange from 'hooks/useRouteChange'
import { TodoContext, todoNodeContentRefs } from 'hooks/useTodoNode'
import useTodoQuery from 'hooks/useTodoQuery'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodeData } from 'libs/db/todoNodes'

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

  useLocalShortcuts(TODO_NODE_ITEM_SHORTCUTS)

  const { isLoading } = useTodoQuery(id, {
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

  const focusTodoNode = useCallback(() => {
    requestAnimationFrame(async () => {
      const focusedTodoNodeId = await getFocusedTodoNode()
      const focusedTodoNode: TodoNodeItemHandle | undefined = focusedTodoNodeId
        ? todoNodeItems.get(focusedTodoNodeId)
        : todoNodeItems.values().next().value

      focusedTodoNode?.focusContent()
      focusedTodoNode?.scrollIntoView()
    })
  }, [getFocusedTodoNode, todoNodeItems])

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

      focusTodoNode()
    },
    [focusTodoNode, todoNodeItems]
  )

  const setTodoFocus = useCallback(
    (todoNodeId: TodoNodeData['id']) => {
      setFocusedTodoNodes((prevFocusedTodoNodes) => ({ ...prevFocusedTodoNodes, [id]: todoNodeId }))
    },
    [id, setFocusedTodoNodes]
  )

  return (
    <Flex direction="col" fullHeight className="overflow-hidden">
      <TodoNavbar disabled={isLoading} todoId={id} focusTodoNode={focusTodoNode} />
      {isLoading ? (
        <Shimmer>
          {TODO_SHIMMER_CLASSES_AND_LEVELS.map(([shimmerClass, shimmerLevel], index) => (
            <Shimmer.Line
              key={index}
              className={shimmerClass}
              style={{ paddingLeft: shimmerLevel * TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS }}
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
