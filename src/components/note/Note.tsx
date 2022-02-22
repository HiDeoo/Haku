import { useCallback, useEffect, useState } from 'react'

import EditorLinkModal from 'components/editor/EditorLinkModal'
import NoteInspector from 'components/note/NoteInspector'
import Flex from 'components/ui/Flex'
import Shimmer from 'components/ui/Shimmer'
import { type SyncStatus } from 'components/ui/SyncReport'
import { NOTE_SHIMMER_CLASSES } from 'constants/shimmer'
import { EDITOR_SHORTCUTS } from 'constants/shortcut'
import { EditorContent, EditorEvents, useEditor } from 'hooks/useEditor'
import useLocalShortcuts from 'hooks/useLocalShortcuts'
import useNavigationPrompt from 'hooks/useNavigationPrompt'
import useNote from 'hooks/useNote'
import { type TodoMetadata } from 'libs/db/todo'
import { getToc, HeadingWithId, type ToC } from 'libs/editor'

const anchorHeadingRegExp = /^#.*-(?<pos>\d+)$/

const Note: React.FC<NoteProps> = ({ id }) => {
  const [linkModalOpened, setLinkModalOpened] = useState(false)
  const [editorState, setEditorState] = useState<NoteEditorState>({ pristine: true })

  useNavigationPrompt(!editorState.pristine)

  useLocalShortcuts(EDITOR_SHORTCUTS)

  const { data, isLoading } = useNote(id, { enabled: editorState.pristine })

  const updateToc = useCallback(({ editor }: EditorEvents['create'], emitUpdate = true) => {
    const toc = getToc(editor as NonNullable<ReturnType<typeof useEditor>>)

    setEditorState((prevEditorState) => ({ ...prevEditorState, pristine: !emitUpdate, toc }))
  }, [])

  const onEditorCreate = useCallback(
    ({ editor }: EditorEvents['create']) => {
      if (location.hash.length !== 0) {
        const heading = document.querySelector(location.hash)

        if (heading) {
          const matches = anchorHeadingRegExp.exec(location.hash)
          const pos = matches?.groups?.pos

          if (pos) {
            const headingPos = parseInt(pos, 10)

            editor.chain().setTextSelection(headingPos).focus().run()

            heading.scrollIntoView()
          }
        }
      }

      updateToc({ editor }, false)
    },
    [updateToc]
  )

  const editor = useEditor({
    autofocus: 'start',
    className: 'h-full p-3',
    content: data?.html,
    extensions: [HeadingWithId],
    onCreate: onEditorCreate,
    onUpdate: updateToc,
    setLinkModalOpened,
  })

  useEffect(() => {
    if (editor && data?.html) {
      // Preserve the cursor position if the content is identical.
      if (data.html === editor.getHTML()) {
        return
      }

      editor.chain().setContent(data.html).focus().run()
    }
  }, [data, editor])

  const onMutation = useCallback((error?: unknown) => {
    setEditorState((prevEditorState) => ({
      ...prevEditorState,
      error,
      lastSync: error ? undefined : new Date(),
      pristine: !error,
    }))
  }, [])

  return (
    <Flex fullHeight className="overflow-hidden">
      {isLoading ? (
        <Shimmer>
          {NOTE_SHIMMER_CLASSES.map((shimmerClass, index) => (
            <Shimmer.Line key={index} className={shimmerClass} />
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
        setLinkModalOpened={setLinkModalOpened}
      />
      <EditorLinkModal opened={linkModalOpened} onOpenChange={setLinkModalOpened} editor={editor} />
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
