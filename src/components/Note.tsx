import Highlight from '@tiptap/extension-highlight'
import Strike from '@tiptap/extension-strike'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import Flex from 'components/Flex'
import NoteInspector from 'components/NoteInspector'
import Shimmer from 'components/Shimmer'
import useContentId from 'hooks/useContentId'
import useNote from 'hooks/useNote'
import clst from 'styles/clst'
import styles from 'styles/Note.module.css'

// FIXME(HiDeoo)
// const content =
//   '<h1>Heading 1</h1><p>test</p><h2>Heading 2</h2><p>test</p><h3>Heading 3</h3><p>test</p><h4>Heading 4</h4><p>test</p><h5>Heading 5</h5><p>test</p><h6>Heading 6</h6><p>test</p><p><strong>bold</strong></p><p><em>italic</em></p><p><s>test</s></p><p>test <mark>test</mark> test</p><p>test</p><p>test<br>test</p><p>test</p><hr><p>test</p><blockquote><p>test</p><blockquote><p>test</p></blockquote></blockquote><p>test</p><p>test</p><ul><li><p>test 1</p></li><li><p>test 2</p></li><li><p>test 3</p></li><li><p>test 4 very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long</p></li><li><p>test 5</p><ul><li><p>test 5.1</p></li><li><p>test 5.2</p><ul><li><p>test 5.2.1</p><ul><li><p>test 5.2.4</p></li></ul></li></ul></li></ul></li></ul><p>test</p><ol><li><p>test1</p></li><li><p>test2</p></li><li><p>test3</p><ol><li><p>test 3.1</p></li></ol></li><li><p>test 4</p></li><li><p>test 5</p></li><li><p>test 6</p></li><li><p>test 7</p></li><li><p>test 8</p></li><li><p>test 9</p></li><li><p>test 10</p></li><li><p>test 11</p></li></ol><p>test</p><p>test <code>test</code> test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test</p><p>test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test</p><p>test</p>'

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
  const contentId = useContentId()
  const { isLoading } = useNote(contentId, {
    onSuccess(data) {
      editor?.chain().focus().setContent(data.html).run()
    },
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  const editorClasses = clst('h-full p-3 outline-none', styles.editor)

  const editor = useEditor({
    autofocus: 'end',
    editorProps: { attributes: { class: editorClasses } },
    extensions: [StarterKit.configure({ codeBlock: false, strike: false }), Highlight, Strike],
  })

  // FIXME(HiDeoo) copy(editor.getHTML())
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.editor = editor

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
      <NoteInspector editor={editor} disabled={isLoading} />
    </Flex>
  )
}

export default Note
