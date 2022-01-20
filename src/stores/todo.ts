import { type TodoNodeData, type TodoNodesData } from 'libs/db/todoNodes'
import { type StoreSlice } from 'stores'

export const createTodoSlice: StoreSlice<TodoState> = (set) => ({
  todoNodes: {},
  todoRoot: [],
  setTodoNodes: ({ nodes, root }: TodoNodesData) => {
    return set(() => ({ todoNodes: nodes, todoRoot: root }))
  },
  updateTodoNodeContent: (id: TodoNodeData['id'], content: string) => {
    return set((state) => {
      const node = state.todoNodes[id]

      if (!node) {
        return state
      }

      return { todoNodes: { ...state.todoNodes, [id]: { ...node, content } } }
    })
  },
})

export interface TodoState {
  todoNodes: TodoNodesData['nodes']
  todoRoot: TodoNodesData['root']
  setTodoNodes: (nodes: TodoNodesData) => void
  updateTodoNodeContent: (id: TodoNodeData['id'], content: string) => void
}
