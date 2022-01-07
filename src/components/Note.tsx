import Strike from '@tiptap/extension-strike'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import clst from 'styles/clst'
import styles from 'styles/Note.module.css'

const content =
  '<h1>Heading 1</h1><p>test</p><h2>Heading 2</h2><p>test</p><h3>Heading 3</h3><p>test</p><h4>Heading 4</h4><p>test</p><h5>Heading 5</h5><p>test</p><h6>Heading 6</h6><p>test</p><p><strong>bold</strong></p><p><em>italic</em></p><p><s>test</s></p><p>test</p><p>test<br>test</p><p>test</p><hr><p>test</p><blockquote><p>test</p><blockquote><p>test</p></blockquote></blockquote><p>test</p><p>test</p><ul><li><p>test 1</p></li><li><p>test 2</p></li><li><p>test 3</p></li><li><p>test 4 very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long very long</p></li><li><p>test 5</p><ul><li><p>test 5.1</p></li><li><p>test 5.2</p><ul><li><p>test 5.2.1</p><ul><li><p>test 5.2.4</p></li></ul></li></ul></li></ul></li></ul><p>test</p><ol><li><p>test1</p></li><li><p>test2</p></li><li><p>test3</p><ol><li><p>test 3.1</p></li></ol></li><li><p>test 4</p></li><li><p>test 5</p></li><li><p>test 6</p></li><li><p>test 7</p></li><li><p>test 8</p></li><li><p>test 9</p></li><li><p>test 10</p></li><li><p>test 11</p></li></ol><p>test</p><p>test <code>test</code> test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test</p><p>test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test</p><p>test</p>'

const Note: React.FC = () => {
  const editorClasses = clst('h-full p-3 outline-none', styles.editor)

  const editor = useEditor({
    content,
    editorProps: { attributes: { class: editorClasses } },
    extensions: [StarterKit.configure({ codeBlock: false }), Strike],
  })

  // FIXME(HiDeoo) copy(editor.getHTML())
  global.editor = editor

  return <EditorContent editor={editor} className="grid h-full" />
}

export default Note
