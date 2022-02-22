import { useCallback, useEffect, useState } from 'react'

import EditorLinkModal from 'components/EditorLinkModal'
import Flex from 'components/Flex'
import NoteInspector from 'components/NoteInspector'
import Shimmer from 'components/Shimmer'
import { type SyncStatus } from 'components/SyncReport'
import { EditorContent, EditorEvents, useEditor } from 'hooks/useEditor'
import useLocalShortcuts from 'hooks/useLocalShortcuts'
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

export const NOTE_SHORTCUTS = [
  { group: 'Note', keybinding: 'Shift+Enter', label: 'Add a Line Break' },
  { group: 'Note', keybinding: 'Meta+B', label: 'Toggle Bold' },
  { group: 'Note', keybinding: 'Meta+I', label: 'Toggle Italic' },
  { group: 'Note', keybinding: 'Meta+E', label: 'Toggle Code' },
  { group: 'Note', keybinding: 'Meta+K', label: 'Toggle / Edit Link' },
  { group: 'Note', keybinding: 'Meta+Alt+C', label: 'Toggle Code Block' },
  { group: 'Note', keybinding: 'Meta+Shift+X', label: 'Toggle Strike' },
  { group: 'Note', keybinding: 'Meta+Shift+H', label: 'Toggle Highlight' },
  { group: 'Note', keybinding: 'Meta+Shift+B', label: 'Toggle Quote' },
  { group: 'Note', keybinding: 'Meta+Alt+0', label: 'Clear Format' },
  { group: 'Note', keybinding: 'Meta+Alt+1', label: 'Toggle Heading 1' },
  { group: 'Note', keybinding: 'Meta+Alt+2', label: 'Toggle Heading 2' },
  { group: 'Note', keybinding: 'Meta+Alt+3', label: 'Toggle Heading 3' },
  { group: 'Note', keybinding: 'Meta+Alt+4', label: 'Toggle Heading 4' },
  { group: 'Note', keybinding: 'Meta+Alt+5', label: 'Toggle Heading 5' },
  { group: 'Note', keybinding: 'Meta+Alt+6', label: 'Toggle Heading 6' },
  { group: 'Note', keybinding: 'Meta+Shift+7', label: 'Toggle Ordered List' },
  { group: 'Note', keybinding: 'Meta+Shift+8', label: 'Toggle Bullet List' },
] as const

const anchorHeadingRegExp = /^#.*-(?<pos>\d+)$/

const Note: React.FC<NoteProps> = ({ id }) => {
  const [linkModalOpened, setLinkModalOpened] = useState(false)
  const [editorState, setEditorState] = useState<NoteEditorState>({ pristine: true })

  useNavigationPrompt(!editorState.pristine)

  useLocalShortcuts(NOTE_SHORTCUTS)

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
