import dynamic from 'next/dynamic'

import Spinner from 'components/Spinner'

const Todo = dynamic(import('components/Todo'), {
  loading: () => <Spinner delay className="my-auto h-10 w-10 self-center" />,
})

const TodoPage: Page = () => {
  return <Todo />
}

export default TodoPage
