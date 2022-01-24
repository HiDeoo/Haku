import dynamic from 'next/dynamic'

import Spinner from 'components/Spinner'

const Todo = dynamic(import('components/Todo'), {
  loading: () => <Spinner delay className="h-10 w-10 self-center my-auto" />,
})

const TodoPage: Page = () => {
  return <Todo />
}

export default TodoPage
