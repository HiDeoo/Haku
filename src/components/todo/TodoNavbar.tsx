import { useAtom } from 'jotai'
import { useAtomCallback, useResetAtom } from 'jotai/utils'
import { useCallback, useMemo } from 'react'

import { todoEditorStateAtom } from 'atoms/todo'
import { todoNodeChildrenAtom, todoNodeMutationsAtom, todoNodeNodesAtom } from 'atoms/todoNode'
import { CacheStatus } from 'components/ui/CacheStatus'
import { Navbar } from 'components/ui/Navbar'
import { NetworkStatus } from 'components/ui/NetworkStatus'
import { SyncReport } from 'components/ui/SyncReport'
import { useGlobalShortcuts } from 'hooks/useGlobalShortcuts'
import { useIdle } from 'hooks/useIdle'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { type TodoMetadata } from 'libs/db/todo'
import { type RouterInput, trpc } from 'libs/trpc'

export const TodoNavbar = ({ disabled, focusTodoNode, todoId, todoName }: TodoNavbarProps) => {
  const { offline } = useNetworkStatus()

  const [editorState, setEditorState] = useAtom(todoEditorStateAtom)
  const resetMutations = useResetAtom(todoNodeMutationsAtom)

  const { isLoading, mutate } = trpc.todo.node.update.useMutation()

  const navbarDisabled = disabled || isLoading

  const getTodoAtoms = useAtomCallback(
    useCallback((get) => {
      const { root, ...mutationsWithoutRoot } = get(todoNodeMutationsAtom)

      return {
        children: get(todoNodeChildrenAtom),
        mutations: mutationsWithoutRoot,
        nodes: get(todoNodeNodesAtom),
      }
    }, [])
  )

  const handleMutationSettled = useCallback(
    (_: unknown, error: unknown) => {
      setEditorState({ error, isLoading: false, lastSync: error ? undefined : new Date() })

      focusTodoNode(false)
    },
    [focusTodoNode, setEditorState]
  )

  const handleMutationSuccess = useCallback(() => {
    resetMutations()
  }, [resetMutations])

  const save = useCallback(async () => {
    if (offline || !todoId) {
      return
    }

    const { children, mutations, nodes } = await getTodoAtoms()

    const mutationData: RouterInput['todo']['node']['update'] = {
      id: todoId,
      children: { root: children.root },
      mutations: { delete: [], insert: {}, update: {} },
    }

    for (const [id, mutationType] of Object.entries(mutations)) {
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
    }

    setEditorState({ isLoading: true })

    mutate(mutationData, { onSettled: handleMutationSettled, onSuccess: handleMutationSuccess })
  }, [getTodoAtoms, mutate, offline, handleMutationSettled, handleMutationSuccess, setEditorState, todoId])

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Todo',
          keybinding: 'Meta+S',
          label: 'Save',
          onKeyDown: (event) => {
            event.preventDefault()

            if (!editorState.pristine) {
              save()
            }
          },
        },
      ],
      [editorState.pristine, save]
    )
  )

  useIdle(
    useCallback(() => {
      if (!editorState.pristine) {
        save()
      }
    }, [editorState.pristine, save])
  )

  return (
    <Navbar disabled={navbarDisabled} title={todoName}>
      <Navbar.Spacer />
      <SyncReport isLoading={isLoading} error={editorState.error} lastSync={editorState.lastSync} />
      <NetworkStatus />
      <CacheStatus />
      <Navbar.Button
        primary
        onPress={save}
        loading={isLoading}
        disabled={offline || editorState.pristine}
        pinged={!editorState.pristine && !isLoading}
      >
        Save
      </Navbar.Button>
    </Navbar>
  )
}

interface TodoNavbarProps {
  disabled?: boolean
  focusTodoNode: (scrollIntoView?: boolean) => void
  todoId: TodoMetadata['id']
  todoName?: TodoMetadata['name']
}
