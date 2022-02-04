import { useAtom } from 'jotai'
import { useAtomCallback, useResetAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { todoEditorStateAtom } from 'atoms/todo'
import { todoNodeChildrenAtom, todoNodeMutations, todoNodeNodesAtom } from 'atoms/todoNode'
import Navbar from 'components/Navbar'
import SyncReport from 'components/SyncReport'
import useContentMutation, { type ContentMutation } from 'hooks/useContentMutation'
import { type TodoMetadata } from 'libs/db/todo'

const TodoNavbar: React.FC<TodoNavbarProps> = ({ disabled, todoId }) => {
  const [editorState, setEditorState] = useAtom(todoEditorStateAtom)
  const resetMutations = useResetAtom(todoNodeMutations)

  const { isLoading, mutate } = useContentMutation()

  const navbarDisabled = disabled || isLoading

  const getTodoAtoms = useAtomCallback(
    useCallback(
      (get) => ({
        children: get(todoNodeChildrenAtom),
        mutations: get(todoNodeMutations),
        nodes: get(todoNodeNodesAtom),
      }),
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

    setEditorState({ isLoading: true })

    mutate(mutationData, { onSettled: onSettledMutation, onSuccess: onSuccessMutation })
  }

  function onSettledMutation(_: unknown, error: unknown) {
    setEditorState({ error, isLoading: false, lastSync: error ? undefined : new Date() })
  }

  function onSuccessMutation() {
    resetMutations()
  }

  return (
    <Navbar disabled={navbarDisabled}>
      <Navbar.Spacer />
      <SyncReport isLoading={isLoading} error={editorState.error} lastSync={editorState.lastSync} />
      <Navbar.Button primary onPress={save} loading={isLoading} disabled={editorState.pristine}>
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
