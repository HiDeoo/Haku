import { atom, type PrimitiveAtom, type WritableAtom } from 'jotai/vanilla'
import { atomWithStorage } from 'jotai/vanilla/utils'

export const [sidebarCollapsedAtom, toggleSidebarCollapsedAtom] = createCollapsibleAtom('haku.sidebarCollapsed', false)
export const [noteInspectorCollapsedAtom, toggleNoteInspectorCollapsedAtom] = createCollapsibleAtom(
  'haku.noteInspectorCollapsed',
  true
)

function createCollapsibleAtom(
  key: string,
  initialValue: boolean
): [PrimitiveAtom<boolean>, WritableAtom<null, unknown[], void>] {
  const collapsibleAtom = atomWithStorage<boolean>(key, initialValue)

  const toggleCollapsibleAtom = atom(null, (_get, set) => {
    return set(collapsibleAtom, (prevCollapsed) => !prevCollapsed)
  })

  return [collapsibleAtom, toggleCollapsibleAtom]
}
