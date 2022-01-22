import { atom } from 'jotai'

import { type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'

export const todoRootAtom = atom<TodoNodesData['root']>([])

export const todoNodesAtom = atom<TodoNodesData['nodes']>({})

export const todoNodeMutations = atom<Record<TodoNodeData['id'], 'insert' | 'update' | 'delete'>>({})
