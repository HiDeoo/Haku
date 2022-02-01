import dynamic from 'next/dynamic'

import Spinner from 'components/Spinner'
import useContentId from 'hooks/useContentId'

const Note = dynamic(import('components/Note'), {
  loading: () => <Spinner delay className="my-auto h-10 w-10 self-center" />,
})

const NotePage: Page = () => {
  const contentId = useContentId()

  return <Note key={contentId} />
}

export default NotePage
