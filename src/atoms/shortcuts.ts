import { atom } from 'jotai'

export const shortcutsAtom = atom<ShortcutMap>({})

export const registerShortcutsAtom = atom(null, (_get, set, shortcuts: Shortcut[]) => {
  const newShortcuts: ShortcutMap = {}

  for (const shortcut of shortcuts) {
    const parsedKeybinding = shortcut.keybinding.trim().split('+')
    const key = parsedKeybinding.pop()
    const mods = parsedKeybinding

    if (key) {
      newShortcuts[shortcut.keybinding] = { ...shortcut, parsedKeybinding: [mods, key] }
    }
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

export interface Shortcut {
  group?: string
  keybinding: string
  label: string
  onKeyDown: (event: KeyboardEvent) => void
}

interface ParsedShortcut extends Shortcut {
  parsedKeybinding: [mods: string[], key: string]
}

type ShortcutMap = Record<string, ParsedShortcut>
