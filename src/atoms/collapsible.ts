import { atom, type PrimitiveAtom, WritableAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const [sidebarCollapsedAtom, toggleSidebarCollapsedAtom] = createCollapsibleAtom('haku.sidebarCollapsed', false)
export const [noteInspectorCollapsedAtom, toggleNoteInspectorCollapsedAtom] = createCollapsibleAtom(
  'haku.noteInspectorCollapsed',
  true
)

function createCollapsibleAtom(
  key: string,
  initialValue: boolean
): [PrimitiveAtom<boolean>, WritableAtom<null, unknown>] {
  const collapsibleAtom = atomWithStorage<boolean>(key, initialValue)

  const toggleCollapsibleAtom = atom(null, (_get, set) => {
    return set(collapsibleAtom, (prevCollapsed) => !prevCollapsed)
  })

  return [collapsibleAtom, toggleCollapsibleAtom]
}
