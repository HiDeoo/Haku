import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Strike from '@tiptap/extension-strike'
import { useEditor, EditorContent, ReactNodeViewRenderer, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback, useEffect, useRef, useState } from 'react'

import EditorCodeBlock, { CODE_BLOCK_DEFAULT_LANGUAGE } from 'components/EditorCodeBlock'
import Flex from 'components/Flex'
import NoteInspector from 'components/NoteInspector'
import Shimmer from 'components/Shimmer'
import useContentId from 'hooks/useContentId'
import useNote from 'hooks/useNote'
import { getLowlight, getToc, HeadingWithId, type ToC } from 'libs/editor'
import clst from 'styles/clst'
import styles from 'styles/Note.module.css'

// FIXME(HiDeoo)
const content = `<h1>test 1</h1><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h2>test 2</h2><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h3>test 3</h3><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h4>test 4</h4><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h5>test 5</h5><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h6>test6</h6><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h1>test 1</h1><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h2>test 2</h2><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h3>test 3</h3><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h4>test 4</h4><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h5>test 5</h5><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><h6>test6</h6><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p><p>test</p>`

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

const Note: React.FC = () => {
  const editorRef = useRef<Editor | null>(null)
  const [editorState, setEditorState] = useState<EditorState>({ pristine: true })

  const contentId = useContentId()
  const { data, isLoading } = useNote(contentId, {
    onSuccess(/* data */) {
      // editor?.chain().focus().setContent(data.html).run()
    },
    refetchOnReconnect: editorState.pristine,
    refetchOnWindowFocus: editorState.pristine,
  })

  const editorClasses = clst('h-full p-3 outline-none', styles.editor)

  const onEditorUpdate = useCallback(() => {
    if (editorRef.current) {
      const toc = getToc(editorRef.current)

      setEditorState((prevEditorState) => ({ ...prevEditorState, pristine: !prevEditorState.toc, toc }))
    }
  }, [])

  const editor = useEditor({
    autofocus: 'end',
    content,
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
    onCreate: onEditorUpdate,
    onUpdate: onEditorUpdate,
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  // FIXME(HiDeoo) copy(editor.getHTML())
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.editor = editor

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
