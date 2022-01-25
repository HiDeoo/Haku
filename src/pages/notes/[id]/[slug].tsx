import dynamic from 'next/dynamic'

import Spinner from 'components/Spinner'

const Note = dynamic(import('components/Note'), {
  loading: () => <Spinner delay className="my-auto h-10 w-10 self-center" />,
})

const NotePage: Page = () => {
  return <Note />
}

export default NotePage
