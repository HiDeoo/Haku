import { forwardRef, memo, useCallback, useContext, useImperativeHandle, useRef } from 'react'
import { useEditable } from 'use-editable'

import { type AtomParamsWithDirection } from 'atoms/todos'
import TodoNodeChildren from 'components/TodoNodeChildren'
import useTodoNode, { TodoContext } from 'hooks/useTodoNode'
import { type TodoNodeData } from 'libs/db/todoNodes'
import {
  getContentEditableCaretPosition,
  isEventWithoutModifier,
  setContentEditableCaretPosition,
  type CaretPosition,
} from 'libs/html'

const TodoNodeItem: React.ForwardRefRenderFunction<TodoNodeItemHandle, TodoNodeItemProps> = (
  { id, level = 0 },
  forwardedRef
) => {
  useImperativeHandle(forwardedRef, () => ({ focus }))

  const contentRef = useRef<HTMLDivElement>(null)
  const refs = useContext(TodoContext)

  const { addNode, deleteNode, getClosestNodeId, moveNode, nestNode, node, unnestNode, updateContent } = useTodoNode(id)

  const onChangeContent = useCallback(
    (content: string) => {
      if (node?.id) {
        updateContent({ id: node?.id, content })
      }
    },
    [node?.id, updateContent]
  )

  useEditable(contentRef, onChangeContent)

  function onKeyDownContent(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!node) {
      return
    }

    const update = { id: node.id, parentId: node.parentId }

    if (event.key === 'Enter') {
      event.preventDefault()

      addNode(update)
    } else if (event.key === 'Backspace' && event.metaKey) {
      deleteNode(update)
    } else if (event.key === 'Tab') {
      event.preventDefault()

      if (event.shiftKey) {
        unnestNode(update)
      } else {
        nestNode(update)
      }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const direction = event.key === 'ArrowUp' ? 'up' : 'down'

      if (isEventWithoutModifier(event) && contentRef.current) {
        const caretPosition = getContentEditableCaretPosition(contentRef.current)

        if (
          caretPosition &&
          ((direction === 'up' && caretPosition.atFirstLine) || (direction === 'down' && caretPosition.atLastLine))
        ) {
          // TODO(HiDeoo)
          event.preventDefault()

          focusClosestNode({ ...update, direction, caretPosition })
        }
      } else if (event.metaKey) {
        event.preventDefault()

        moveNode({ ...update, direction })
      }
    }
  }

  const focusClosestNode = useCallback(
    async ({ caretPosition, direction, id, parentId }: TodoNodeItemFocusClosestNodeParams) => {
      const closestNodeId = await getClosestNodeId({ direction, id, parentId })

      if (!closestNodeId) {
        return
      }

      const closestNode = refs.get(closestNodeId)

      if (closestNode) {
        closestNode.focus(caretPosition, level)
      }
    },
    [getClosestNodeId, level, refs]
  )

  function focus(caretPosition: CaretPosition, originLevel: TodoNodeItemProps['level']) {
    if (contentRef.current) {
      contentRef.current.focus()

      // TODO(HiDeoo) Handle level offset
      setContentEditableCaretPosition(contentRef.current, caretPosition)
    }
  }

  if (!node) {
    return null
  }

  // FIXME(HiDeoo)
  console.log(`#### rendering TodoNodeItem - ${node.id}`)

  return (
    <div style={{ paddingLeft: level * 20 }} className="m-3">
      <div>{id}</div>
      <div
        ref={contentRef}
        onKeyDown={onKeyDownContent}
        className="bg-blue-200 text-black caret-red-800 outline-none focus:bg-yellow-200"
      >
        {node.content}
      </div>
      <TodoNodeChildren id={id} level={level + 1} />
    </div>
  )
}

export default memo(forwardRef(TodoNodeItem))

interface TodoNodeItemProps {
  id: TodoNodeData['id']
  level: number
}

interface TodoNodeItemFocusClosestNodeParams extends AtomParamsWithDirection {
  caretPosition: CaretPosition
}

export interface TodoNodeItemHandle {
  focus: (caretPosition: CaretPosition, originLevel: TodoNodeItemProps['level']) => void
}
