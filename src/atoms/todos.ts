import { atom } from 'jotai'

import { type TodoNodeDataMap, type TodoNodesData } from 'libs/db/todoNodes'

export const todoRootAtom = atom<TodoNodesData['root']>([])

export const todoNodesAtom = atom<TodoNodesData['nodes']>({})

export const todoNodeUpdatesAtom = atom<TodoNodeDataMap>({})
