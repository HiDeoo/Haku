import cuid from 'cuid'
import { forwardRef, memo, useCallback, useContext, useImperativeHandle, useRef, useState } from 'react'
import { useEditable } from 'use-editable'

import { AtomParamsWithDirection } from 'atoms/todoNode'
import Flex from 'components/Flex'
import TodoNodeChildren, { type TodoNodeChildrenProps } from 'components/TodoNodeChildren'
import TodoNodeHandle from 'components/TodoNodeHandle'
import TodoNodeNote, { type TodoNodeNoteHandle } from 'components/TodoNodeNote'
import useLocalShortcuts from 'hooks/useLocalShortcuts'
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
import { isShortcutEvent } from 'libs/shortcut'
import clst from 'styles/clst'
import styles from 'styles/TodoNodeItem.module.css'

export const TODO_NODE_ITEM_LEVEL_OFFSET_IN_PIXELS = 16

// TODO(HiDeoo)
const shortcutMap = [
  { group: 'Todo', keybinding: 'Enter', label: 'Create new todo' },
  { group: 'Todo', keybinding: 'Meta+Enter', label: 'Toggle todo completion' },
  { group: 'Todo', keybinding: 'Shift+Enter', label: 'Move between todo & note' },
  { group: 'Todo', keybinding: 'Meta+Backspace', label: 'Delete todo' },
  { group: 'Todo', keybinding: 'Tab', label: 'Indent todo' },
  { group: 'Todo', keybinding: 'Shift+Tab', label: 'Unindent todo' },
  { keybinding: 'ArrowUp' },
  { group: 'Todo', keybinding: 'Meta+ArrowUp', label: 'Move todo up' },
  { keybinding: 'ArrowDown' },
  { group: 'Todo', keybinding: 'Meta+ArrowDown', label: 'Move todo down' },
  { group: 'Todo', keybinding: 'Meta+Shift+.', label: 'Collapse todo' },
] as const

const TodoNodeItem: React.ForwardRefRenderFunction<TodoNodeItemHandle, TodoNodeItemProps> = (
  { id, level = 0, onFocusTodoNode, setTodoNodeItemRef },
  forwardedRef
) => {
  useImperativeHandle(forwardedRef, () => ({ focusContent, scrollIntoView }))

  const [shouldFocusNote, setShouldFocusNote] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const noteRef = useRef<TodoNodeNoteHandle>(null)

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

  useEditable(contentRef, onChangeContent, { disabled: isLoading || shouldFocusNote })

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

  const shortcuts = useLocalShortcuts(shortcutMap)

  function onKeyDownContent(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!node) {
      return
    }

    const update = { id: node.id, parentId: node.parentId }

    // Prevent adding a new line or tab in the content editable element.
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
    }

    if (isShortcutEvent(event, shortcuts['Enter'])) {
      const newId = cuid()

      addNode({ ...update, newId })

      requestAnimationFrame(() => {
        todoNodeItems.get(newId)?.focusContent()
      })
    } else if (isShortcutEvent(event, shortcuts['Meta+Enter'])) {
      if (node.completed) {
        preserveCaret(() => {
          toggleCompleted(update)
        })
      } else {
        toggleCompleted(update)

        focusClosestNode({ ...update, direction: 'down' })
      }
    } else if (isShortcutEvent(event, shortcuts['Shift+Enter'])) {
      setShouldFocusNote((prevIsNoteFocused) => !prevIsNoteFocused)

      requestAnimationFrame(() => {
        noteRef.current?.focusNote()
      })
    } else if (isShortcutEvent(event, shortcuts['Meta+Backspace'])) {
      event.preventDefault()

      focusClosestNode({ ...update, direction: 'up' })

      deleteNode(update)
    } else if (isShortcutEvent(event, shortcuts['Tab'])) {
      preserveCaret(() => {
        nestNode(update)
      })
    } else if (isShortcutEvent(event, shortcuts['Shift+Tab'])) {
      preserveCaret(() => {
        unnestNode(update)
      })
    } else if (isShortcutEvent(event, shortcuts['ArrowUp']) && contentRef.current) {
      const caretPosition = getContentEditableCaretPosition(contentRef.current)

      if (caretPosition && caretPosition.atFirstLine) {
        focusClosestNode({ ...update, direction: 'up', caretPosition }, event)
      }
    } else if (isShortcutEvent(event, shortcuts['Meta+ArrowUp'])) {
      event.preventDefault()

      preserveCaret(() => {
        moveNode({ ...update, direction: 'up' })
      })
    } else if (isShortcutEvent(event, shortcuts['ArrowDown']) && contentRef.current) {
      const caretPosition = getContentEditableCaretPosition(contentRef.current)

      if (caretPosition && caretPosition.atLastLine) {
        focusClosestNode({ ...update, direction: 'down', caretPosition }, event)
      }
    } else if (isShortcutEvent(event, shortcuts['Meta+ArrowDown'])) {
      event.preventDefault()

      preserveCaret(() => {
        moveNode({ ...update, direction: 'down' })
      })
    } else if (isShortcutEvent(event, shortcuts['Meta+Shift+.'])) {
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

    const caretIndex = contentRef.current ? getContentEditableCaretIndex(contentRef.current) : undefined

    callback()

    requestAnimationFrame(() => {
      todoNodeItems.get(node.id)?.focusContent(caretIndex)
    })
  }

  function onFocusContent() {
    if (node?.id) {
      onFocusTodoNode(node.id)
    }

    contentRef.current?.setAttribute('spellcheck', 'true')
  }

  function onBlurContent() {
    contentRef.current?.setAttribute('spellcheck', 'false')
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
    if (!contentRef.current) {
      return
    }

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

  function scrollIntoView() {
    if (!contentRef.current) {
      return
    }

    contentRef.current.scrollIntoView()
  }

  if (!node) {
    return null
  }

  // Editing behaves best when rendering a trailing newline.
  // https://github.com/FormidableLabs/use-editable/issues/8#issuecomment-817390829
  const content = `${node?.content}\n`

  const isNoteVisible = shouldFocusNote || (node.noteText && node.noteText.length > 0)

  const containerClasses = clst(styles.container, node.completed && styles.completed)

  const contentClasses = clst(styles.content, 'min-h-[1.5rem] pr-2 break-words outline-none grow leading-relaxed', {
    'cursor-not-allowed': isLoading,
    'line-through text-zinc-400': node.completed,
  })

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
              ref={contentRef}
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
                ref={noteRef}
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
