import { TodoNodeStatus } from '@prisma/client'
import { forwardRef, useCallback, useImperativeHandle } from 'react'

import { type AtomParamsNoteUpdate } from 'atoms/todoNode'
import useContentId from 'hooks/useContentId'
import { EditorContent, EditorEvents, useEditor } from 'hooks/useEditor'
import { type TodoNodeDataWithParentId } from 'libs/db/todoNodes'
import { ShiftEnter } from 'libs/editor'

const editorContentClasses =
  'pr-2 text-[0.84rem] leading-[1.2rem] supports-max:pr-[calc(theme(spacing.2)+max(0px,env(safe-area-inset-right)))]'

const TodoNodeNote: React.ForwardRefRenderFunction<TodoNodeNoteHandle, TodoNodeNoteProps> = (
  { node, onBlur, onChange, onFocus, onShiftEnter },
  forwardedRef
) => {
  useImperativeHandle(forwardedRef, () => ({ focusNote }))

  const { contentId } = useContentId()

  const handleEditorUpdate = useCallback(
    ({ editor }: EditorEvents['update']) => {
      onChange({ id: node.id, noteHtml: editor.getHTML(), noteText: editor.getText() })
    },
    [node.id, onChange]
  )

  const editor = useEditor(
    {
      content: node.noteHtml,
      contentId,
      extensions: [ShiftEnter.configure({ callback: onShiftEnter })],
      onBlur,
      onFocus,
      onUpdate: handleEditorUpdate,
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
      className={editorContentClasses}
      style={{
        '--editor-text-color':
          node.status === TodoNodeStatus.COMPLETED
            ? 'var(--todo-node-completed-note-editor-text-color)'
            : node.status === TodoNodeStatus.CANCELLED
            ? 'var(--todo-node-cancelled-note-editor-text-color)'
            : 'var(--todo-node-note-editor-text-color)',
        '--editor-link-color':
          node.status === TodoNodeStatus.COMPLETED
            ? 'var(--todo-node-completed-note-editor-link-color)'
            : node.status === TodoNodeStatus.CANCELLED
            ? 'var(--todo-node-cancelled-note-editor-link-color)'
            : 'var(--todo-node-note-editor-link-color)',
      }}
    />
  )
}

export default forwardRef(TodoNodeNote)

interface TodoNodeNoteProps {
  node: TodoNodeDataWithParentId
  onBlur: () => void
  onChange: (update: AtomParamsNoteUpdate) => void
  onFocus: () => void
  onShiftEnter: () => void
}

export interface TodoNodeNoteHandle {
  focusNote: () => void
}
