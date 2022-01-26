import { memo, useCallback, useContext, useRef } from 'react'
import { useEditable } from 'use-editable'

import { type AtomParamsWithDirection } from 'atoms/todos'
import TodoNodeChildren from 'components/TodoNodeChildren'
import useTodoNode, { TodoContext } from 'hooks/useTodoNode'
import { type TodoNodeData } from 'libs/db/todoNodes'
import { getElementSelectionPosition, isEventWithoutKeyboardModifier } from 'libs/html'

const TodoNodeItem: React.FC<TodoNodeItemProps> = ({ id, level = 0 }) => {
  const contentRef = useRef<HTMLDivElement>()
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

      if (isEventWithoutKeyboardModifier(event) && contentRef.current) {
        const selectionPosition = getElementSelectionPosition(contentRef.current)

        if (
          (direction === 'up' && selectionPosition.firstLine) ||
          (direction === 'down' && selectionPosition.lastLine)
        ) {
          // TODO(HiDeoo)
          event.preventDefault()

          focusClosestNode({ ...update, direction })
        }
      } else if (event.metaKey) {
        event.preventDefault()

        moveNode({ ...update, direction })
      }
    }
  }

  const setContentRef = useCallback(
    (node: HTMLDivElement) => {
      contentRef.current = node

      if (!node) {
        refs.delete(id)
      } else {
        refs.set(id, node)
      }
    },
    [id, refs]
  )

  const focusClosestNode = useCallback(
    async (update: AtomParamsWithDirection) => {
      const closestNodeId = await getClosestNodeId(update)

      if (!closestNodeId) {
        return
      }

      const closestNode = refs.get(closestNodeId)

      if (closestNode) {
        closestNode.focus()
      }
    },
    [getClosestNodeId, refs]
  )

  console.log('refs. ', refs.size)

  if (!node) {
    return null
  }

  // FIXME(HiDeoo)
  console.log(`#### rendering TodoNodeItem - ${node.id}`)

  return (
    <div style={{ paddingLeft: level * 20 }} className="m-3">
      <div>{id}</div>
      <div ref={setContentRef} onKeyDown={onKeyDownContent} className="bg-blue-200 text-black focus:bg-red-200">
        {node.content}
      </div>
      <TodoNodeChildren id={id} level={level + 1} />
    </div>
  )
}

export default memo(TodoNodeItem)

interface TodoNodeItemProps {
  id: TodoNodeData['id']
  level: number
}
