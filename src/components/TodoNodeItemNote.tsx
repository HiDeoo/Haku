import { EditorContent, type EditorEvents, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback } from 'react'

import { type AtomParamsNoteUpdate } from 'atoms/todos'
import { type TodoNodeDataWithParentId } from 'libs/db/todoNodes'

const TodoNodeItemNote: React.FC<TodoNodeItemNoteProps> = ({ node, onChange }) => {
  const onEditorUpdate = useCallback(
    ({ editor }: EditorEvents['update']) => {
      onChange({ id: node.id, note: editor.getHTML() })
    },
    [node.id, onChange]
  )

  const editor = useEditor({
    editable: typeof node.content === 'string',
    // TODO(HiDeoo)
    extensions: [StarterKit],
    content: node.note,
    onUpdate: onEditorUpdate,
  })

  if (!node) {
    return null
  }

  return <EditorContent editor={editor} />
}

export default TodoNodeItemNote

interface TodoNodeItemNoteProps {
  node: TodoNodeDataWithParentId
  onChange: (update: AtomParamsNoteUpdate) => void
}
