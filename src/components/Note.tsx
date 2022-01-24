import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Strike from '@tiptap/extension-strike'
import { useEditor, EditorContent, ReactNodeViewRenderer, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback, useRef, useState } from 'react'

import EditorCodeBlock, { CODE_BLOCK_DEFAULT_LANGUAGE } from 'components/EditorCodeBlock'
import Flex from 'components/Flex'
import NoteInspector from 'components/NoteInspector'
import Shimmer from 'components/Shimmer'
import useContentId from 'hooks/useContentId'
import useNote from 'hooks/useNote'
import { getLowlight, getToc, HeadingWithId, type ToC } from 'libs/editor'
import clst from 'styles/clst'
import styles from 'styles/Note.module.css'

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

const Note: React.FC = () => {
  const editorRef = useRef<Editor | null>(null)
  const [editorState, setEditorState] = useState<EditorState>({ pristine: true })

  const contentId = useContentId()
  const { data, isLoading } = useNote(contentId, { enabled: editorState.pristine })

  const editorClasses = clst('h-full p-3 outline-none', styles.editor)

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
      content: data?.html,
      editorProps: { attributes: { class: editorClasses, spellcheck: 'false' } },
      extensions: [
        StarterKit.configure({ codeBlock: false, strike: false }),
        Highlight,
        Strike,
        Link,
        CodeBlockLowlight.extend({ addNodeView: addCodeBlockLowlightNodeView }).configure({
          defaultLanguage: CODE_BLOCK_DEFAULT_LANGUAGE,
          lowlight: getLowlight(),
        }),
        HeadingWithId,
      ],
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
        <EditorContent editor={editor} className="grid w-full h-full overflow-y-auto" />
      )}
      <NoteInspector
        editor={editor}
        noteId={data?.id}
        disabled={isLoading}
        onMutation={onMutation}
        editorState={editorState}
      />
    </Flex>
  )
}

export default Note

function addCodeBlockLowlightNodeView() {
  return ReactNodeViewRenderer(EditorCodeBlock)
}

export interface EditorState {
  error?: unknown
  pristine: boolean
  lastSync?: Date
  toc?: ToC
}
