import { useAtomValue, useSetAtom } from 'jotai'
import { selectAtom, useAtomCallback, useResetAtom } from 'jotai/utils'
import { useCallback, useContext, useEffect, useRef } from 'react'

import { resetTodoAtomsAtom, type TodoEditorState, todoEditorStateAtom, todoFocusMapAtom } from 'atoms/todo'
import { todoNodeChildrenAtom, todoNodeNodesAtom } from 'atoms/todoNode'
import Title from 'components/app/Title'
import ImageModal from 'components/editor/ImageModal'
import TodoNavbar from 'components/todo/TodoNavbar'
import TodoNodeChildren from 'components/todo/TodoNodeChildren'
import { type TodoNodeItemHandle } from 'components/todo/TodoNodeItem'
import Flex from 'components/ui/Flex'
import Offline from 'components/ui/Offline'
import Shimmer from 'components/ui/Shimmer'
import { TODO_SHIMMER_CLASSES_AND_LEVELS } from 'constants/shimmer'
import { TODO_NODE_ITEM_SHORTCUTS } from 'constants/shortcut'
import { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS } from 'constants/ui'
import useLocalShortcuts from 'hooks/useLocalShortcuts'
import useNavigationPrompt from 'hooks/useNavigationPrompt'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import useRouteChange from 'hooks/useRouteChange'
import { TodoContext, todoNodeContentRefs } from 'hooks/useTodoNode'
import useTodoQuery from 'hooks/useTodoQuery'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodeData } from 'libs/db/todoNodes'

function pristineStateSelector(state: TodoEditorState) {
  return state.pristine
}

const Todo: React.FC<TodoProps> = ({ id }) => {
  const { offline } = useNetworkStatus()

  const didFocusOnMount = useRef<boolean>(false)

  const todoNodeItems = useContext(TodoContext)

  const pristine = useAtomValue(selectAtom(todoEditorStateAtom, pristineStateSelector))
  const resetTodoAtoms = useResetAtom(resetTodoAtomsAtom)

  const getFocusedTodoNode = useAtomCallback(useCallback((get) => get(todoFocusMapAtom)[id], [id]))
  const setFocusedTodoNodes = useSetAtom(todoFocusMapAtom)

  const setTodoChildren = useSetAtom(todoNodeChildrenAtom)
  const setTodoNodes = useSetAtom(todoNodeNodesAtom)

  useNavigationPrompt(!pristine)

  useLocalShortcuts(TODO_NODE_ITEM_SHORTCUTS)

  const { data, isLoading } = useTodoQuery(id, {
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

  const focusTodoNode = useCallback(
    (scrollIntoView = true) => {
      requestAnimationFrame(async () => {
        const focusedTodoNodeId = await getFocusedTodoNode()
        const focusedTodoNode: TodoNodeItemHandle | undefined = focusedTodoNodeId
          ? todoNodeItems.get(focusedTodoNodeId)
          : todoNodeItems.values().next().value

        focusedTodoNode?.focusContent()

        if (scrollIntoView) {
          focusedTodoNode?.scrollIntoView()
        }
      })
    },
    [getFocusedTodoNode, todoNodeItems]
  )

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

  const isOfflineWithoutData = offline && isLoading && !data
  const disabled = isLoading || isOfflineWithoutData

  return (
    <>
      <Title pageTitle={data?.name} />
      <Flex direction="col" fullHeight className="overflow-hidden">
        <TodoNavbar todoId={id} disabled={disabled} todoName={data?.name} focusTodoNode={focusTodoNode} />
        {isOfflineWithoutData ? (
          <Offline />
        ) : isLoading ? (
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
          <>
            <TodoContext.Provider value={todoNodeContentRefs}>
              <Flex
                fullHeight
                fullWidth
                direction="col"
                className="overflow-y-auto supports-max:pb-[max(0px,env(safe-area-inset-bottom))]"
              >
                <TodoNodeChildren onFocusTodoNode={setTodoFocus} setTodoNodeItemRef={setTodoNodeItemRef} />
              </Flex>
            </TodoContext.Provider>
            <ImageModal />
          </>
        )}
      </Flex>
    </>
  )
}

export default Todo

interface TodoProps {
  id: TodoMetadata['id']
}
