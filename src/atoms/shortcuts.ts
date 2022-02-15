import { atom } from 'jotai'

import { getShortcutMap, type Shortcut, type ShortcutMap } from 'libs/shortcut'

export const shortcutsAtom = atom<ShortcutMap>({})

export const registerShortcutsAtom = atom(null, (_get, set, shortcuts: Shortcut[]) => {
  set(shortcutsAtom, (prevShortcuts) => ({ ...prevShortcuts, ...getShortcutMap(shortcuts) }))
})

export const unregisterShortcutsAtom = atom(null, (get, set, shortcuts: Shortcut[]) => {
  const updatedShortcuts = { ...get(shortcutsAtom) }

  for (const shortcut of shortcuts) {
    delete updatedShortcuts[shortcut.keybinding]
  }

  set(shortcutsAtom, updatedShortcuts)
})
