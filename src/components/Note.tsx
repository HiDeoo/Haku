import { useCallback, useRef, useState } from 'react'

import Flex from 'components/Flex'
import NoteInspector from 'components/NoteInspector'
import Shimmer from 'components/Shimmer'
import { type SyncStatus } from 'components/SyncReport'
import { EditorContent, useEditor } from 'hooks/useEditor'
import useNavigationPrompt from 'hooks/useNavigationPrompt'
import useNote from 'hooks/useNote'
import { type TodoMetadata } from 'libs/db/todo'
import { getToc, HeadingWithId, type ToC } from 'libs/editor'

const shimmerClasses = [
  'w-2/5 h-12',
  'w-11/12',
  'w-2/6 h-8',
  'w-10/12',
  'w-full',
  'w-full',
  'w-3/5',
  'w-3/6 h-8',
  'w-full',
  'w-10/12',
  'w-9/12',
  'w-full',
  'w-10/12',
  'w-11/12',
  'w-full',
  'w-4/6',
]

const anchorHeadingRegExp = /^#.*-(?<pos>\d+)$/

const Note: React.FC<NoteProps> = ({ id }) => {
  const editorRef = useRef<ReturnType<typeof useEditor>>(null)
  const [editorState, setEditorState] = useState<NoteEditorState>({ pristine: true })

  useNavigationPrompt(!editorState.pristine)

  const { data, isLoading } = useNote(id, { enabled: editorState.pristine })

  const updateToc = useCallback((emitUpdate = true) => {
    if (editorRef.current) {
      const toc = getToc(editorRef.current)

      setEditorState((prevEditorState) => ({ ...prevEditorState, pristine: !emitUpdate, toc }))
    }
  }, [])

  const onEditorCreate = useCallback(() => {
    if (location.hash.length !== 0) {
      const heading = document.querySelector(location.hash)

      if (heading) {
        const matches = anchorHeadingRegExp.exec(location.hash)
        const pos = matches?.groups?.pos

        if (editorRef.current && pos) {
          const headingPos = parseInt(pos, 10)

          editorRef.current?.chain().setTextSelection(headingPos).focus().run()

          heading.scrollIntoView()
        }
      }
    }

    updateToc(false)
  }, [updateToc])

  const editor = useEditor(
    {
      autofocus: 'start',
      className: 'h-full p-3',
      content: data?.html,
      extensions: [HeadingWithId],
      onCreate: onEditorCreate,
      onUpdate: updateToc,
    },
    [data?.html]
  )

  editorRef.current = editor

  function onMutation(error?: unknown) {
    setEditorState((prevEditorState) => ({
      ...prevEditorState,
      error,
      lastSync: error ? undefined : new Date(),
      pristine: !error,
    }))
  }

  return (
    <Flex fullHeight className="overflow-hidden">
      {isLoading ? (
        <Shimmer>
          {shimmerClasses.map((classes, index) => (
            <Shimmer.Line key={index} className={classes} />
          ))}
        </Shimmer>
      ) : (
        <EditorContent editor={editor} className="grid h-full w-full overflow-y-auto" />
      )}
      <NoteInspector
        noteId={id}
        editor={editor}
        disabled={isLoading}
        onMutation={onMutation}
        editorState={editorState}
      />
    </Flex>
  )
}

export default Note

export interface NoteEditorState extends SyncStatus {
  pristine: boolean
  toc?: ToC
}

interface NoteProps {
  id: TodoMetadata['id']
}
