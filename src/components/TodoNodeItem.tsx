import cuid from 'cuid'
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
  type CaretDirection,
} from 'libs/html'

const levelOffsetInPixels = 20

const TodoNodeItem: React.ForwardRefRenderFunction<TodoNodeItemHandle, TodoNodeItemProps> = (
  { id, level = 0 },
  forwardedRef
) => {
  useImperativeHandle(forwardedRef, () => ({ focusContent }))

  const contentRef = useRef<HTMLDivElement>(null)
  const refs = useContext(TodoContext)

  const { addNode, deleteNode, getClosestNodeId, moveNode, nestNode, node, unnestNode, updateContent } = useTodoNode(id)

  const onChangeContent = useCallback(
    (content: string) => {
      if (node?.id) {
        updateContent({ id: node.id, content: content.replace(/\n$/, '') })
      }
    },
    [node?.id, updateContent]
  )

  useEditable(contentRef, onChangeContent)

  const focusClosestNode = useCallback(
    async (
      { caretPosition, direction, id, parentId }: TodoNodeItemFocusClosestNodeParams,
      event?: React.KeyboardEvent
    ) => {
      const closestNodeId = await getClosestNodeId({ direction, id, parentId })

      if (!closestNodeId) {
        return
      }

      event?.preventDefault()

      refs.get(closestNodeId)?.focusContent(caretPosition, direction, level)
    },
    [getClosestNodeId, level, refs]
  )

  function onKeyDownContent(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!node) {
      return
    }

    const update = { id: node.id, parentId: node.parentId }

    if (event.key === 'Enter') {
      event.preventDefault()

      const newId = cuid()

      addNode({ ...update, newId })

      requestAnimationFrame(() => {
        refs.get(newId)?.focusContent()
      })
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
          focusClosestNode({ ...update, direction, caretPosition }, event)
        }
      } else if (event.metaKey) {
        event.preventDefault()

        moveNode({ ...update, direction })
      }
    }
  }

  function focusContent(
    caretPosition?: CaretPosition,
    direction?: CaretDirection,
    fromLevel?: TodoNodeItemProps['level']
  ) {
    if (contentRef.current) {
      contentRef.current.focus()

      if (caretPosition && direction && fromLevel) {
        // Adjust the caret left position based on the level offset difference between the previous and current levels.
        const left = Math.max(0, caretPosition.left + fromLevel * levelOffsetInPixels - level * levelOffsetInPixels)

        setContentEditableCaretPosition(contentRef.current, { ...caretPosition, left }, direction)
      }
    }
  }

  if (!node) {
    return null
  }

  return (
    <>
      <div style={{ paddingLeft: level * levelOffsetInPixels }} className="my-3">
        <div>{id}</div>
        <div
          ref={contentRef}
          onKeyDown={onKeyDownContent}
          className="bg-blue-200 text-black caret-red-800 outline-none focus:bg-yellow-200"
        >
          {node.content}
        </div>
      </div>
      <TodoNodeChildren id={id} level={level + 1} />
    </>
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
  focusContent: (
    caretPosition?: CaretPosition,
    direction?: CaretDirection,
    fromLevel?: TodoNodeItemProps['level']
  ) => void
}
