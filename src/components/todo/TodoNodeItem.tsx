import { TodoNodeStatus } from '@prisma/client'
import cuid from 'cuid'
import { forwardRef, memo, useCallback, useContext, useImperativeHandle, useRef, useState } from 'react'
import { useEditable } from 'use-editable'

import { type AtomParamsWithDirection } from 'atoms/todoNode'
import { TodoNodeChildren, type TodoNodeChildrenProps } from 'components/todo/TodoNodeChildren'
import { TodoNodeHandle } from 'components/todo/TodoNodeHandle'
import { TodoNodeNote, type TodoNodeNoteHandle } from 'components/todo/TodoNodeNote'
import { Flex } from 'components/ui/Flex'
import { TODO_NODE_ITEM_SHORTCUTS } from 'constants/shortcut'
import { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS } from 'constants/ui'
import { TodoContext, useTodoNode } from 'hooks/useTodoNode'
import { useTodoNodeChildren } from 'hooks/useTodoNodeChildren'
import { isNotEmpty } from 'libs/array'
import { type TodoNodeData } from 'libs/db/todoNodes'
import {
  type CaretPosition,
  type CaretDirection,
  getContentEditableCaretIndex,
  getContentEditableCaretPosition,
  setContentEditableCaretIndex,
  setContentEditableCaretPosition,
  getContentEditableWordAtCursorPosition,
} from 'libs/html'
import { getShortcutMap, isShortcutEvent } from 'libs/shortcut'
import { isValidUrl } from 'libs/string'
import { clst } from 'styles/clst'
import styles from 'styles/TodoNodeItem.module.css'

const shortcutMap = getShortcutMap(TODO_NODE_ITEM_SHORTCUTS)

export const TodoNodeItem = memo(
  forwardRef<TodoNodeItemHandle, TodoNodeItemProps>(
    ({ id, level = 0, onFocusTodoNode, setTodoNodeItemRef }, forwardedRef) => {
      useImperativeHandle(forwardedRef, () => ({ focusContent, scrollIntoView }))

      const [isNoteFocused, setIsNodeFocused] = useState(false)

      const contentEditable = useRef<HTMLDivElement>(null)
      const todoNodeNote = useRef<TodoNodeNoteHandle>(null)

      const todoNodeItems = useContext(TodoContext)

      const {
        addNode,
        deleteNode,
        getClosestNodeId,
        isLoading,
        moveNode,
        nestNode,
        node,
        toggleCancelled,
        toggleCollapsed,
        toggleCompleted,
        unnestNode,
        updateContent,
        updateNote,
      } = useTodoNode(id)
      const children = useTodoNodeChildren(id)

      const handleContentChange = useCallback(
        (content: string) => {
          if (node?.id) {
            // Remove the trailing line break automatically added in the content editable element.
            updateContent({ id: node.id, content: content.slice(0, -1) })
          }
        },
        [node?.id, updateContent]
      )

      useEditable(contentEditable, handleContentChange, { disabled: isLoading || isNoteFocused })

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

      function handleContentKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (!node) {
          return
        }

        const update = { id: node.id, parentId: node.parentId }

        // Prevent adding a new line or tab in the content editable element.
        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault()
        }

        if (isShortcutEvent(event, shortcutMap['Enter']) && contentEditable.current) {
          const caretIndex = getContentEditableCaretIndex(contentEditable.current)
          const newId = cuid()

          addNode({ ...update, direction: caretIndex === 0 && node.content.length > 0 ? 'up' : 'down', newId })

          requestAnimationFrame(() => {
            todoNodeItems.get(newId)?.focusContent()
          })
        } else if (isShortcutEvent(event, shortcutMap['Meta+Enter'])) {
          if (node.status === TodoNodeStatus.COMPLETED) {
            preserveCaret(() => {
              toggleCompleted(update)
            })
          } else {
            toggleCompleted(update)

            focusClosestNode({ ...update, direction: 'down' })
          }
        } else if (isShortcutEvent(event, shortcutMap['Meta+Alt+Enter'])) {
          if (node.status === TodoNodeStatus.CANCELLED) {
            preserveCaret(() => {
              toggleCancelled(update)
            })
          } else {
            toggleCancelled(update)

            focusClosestNode({ ...update, direction: 'down' })
          }
        } else if (isShortcutEvent(event, shortcutMap['Shift+Enter'])) {
          setIsNodeFocused((prevIsNoteFocused) => !prevIsNoteFocused)

          // The note editor will always return `null` on the first render which could prevent focusing it.
          // https://github.com/ueberdosis/tiptap/issues/2182
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              todoNodeNote.current?.focusNote()
            })
          })
        } else if (isShortcutEvent(event, shortcutMap['Meta+Backspace'])) {
          event.preventDefault()

          focusClosestNode({ ...update, direction: 'up' })

          deleteNode(update)
        } else if (isShortcutEvent(event, shortcutMap['Tab'])) {
          preserveCaret(() => {
            nestNode(update)
          })
        } else if (isShortcutEvent(event, shortcutMap['Shift+Tab'])) {
          preserveCaret(() => {
            unnestNode(update)
          })
        } else if (isShortcutEvent(event, shortcutMap['ArrowUp']) && contentEditable.current) {
          const caretPosition = getContentEditableCaretPosition(contentEditable.current)

          if (caretPosition && caretPosition.atFirstLine) {
            focusClosestNode({ ...update, direction: 'up', caretPosition }, event)
          }
        } else if (isShortcutEvent(event, shortcutMap['Meta+ArrowUp'])) {
          event.preventDefault()

          preserveCaret(() => {
            moveNode({ ...update, direction: 'up' })
          })
        } else if (isShortcutEvent(event, shortcutMap['ArrowDown']) && contentEditable.current) {
          const caretPosition = getContentEditableCaretPosition(contentEditable.current)

          if (caretPosition && caretPosition.atLastLine) {
            focusClosestNode({ ...update, direction: 'down', caretPosition }, event)
          }
        } else if (isShortcutEvent(event, shortcutMap['Meta+ArrowDown'])) {
          event.preventDefault()

          preserveCaret(() => {
            moveNode({ ...update, direction: 'down' })
          })
        } else if (isShortcutEvent(event, shortcutMap['Meta+Shift+.'])) {
          event.preventDefault()

          preserveCaret(() => {
            toggleCollapsed(update)
          })
        } else if (isShortcutEvent(event, shortcutMap['Alt+Enter']) && contentEditable.current) {
          const text = getContentEditableWordAtCursorPosition(contentEditable.current)

          if (text && isValidUrl(text)) {
            window.open(text)
          }
        }
      }

      function handleContentPasteCapture(event: React.ClipboardEvent) {
        event.preventDefault()
        event.stopPropagation()

        const text = event.clipboardData.getData('text/plain').replaceAll(/\n/gm, ' ')
        const range = window.getSelection()?.getRangeAt(0)

        if (range && node?.id) {
          updateContent({
            id: node.id,
            content:
              node.content.slice(0, range.startOffset) +
              text.replaceAll(/\n/gm, ' ') +
              node.content.slice(range.endOffset),
          })

          const nextCaretIndex = range.startOffset + text.length

          // Pasting large content may lead to a loss of focus, we can safely prevent that by refocusing the current node
          // and having the caret being placed right after the pasted content.
          requestAnimationFrame(() => {
            focusContent(nextCaretIndex)
          })
        }
      }

      function preserveCaret(callback: () => void) {
        if (!node) {
          return
        }

        const caretIndex = contentEditable.current ? getContentEditableCaretIndex(contentEditable.current) : undefined

        callback()

        requestAnimationFrame(() => {
          todoNodeItems.get(node.id)?.focusContent(caretIndex)
        })
      }

      function handleContentFocus() {
        if (node?.id) {
          onFocusTodoNode(node.id)
        }

        contentEditable.current?.setAttribute('spellcheck', 'true')
      }

      function handleContentBlur() {
        contentEditable.current?.setAttribute('spellcheck', 'false')
      }

      function handleNoteBlur() {
        setIsNodeFocused(false)
      }

      function handleNoteFocus() {
        setIsNodeFocused(true)
      }

      function handleNoteShiftEnter() {
        setIsNodeFocused(false)

        requestAnimationFrame(() => {
          focusContent()
        })
      }

      function focusContent(
        caretPositionOrIndex?: CaretPosition | number,
        direction?: CaretDirection,
        fromLevel?: TodoNodeItemProps['level']
      ) {
        if (!contentEditable.current) {
          return
        }

        contentEditable.current.focus()

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

          setContentEditableCaretPosition(contentEditable.current, { ...caretPositionOrIndex, left }, direction)
        } else {
          // Focus the passed down caret index or fallback to the end of the text content.
          setContentEditableCaretIndex(
            contentEditable.current,
            typeof caretPositionOrIndex === 'number' ? caretPositionOrIndex : node?.content.length
          )
        }
      }

      function scrollIntoView() {
        if (!contentEditable.current) {
          return
        }

        contentEditable.current.scrollIntoView()
      }

      if (!node) {
        return null
      }

      // Editing behaves best when rendering a trailing newline.
      // https://github.com/FormidableLabs/use-editable/issues/8#issuecomment-817390829
      const content = `${node?.content}\n`

      const isNoteVisible = isNoteFocused || (node.noteText && node.noteText.length > 0)

      const containerClasses = clst(
        styles['container'],
        node.status === TodoNodeStatus.COMPLETED && styles['completed'],
        node.status === TodoNodeStatus.CANCELLED && styles['cancelled']
      )

      const contentClasses = clst(
        styles['content'],
        'min-h-[theme(spacing.6)] break-words outline-none grow leading-relaxed whitespace-pre-wrap',
        'pr-2 pr-[calc(theme(spacing.2)+max(0px,env(safe-area-inset-right)))]',
        {
          'cursor-not-allowed': isLoading,
          'line-through text-zinc-400': node.status === TodoNodeStatus.COMPLETED,
          'line-through decoration-wavy text-zinc-500': node.status === TodoNodeStatus.CANCELLED,
        }
      )

      const levelOffset = level * TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS + 1

      return (
        <div className={containerClasses} style={{ marginLeft: `-${levelOffset}px` }}>
          <Flex className="px-2 focus-within:bg-zinc-600/30">
            <Flex fullWidth className="group items-baseline pl-1" style={{ marginLeft: `${levelOffset}px` }}>
              <TodoNodeHandle
                id={id}
                status={node.status}
                collapsed={node.collapsed}
                toggleCollapsed={toggleCollapsed}
                hasChildren={isNotEmpty(children)}
              />
              <div className="w-full">
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- tabbing is used to indent */}
                <div
                  ref={contentEditable}
                  className={contentClasses}
                  onBlur={handleContentBlur}
                  onFocus={handleContentFocus}
                  onKeyDown={handleContentKeyDown}
                  onPasteCapture={handleContentPasteCapture}
                >
                  {content}
                </div>
                {isNoteVisible ? (
                  <TodoNodeNote
                    node={node}
                    ref={todoNodeNote}
                    onChange={updateNote}
                    onBlur={handleNoteBlur}
                    onFocus={handleNoteFocus}
                    onShiftEnter={handleNoteShiftEnter}
                  />
                ) : null}
              </div>
            </Flex>
          </Flex>
          {!node.collapsed ? (
            <TodoNodeChildren
              id={id}
              level={level + 1}
              onFocusTodoNode={onFocusTodoNode}
              setTodoNodeItemRef={setTodoNodeItemRef}
            />
          ) : null}
        </div>
      )
    }
  )
)

TodoNodeItem.displayName = 'TodoNodeItem'

interface TodoNodeItemProps {
  id: TodoNodeData['id']
  level: number
  onFocusTodoNode: (todoNodeId: TodoNodeData['id']) => void
  setTodoNodeItemRef: TodoNodeChildrenProps['setTodoNodeItemRef']
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
  scrollIntoView: () => void
}
