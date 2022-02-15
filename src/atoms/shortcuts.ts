import { atom } from 'jotai'

import { parseKeybinding, type Shortcut, type ShortcutMap } from 'libs/shortcut'

export const shortcutsAtom = atom<ShortcutMap>({})

export const registerShortcutsAtom = atom(null, (_get, set, shortcuts: Shortcut[]) => {
  const newShortcuts: ShortcutMap = {}

  for (const shortcut of shortcuts) {
    newShortcuts[shortcut.keybinding] = { ...shortcut, parsedKeybinding: parseKeybinding(shortcut.keybinding) }
  }

  set(shortcutsAtom, (prevShortcuts) => ({ ...prevShortcuts, ...newShortcuts }))
})

export const unregisterShortcutsAtom = atom(null, (get, set, shortcuts: Shortcut[]) => {
  const updatedShortcuts = { ...get(shortcutsAtom) }

  for (const shortcut of shortcuts) {
    delete updatedShortcuts[shortcut.keybinding]
  }

  set(shortcutsAtom, updatedShortcuts)
})
