import TodoNodeItem from 'components/TodoNodeItem'
import useContentId from 'hooks/useContentId'
import useTodo from 'hooks/useTodo'
import { StoreState, useStore } from 'stores'

const storeSelector = (state: StoreState) => [state.todoRoot, state.setTodoNodes] as const

const Todo: React.FC = () => {
  const [todoRoot, setTodoNodes] = useStore(storeSelector)

  const contentId = useContentId()
  const { isLoading } = useTodo(contentId, {
    onSuccess: (data) => {
      // TODO(HiDeoo)
      // enabled: editorState.pristine,

      setTodoNodes(data)
    },
  })

  if (isLoading) {
    // TODO(HiDeoo)
    return <div>Loading…</div>
  }

  return (
    <>
      {todoRoot.map((rootId) => (
        <TodoNodeItem key={rootId} id={rootId} />
      ))}
    </>
  )
}

export default Todo
