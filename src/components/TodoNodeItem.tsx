import { memo, useCallback, useRef } from 'react'
import { useEditable } from 'use-editable'

import TodoNodeChildren from 'components/TodoNodeChildren'
import useTodoNode from 'hooks/useTodoNode'
import { type TodoNodeData } from 'libs/db/todoNodes'

const TodoNodeItem: React.FC<TodoNodeItemProps> = ({ id, level = 0 }) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const { addNode, deleteNode, nestNode, node, updateContent } = useTodoNode(id)

  const onChangeContent = useCallback(
    (content: string) => {
      if (node?.id) {
        updateContent({ id: node?.id, content })
      }
    },
    [node?.id, updateContent]
  )

  useEditable(contentRef, onChangeContent)

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!node) {
      return
    }

    switch (event.key) {
      case 'Enter': {
        event.preventDefault()

        addNode({ id: node.id, parentId: node.parentId })

        break
      }
      case 'Backspace': {
        if (event.metaKey) {
          deleteNode({ id: node.id, parentId: node.parentId })
        }

        break
      }
      case 'Tab': {
        event.preventDefault()

        nestNode({ id: node.id, parentId: node.parentId })

        break
      }
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
      <div className="bg-blue-200 text-black" ref={contentRef} onKeyDown={onKeyDown}>
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
