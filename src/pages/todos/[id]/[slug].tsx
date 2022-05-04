import dynamic from 'next/dynamic'

import Spinner from 'components/ui/Spinner'
import useContentId from 'hooks/useContentId'

const Todo = dynamic(import('components/todo/Todo'), {
  loading: () => <Spinner delay className="my-auto h-10 w-10 self-center" />,
})

const TodoPage: Page = () => {
  const { contentId, isReady } = useContentId()

  if (!isReady) {
    return null
  }

  if (!contentId) {
    throw new Error('Missing ID to render a todo.')
  }

  return <Todo key={contentId} id={contentId} />
}

export default TodoPage
