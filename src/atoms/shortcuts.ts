import { atom, type PrimitiveAtom, type WritableAtom } from 'jotai'

import { getShortcutMap, type Shortcut, type ShortcutMap } from 'libs/shortcut'

export const globalShortcutsAtom = atom<ShortcutMap>({})
export const localShortcutsAtom = atom<ShortcutMap>({})

export const [registerGlobalShortcutsAtom, unregisterGlobalShortcutsAtom] =
  createShortcutsWriteOnlyAtoms(globalShortcutsAtom)

export const [registerLocalShortcutsAtom, unregisterLocalShortcutsAtom] =
  createShortcutsWriteOnlyAtoms(localShortcutsAtom)

function createShortcutsWriteOnlyAtoms(
  shortcutsAtom: PrimitiveAtom<ShortcutMap>
): [WritableAtom<null, readonly Shortcut[]>, WritableAtom<null, readonly Shortcut[]>] {
  const registerAtom = atom(null, (_get, set, shortcuts: readonly Shortcut[]) => {
    set(shortcutsAtom, (prevGlobalShortcuts) => ({ ...prevGlobalShortcuts, ...getShortcutMap(shortcuts) }))
  })

  const unregisterAtom = atom(null, (get, set, shortcuts: readonly Shortcut[]) => {
    const updatedShortcuts = { ...get(shortcutsAtom) }

    for (const shortcut of shortcuts) {
      delete updatedShortcuts[shortcut.keybinding]
    }

    set(shortcutsAtom, updatedShortcuts)
  })

  return [registerAtom, unregisterAtom]
}
