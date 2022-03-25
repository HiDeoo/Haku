import { useCallback, useEffect, useMemo, useState } from 'react'

import Title from 'components/app/Title'
import EditorLinkModal from 'components/editor/EditorLinkModal'
import NoteInspector from 'components/note/NoteInspector'
import NoteNavbar from 'components/note/NoteNavbar'
import Flex from 'components/ui/Flex'
import Shimmer from 'components/ui/Shimmer'
import { type SyncStatus } from 'components/ui/SyncReport'
import { NOTE_SHIMMER_CLASSES } from 'constants/shimmer'
import { EDITOR_SHORTCUTS } from 'constants/shortcut'
import useContentMutation from 'hooks/useContentMutation'
import { EditorContent, EditorEvents, useEditor } from 'hooks/useEditor'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import useIdle from 'hooks/useIdle'
import useLocalShortcuts from 'hooks/useLocalShortcuts'
import useNavigationPrompt from 'hooks/useNavigationPrompt'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import useNoteQuery from 'hooks/useNoteQuery'
import { type TodoMetadata } from 'libs/db/todo'
import { getToc, HeadingWithId, ReplaceContent, type ToC } from 'libs/editor'

const anchorHeadingRegExp = /^#.*-(?<pos>\d+)$/

const Note: React.FC<NoteProps> = ({ id }) => {
  const { offline } = useNetworkStatus()

  const [linkModalOpened, setLinkModalOpened] = useState(false)
  const [editorState, setEditorState] = useState<NoteEditorState>({ pristine: true })

  const idle = useIdle()

  useNavigationPrompt(!editorState.pristine)

  const { data, isLoading } = useNoteQuery(id, { enabled: editorState.pristine })
  const { isLoading: isSaving, mutate } = useContentMutation()

  const updateToc = useCallback(({ editor }: EditorEvents['create'], emitUpdate = true) => {
    const toc = getToc(editor as NonNullable<ReturnType<typeof useEditor>>)

    setEditorState((prevEditorState) => ({ ...prevEditorState, pristine: !emitUpdate, toc }))
  }, [])

  const editor = useEditor({
    autofocus: 'start',
    className: 'h-full p-3 min-w-0',
    extensions: [ReplaceContent, HeadingWithId],
    onUpdate: updateToc,
    setLinkModalOpened,
  })

  const save = useCallback(() => {
    if (offline || !editor || !id) {
      return
    }

    editor.setEditable(false)

    const html = editor.getHTML()
    const text = editor.getText()

    mutate(
      { action: 'update', id, html, text },
      {
        onSettled: (_: unknown, error: unknown) => {
          editor?.setEditable(true)
          editor?.commands.focus()

          setEditorState((prevEditorState) => ({
            ...prevEditorState,
            error,
            lastSync: error ? undefined : new Date(),
            pristine: !error,
          }))
        },
      }
    )
  }, [editor, id, mutate, offline])

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Note',
          keybinding: 'Meta+S',
          label: 'Save',
          onKeyDown: (event) => {
            event.preventDefault()

            if (!editorState.pristine) {
              save()
            }
          },
        },
      ],
      [editorState.pristine, save]
    )
  )

  useLocalShortcuts(EDITOR_SHORTCUTS)

  const onNewContent = useCallback(
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

  useEffect(() => {
    if (editor && data?.html) {
      // Preserve the cursor position if the content is identical.
      if (data.html === editor.getHTML()) {
        return
      }

      editor.chain().replaceContent(data.html).focus().run()

      onNewContent({ editor })
    }
  }, [data, editor, onNewContent])

  useEffect(() => {
    if (idle && !editorState.pristine) {
      save()
    }
  }, [editorState.pristine, idle, save])

  const isLoadingOrSaving = isLoading || isSaving

  return (
    <>
      <Title pageTitle={data?.name} />
      <NoteNavbar
        save={save}
        isSaving={isSaving}
        noteName={data?.name}
        editorState={editorState}
        disabled={isLoadingOrSaving}
      />
      <Flex fullHeight className="overflow-hidden">
        {isLoading ? (
          <Shimmer>
            {NOTE_SHIMMER_CLASSES.map((shimmerClass, index) => (
              <Shimmer.Line key={index} className={shimmerClass} />
            ))}
          </Shimmer>
        ) : (
          <EditorContent
            editor={editor}
            className="grid h-full w-full overflow-y-auto supports-max:pb-[max(0px,env(safe-area-inset-bottom))]"
          />
        )}
        <NoteInspector
          editor={editor}
          editorState={editorState}
          disabled={isLoadingOrSaving}
          setLinkModalOpened={setLinkModalOpened}
        />
        <EditorLinkModal opened={linkModalOpened} onOpenChange={setLinkModalOpened} editor={editor} />
      </Flex>
    </>
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
