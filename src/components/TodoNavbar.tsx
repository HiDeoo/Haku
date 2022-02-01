import { useAtomCallback } from 'jotai/utils'
import { useCallback } from 'react'

import { todoChildrenAtom, todoNodeMutations, todoNodesAtom } from 'atoms/todos'
import Navbar from 'components/Navbar'
import useContentMutation, { type ContentMutation } from 'hooks/useContentMutation'
import { type TodoMetadata } from 'libs/db/todo'

const TodoNavbar: React.FC<TodoNavbarProps> = ({ disabled, todoId }) => {
  const { isLoading, mutate } = useContentMutation()

  const navbarDisabled = disabled || isLoading

  const getTodoAtoms = useAtomCallback(
    useCallback(
      (get) => ({ children: get(todoChildrenAtom), mutations: get(todoNodeMutations), nodes: get(todoNodesAtom) }),
      []
    )
  )

  async function save() {
    if (!todoId) {
      return
    }

    const { children, mutations, nodes } = await getTodoAtoms()

    const mutationData: ContentMutation = {
      action: 'update',
      id: todoId,
      children: { root: children.root },
      mutations: { delete: [], insert: {}, update: {} },
    }

    Object.entries(mutations).forEach(([id, mutationType]) => {
      const node = nodes[id]
      const nodeChildren = children[id]

      const isInsert = mutationType === 'insert'
      const isUdpate = mutationType === 'update'

      if ((isInsert || isUdpate) && node && nodeChildren) {
        if (isInsert) {
          mutationData.mutations.insert[id] = node
        } else {
          mutationData.mutations.update[id] = node
        }

        mutationData.children[id] = nodeChildren
      } else if (mutationType === 'delete') {
        mutationData.mutations.delete.push(id)
      }
    })

    mutate(mutationData)
  }

  return (
    <Navbar disabled={navbarDisabled}>
      <Navbar.Spacer />
      <Navbar.Button primary onPress={save} loading={isLoading}>
        Save
      </Navbar.Button>
    </Navbar>
  )
}

export default TodoNavbar

interface TodoNavbarProps {
  disabled?: boolean
  todoId?: TodoMetadata['id']
}
