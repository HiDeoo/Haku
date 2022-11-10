import { useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { Title } from 'components/app/Title'
import { EditorImageModal } from 'components/editor/EditorImageModal'
import { EditorLinkModal } from 'components/editor/EditorLinkModal'
import { NoteInspector } from 'components/note/NoteInspector'
import { NoteNavbar } from 'components/note/NoteNavbar'
import { Flex } from 'components/ui/Flex'
import { Offline } from 'components/ui/Offline'
import { Shimmer } from 'components/ui/Shimmer'
import { type SyncStatus } from 'components/ui/SyncReport'
import { NOTE_SHIMMER_CLASSES } from 'constants/shimmer'
import { EDITOR_SHORTCUTS } from 'constants/shortcut'
import { EditorContent, type EditorEvents, useEditor } from 'hooks/useEditor'
import { FocusRestorationContext } from 'hooks/useFocusRestoration'
import { useGlobalShortcuts } from 'hooks/useGlobalShortcuts'
import { useIdle } from 'hooks/useIdle'
import { useLocalShortcuts } from 'hooks/useLocalShortcuts'
import { useNavigationPrompt } from 'hooks/useNavigationPrompt'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { useNoteQuery } from 'hooks/useNoteQuery'
import { type TodoMetadata } from 'libs/db/todo'
import { focusNodeWithId, getToc, HeadingWithId, ReplaceContent, type ToC } from 'libs/editor'
import { trpc } from 'libs/trpc'

export const Note = ({ id }: NoteProps) => {
  const { offline } = useNetworkStatus()

  const focusRestoration = useContext(FocusRestorationContext)

  const [linkModalOpened, setLinkModalOpened] = useState(false)
  const [editorState, setEditorState] = useState<NoteEditorState>({ pristine: true })

  useNavigationPrompt(!editorState.pristine)

  const { data, isLoading } = useNoteQuery(id, { enabled: editorState.pristine })
  const { isLoading: isSaving, mutate } = trpc.useMutation(['note.update'])

  const updateToc = useCallback(({ editor }: EditorEvents['create'], emitUpdate = true) => {
    const toc = getToc(editor)

    setEditorState((prevEditorState) => ({ ...prevEditorState, pristine: !emitUpdate, toc }))
  }, [])

  const editor = useEditor({
    autofocus: 'start',
    className: 'h-full p-3 min-w-0',
    contentId: id,
    extensions: [ReplaceContent, HeadingWithId],
    onCreate({ editor }) {
      focusRestoration.noteEditor = editor
    },
    onDestroy() {
      focusRestoration.noteEditor = undefined
    },
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
      { id, html, text },
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

  useIdle(
    useCallback(() => {
      if (!editorState.pristine) {
        save()
      }
    }, [editorState.pristine, save])
  )

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

  const handleNewContent = useCallback(
    ({ editor }: EditorEvents['create']) => {
      if (location.hash.length > 0) {
        focusNodeWithId(editor, location.hash)
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

      handleNewContent({ editor })
    }
  }, [data, editor, handleNewContent])

  const isOfflineWithoutData = offline && isLoading && !data
  const disabled = isLoading || isSaving || !editor?.isEditable || isOfflineWithoutData

  return (
    <>
      <Title pageTitle={data?.name} />
      <NoteNavbar save={save} isSaving={isSaving} noteName={data?.name} disabled={disabled} editorState={editorState} />
      <Flex fullHeight className="overflow-hidden">
        {isOfflineWithoutData ? (
          <Offline />
        ) : isLoading ? (
          <Shimmer>
            {NOTE_SHIMMER_CLASSES.map((shimmerClass, index) => (
              <Shimmer.Line key={index} className={shimmerClass} />
            ))}
          </Shimmer>
        ) : (
          <EditorContent
            editor={editor}
            className="grid h-full w-full overflow-y-auto pb-[max(0px,env(safe-area-inset-bottom))]"
          />
        )}
        <NoteInspector
          editor={editor}
          disabled={disabled}
          editorState={editorState}
          setLinkModalOpened={setLinkModalOpened}
        />
        <EditorLinkModal opened={linkModalOpened} onOpenChange={setLinkModalOpened} editor={editor} />
        <EditorImageModal />
      </Flex>
    </>
  )
}

export interface NoteEditorState extends SyncStatus {
  pristine: boolean
  toc?: ToC
}

export interface NoteProps {
  id: TodoMetadata['id']
}
