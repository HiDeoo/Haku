import { EditorContent, type EditorEvents, useEditor, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { forwardRef, useCallback, useImperativeHandle } from 'react'

import { type AtomParamsNoteUpdate } from 'atoms/todos'
import { type TodoNodeDataWithParentId } from 'libs/db/todoNodes'

const TodoNodeItemNote: React.ForwardRefRenderFunction<TodoNodeItemNoteHandle, TodoNodeItemNoteProps> = (
  { node, onBlur, onChange, onShiftEnter },
  forwardedRef
) => {
  useImperativeHandle(forwardedRef, () => ({ focusNote }))

  const onEditorUpdate = useCallback(
    ({ editor }: EditorEvents['update']) => {
      onChange({ id: node.id, note: editor.getHTML() })
    },
    [node.id, onChange]
  )

  const editor = useEditor(
    {
      // TODO(HiDeoo)
      extensions: [StarterKit, shiftEnterExtension.configure({ callback: onShiftEnter })],
      content: node.note,
      onBlur,
      onUpdate: onEditorUpdate,
    },
    [node.content]
  )

  function focusNote() {
    editor?.commands.focus(node.note?.length)
  }

  if (!node) {
    return null
  }

  return <EditorContent editor={editor} />
}

export default forwardRef(TodoNodeItemNote)

const shiftEnterExtension = Extension.create<{ callback: () => void }>({
  name: 'shiftEnterExtension',
  addKeyboardShortcuts() {
    return {
      'Shift-Enter': () => {
        this.options.callback()

        return true
      },
    }
  },
})

interface TodoNodeItemNoteProps {
  node: TodoNodeDataWithParentId
  onBlur: () => void
  onChange: (update: AtomParamsNoteUpdate) => void
  onShiftEnter: () => void
}

export interface TodoNodeItemNoteHandle {
  focusNote: () => void
}
