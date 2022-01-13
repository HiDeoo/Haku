import dynamic from 'next/dynamic'

import Spinner from 'components/Spinner'

const Note = dynamic(import('components/Note'), {
  loading: () => <Spinner delay className="h-10 w-10 self-center my-auto" />,
})

const NotePage: Page = () => {
  return <Note />
}

export default NotePage
