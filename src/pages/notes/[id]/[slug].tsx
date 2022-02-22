import dynamic from 'next/dynamic'

import Spinner from 'components/ui/Spinner'
import useContentId from 'hooks/useContentId'

const Note = dynamic(import('components/note/Note'), {
  loading: () => <Spinner delay className="my-auto h-10 w-10 self-center" />,
})

const NotePage: Page = () => {
  const contentId = useContentId()

  if (!contentId) {
    throw new Error('Missing ID to render a note.')
  }

  return <Note key={contentId} id={contentId} />
}

export default NotePage
