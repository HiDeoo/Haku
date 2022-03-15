import cuid from 'cuid'
import { forwardRef, memo, useCallback, useContext, useImperativeHandle, useRef, useState } from 'react'
import { useEditable } from 'use-editable'

import { AtomParamsWithDirection } from 'atoms/todoNode'
import TodoNodeChildren, { type TodoNodeChildrenProps } from 'components/todo/TodoNodeChildren'
import TodoNodeHandle from 'components/todo/TodoNodeHandle'
import TodoNodeNote, { type TodoNodeNoteHandle } from 'components/todo/TodoNodeNote'
import Flex from 'components/ui/Flex'
import { TODO_NODE_ITEM_SHORTCUTS } from 'constants/shortcut'
import { TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS } from 'constants/ui'
import useTodoNode, { TodoContext } from 'hooks/useTodoNode'
import useTodoNodeChildren from 'hooks/useTodoNodeChildren'
import { type TodoNodeData } from 'libs/db/todoNodes'
import {
  type CaretPosition,
  type CaretDirection,
  getContentEditableCaretIndex,
  getContentEditableCaretPosition,
  setContentEditableCaretIndex,
  setContentEditableCaretPosition,
} from 'libs/html'
import { getShortcutMap, isShortcutEvent } from 'libs/shortcut'
import clst from 'styles/clst'
import styles from 'styles/TodoNodeItem.module.css'

const shortcutMap = getShortcutMap(TODO_NODE_ITEM_SHORTCUTS)

const TodoNodeItem: React.ForwardRefRenderFunction<TodoNodeItemHandle, TodoNodeItemProps> = (
  { id, level = 0, onFocusTodoNode, setTodoNodeItemRef },
  forwardedRef
) => {
  useImperativeHandle(forwardedRef, () => ({ focusContent, scrollIntoView }))

  const [shouldFocusNote, setShouldFocusNote] = useState(false)

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
    toggleCollapsed,
    toggleCompleted,
    unnestNode,
    updateContent,
    updateNote,
  } = useTodoNode(id)
  const children = useTodoNodeChildren(id)

  const onChangeContent = useCallback(
    (content: string) => {
      if (node?.id) {
        // Remove the trailing line break automatically added in the content editable element.
        updateContent({ id: node.id, content: content.slice(0, -1) })
      }
    },
    [node?.id, updateContent]
  )

  useEditable(contentEditable, onChangeContent, { disabled: isLoading || shouldFocusNote })

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

    // Prevent adding a new line or tab in the content editable element.
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
    }

    if (isShortcutEvent(event, shortcutMap['Enter'])) {
      const newId = cuid()

      addNode({ ...update, newId })

      requestAnimationFrame(() => {
        todoNodeItems.get(newId)?.focusContent()
      })
    } else if (isShortcutEvent(event, shortcutMap['Meta+Enter'])) {
      if (node.completed) {
        preserveCaret(() => {
          toggleCompleted(update)
        })
      } else {
        toggleCompleted(update)

        focusClosestNode({ ...update, direction: 'down' })
      }
    } else if (isShortcutEvent(event, shortcutMap['Shift+Enter'])) {
      setShouldFocusNote((prevIsNoteFocused) => !prevIsNoteFocused)

      requestAnimationFrame(() => {
        todoNodeNote.current?.focusNote()
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

    const caretIndex = contentEditable.current ? getContentEditableCaretIndex(contentEditable.current) : undefined

    callback()

    requestAnimationFrame(() => {
      todoNodeItems.get(node.id)?.focusContent(caretIndex)
    })
  }

  function onFocusContent() {
    if (node?.id) {
      onFocusTodoNode(node.id)
    }

    contentEditable.current?.setAttribute('spellcheck', 'true')
  }

  function onBlurContent() {
    contentEditable.current?.setAttribute('spellcheck', 'false')
  }

  function onBlurNote() {
    setShouldFocusNote(false)
  }

  function onShiftEnterNote() {
    setShouldFocusNote(false)

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

  const isNoteVisible = shouldFocusNote || (node.noteText && node.noteText.length > 0)

  const containerClasses = clst(styles.container, node.completed && styles.completed)

  const contentClasses = clst(
    styles.content,
    'min-h-[1.5rem] pr-2 break-words outline-none grow leading-relaxed supports-max:pr-[calc(theme(spacing.2)+max(0px,env(safe-area-inset-right)))]',
    {
      'cursor-not-allowed': isLoading,
      'line-through text-zinc-400': node.completed,
    }
  )

  const levelOffset = level * TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS + 1

  return (
    <div className={containerClasses} style={{ marginLeft: `-${levelOffset}px` }}>
      <Flex className="px-2 focus-within:bg-zinc-600/30">
        <Flex fullWidth className="group items-baseline pl-1" style={{ marginLeft: `${levelOffset}px` }}>
          <TodoNodeHandle
            id={id}
            collapsed={node.collapsed}
            completed={node.completed}
            toggleCollapsed={toggleCollapsed}
            hasChildren={(children?.length ?? 0) > 0}
          />
          <div className="w-full">
            <div
              ref={contentEditable}
              onBlur={onBlurContent}
              onFocus={onFocusContent}
              className={contentClasses}
              onKeyDown={onKeyDownContent}
              onPasteCapture={onPasteCaptureContent}
            >
              {content}
            </div>
            {isNoteVisible ? (
              <TodoNodeNote
                ref={todoNodeNote}
                node={node}
                onBlur={onBlurNote}
                onChange={updateNote}
                onShiftEnter={onShiftEnterNote}
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

export default memo(forwardRef(TodoNodeItem))

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
