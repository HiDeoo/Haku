import cuid from 'cuid'
import React, { forwardRef, memo, useCallback, useContext, useImperativeHandle, useRef } from 'react'
import { useEditable } from 'use-editable'

import { type AtomParamsWithDirection } from 'atoms/todos'
import TodoNodeChildren from 'components/TodoNodeChildren'
import useTodoNode, { TodoContext } from 'hooks/useTodoNode'
import { type TodoNodeData } from 'libs/db/todoNodes'
import {
  type CaretPosition,
  type CaretDirection,
  getContentEditableCaretIndex,
  getContentEditableCaretPosition,
  isEventWithoutModifier,
  setContentEditableCaretIndex,
  setContentEditableCaretPosition,
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
        // Remove the trailing line break automatically added in the content editable element.
        updateContent({ id: node.id, content: content.slice(0, -1) })
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
      event.preventDefault()

      focusClosestNode({ ...update, direction: 'up' })

      deleteNode(update)
    } else if (event.key === 'Tab') {
      event.preventDefault()

      preserveCaret(() => {
        if (event.shiftKey) {
          unnestNode(update)
        } else {
          nestNode(update)
        }
      })
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

        preserveCaret(() => {
          moveNode({ ...update, direction })
        })
      }
    }
  }

  function onPasteCaptureContent(event: React.ClipboardEvent) {
    event.preventDefault()
    event.stopPropagation()

    const text = event.clipboardData.getData('text/plain').replaceAll(/\n/gm, ' ')

    if (node?.id) {
      updateContent({ id: node.id, content: text.replaceAll(/\n/gm, ' ') })
    }

    // Pasting large content may lead to a loss of focus, we can safely prevent that by refocusing the current node and
    // having the caret being placed at the end of the content text node.
    requestAnimationFrame(() => {
      focusContent(text.length)
    })
  }

  function preserveCaret(callback: () => void) {
    if (!node) {
      return
    }

    const caretIndex = contentRef.current ? getContentEditableCaretIndex(contentRef.current) : undefined

    callback()

    requestAnimationFrame(() => {
      refs.get(node.id)?.focusContent(caretIndex)
    })
  }

  function focusContent(
    caretPositionOrIndex?: CaretPosition | number,
    direction?: CaretDirection,
    fromLevel?: TodoNodeItemProps['level']
  ) {
    if (contentRef.current) {
      contentRef.current.focus()

      if (
        caretPositionOrIndex &&
        typeof caretPositionOrIndex !== 'number' &&
        direction &&
        typeof fromLevel !== 'undefined'
      ) {
        // Adjust the caret left position based on the level offset difference between the previous and current levels.
        const left = Math.max(
          0,
          caretPositionOrIndex.left + fromLevel * levelOffsetInPixels - level * levelOffsetInPixels
        )

        setContentEditableCaretPosition(contentRef.current, { ...caretPositionOrIndex, left }, direction)
      } else {
        // Focus the passed down caret index or fallback to the end of the text content.
        setContentEditableCaretIndex(
          contentRef.current,
          typeof caretPositionOrIndex === 'number' ? caretPositionOrIndex : node?.content.length
        )
      }
    }
  }

  function getContent() {
    // Editing behaves best when rendering a trailing newline.
    // https://github.com/FormidableLabs/use-editable/issues/8#issuecomment-817390829
    return `${node?.content}\n`
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
          onPasteCapture={onPasteCaptureContent}
          className="bg-blue-200 text-black caret-red-800 outline-none focus:bg-yellow-200"
        >
          {getContent()}
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
  caretPosition?: CaretPosition
}

export interface TodoNodeItemHandle {
  focusContent: (
    caretPositionOrIndex?: CaretPosition | number,
    direction?: CaretDirection,
    fromLevel?: TodoNodeItemProps['level']
  ) => void
}
