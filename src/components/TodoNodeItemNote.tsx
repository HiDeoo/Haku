import { forwardRef, useCallback, useImperativeHandle } from 'react'

import { type AtomParamsNoteUpdate } from 'atoms/todos'
import { type TodoNodeDataWithParentId } from 'libs/db/todoNodes'
import { EditorContent, EditorEvents, useEditor } from 'hooks/useEditor'
import { ShiftEnter } from 'libs/editor'

const TodoNodeItemNote: React.ForwardRefRenderFunction<TodoNodeItemNoteHandle, TodoNodeItemNoteProps> = (
  { node, onBlur, onChange, onShiftEnter },
  forwardedRef
) => {
  useImperativeHandle(forwardedRef, () => ({ focusNote }))

  const onEditorUpdate = useCallback(
    ({ editor }: EditorEvents['update']) => {
      onChange({ id: node.id, noteHtml: editor.getHTML(), noteText: editor.getText() })
    },
    [node.id, onChange]
  )

  const editor = useEditor(
    {
      content: node.noteHtml,
      extensions: [ShiftEnter.configure({ callback: onShiftEnter })],
      onBlur,
      onUpdate: onEditorUpdate,
    },
    [node.content]
  )

  function focusNote() {
    editor?.commands.focus('end')
  }

  if (!node) {
    return null
  }

  return (
    <EditorContent
      editor={editor}
      className="pr-2 text-[0.84rem] leading-[1.2rem]"
      style={{
        '--editor-text-color': node.completed
          ? 'var(--todo-node-completed-note-editor-text-color)'
          : 'var(--todo-node-note-editor-text-color)',
      }}
    />
  )
}

export default forwardRef(TodoNodeItemNote)

interface TodoNodeItemNoteProps {
  node: TodoNodeDataWithParentId
  onBlur: () => void
  onChange: (update: AtomParamsNoteUpdate) => void
  onShiftEnter: () => void
}

export interface TodoNodeItemNoteHandle {
  focusNote: () => void
}
