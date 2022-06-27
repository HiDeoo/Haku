import dynamic from 'next/dynamic'

import { type NoteProps } from 'components/note/Note'
import { Spinner } from 'components/ui/Spinner'
import { useContentId } from 'hooks/useContentId'

const Note = dynamic<NoteProps>(
  import('components/note/Note').then((module) => module.Note),
  {
    loading: () => <Spinner delay className="my-auto h-10 w-10 self-center" />,
  }
)

const NotePage: Page = () => {
  const { contentId, isReady } = useContentId()

  if (!isReady) {
    return null
  }

  if (!contentId) {
    throw new Error('Missing ID to render a note.')
  }

  return <Note key={contentId} id={contentId} />
}

export default NotePage
