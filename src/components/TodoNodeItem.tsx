import cuid from 'cuid'
import React, { forwardRef, memo, useCallback, useContext, useImperativeHandle, useRef } from 'react'
import { RiCheckboxBlankCircleFill } from 'react-icons/ri'
import { useEditable } from 'use-editable'

import { type AtomParamsWithDirection } from 'atoms/todos'
import Flex from 'components/Flex'
import Icon from 'components/Icon'
import TodoNodeChildren from 'components/TodoNodeChildren'
import TodoNodeItemNote from 'components/TodoNodeItemNote'
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
import clst from 'styles/clst'
import styles from 'styles/TodoNodeItem.module.css'

export const TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS = 16

const TodoNodeItem: React.ForwardRefRenderFunction<TodoNodeItemHandle, TodoNodeItemProps> = (
  { id, level = 0 },
  forwardedRef
) => {
  useImperativeHandle(forwardedRef, () => ({ focusContent }))

  const contentRef = useRef<HTMLDivElement>(null)
  const todoNodeItems = useContext(TodoContext)

  const {
    addNode,
    deleteNode,
    getClosestNodeId,
    isLoading,
    moveNode,
    nestNode,
    node,
    toggleCompleted,
    unnestNode,
    updateContent,
    updateNote,
  } = useTodoNode(id)

  const onChangeContent = useCallback(
    (content: string) => {
      if (node?.id) {
        // Remove the trailing line break automatically added in the content editable element.
        updateContent({ id: node.id, content: content.slice(0, -1) })
      }
    },
    [node?.id, updateContent]
  )

  useEditable(contentRef, onChangeContent, { disabled: isLoading })

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

      todoNodeItems.get(closestNodeId)?.focusContent(caretPosition, direction, level)
    },
    [getClosestNodeId, level, todoNodeItems]
  )

  function onKeyDownContent(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!node) {
      return
    }

    const update = { id: node.id, parentId: node.parentId }

    if (event.key === 'Enter') {
      event.preventDefault()

      if (isEventWithoutModifier(event)) {
        const newId = cuid()

        addNode({ ...update, newId })

        requestAnimationFrame(() => {
          todoNodeItems.get(newId)?.focusContent()
        })
      } else if (event.metaKey) {
        if (node.completed) {
          preserveCaret(() => {
            toggleCompleted(update)
          })
        } else {
          toggleCompleted(update)

          focusClosestNode({ ...update, direction: 'down' })
        }
      }
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
      todoNodeItems.get(node.id)?.focusContent(caretIndex)
    })
  }

  function onFocusContent() {
    contentRef.current?.setAttribute('spellcheck', 'true')
  }

  function onBlurContent() {
    contentRef.current?.setAttribute('spellcheck', 'false')
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
          caretPositionOrIndex.left +
            fromLevel * TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS -
            level * TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS
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

  const containerClasses = clst(styles.container, node.completed && styles.completed)

  const contentClasses = clst(styles.content, 'outline-none grow leading-relaxed', {
    'cursor-not-allowed': isLoading,
    'line-through text-zinc-400': node.completed,
  })

  const circleClasses = clst('mt-[0.57rem] mr-2 h-1.5 w-1.5 shrink-0 text-zinc-300', {
    'text-zinc-400': node.completed,
  })

  return (
    <div className={containerClasses}>
      <Flex
        className="focus-within:bg-zinc-700"
        style={{ paddingLeft: `calc(${level * TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS}px + 0.5rem)` }}
      >
        <Icon icon={RiCheckboxBlankCircleFill} className={circleClasses} />
        <div className="w-full">
          <div
            ref={contentRef}
            onBlur={onBlurContent}
            onFocus={onFocusContent}
            className={contentClasses}
            onKeyDown={onKeyDownContent}
            onPasteCapture={onPasteCaptureContent}
          >
            {getContent()}
          </div>
          <TodoNodeItemNote node={node} onChange={updateNote} />
          {/* {node.note && node.note.length > 0 ? <TodoNodeItemNote node={node} /> : null} */}
        </div>
      </Flex>
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
  caretPosition?: CaretPosition
}

export interface TodoNodeItemHandle {
  focusContent: (
    caretPositionOrIndex?: CaretPosition | number,
    direction?: CaretDirection,
    fromLevel?: TodoNodeItemProps['level']
  ) => void
}
