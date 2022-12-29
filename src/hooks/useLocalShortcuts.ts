import { useSetAtom } from 'jotai/react'
import { useEffect, useMemo } from 'react'

import { registerLocalShortcutsAtom, unregisterLocalShortcutsAtom } from 'atoms/shortcuts'
import { getShortcutMap, type Keybinding, type Shortcut } from 'libs/shortcut'

export function useLocalShortcuts<TKeybinding extends Keybinding>(shortcuts: readonly Shortcut<TKeybinding>[]) {
  const registerLocalShortcuts = useSetAtom(registerLocalShortcutsAtom)
  const unregisterLocalShortcuts = useSetAtom(unregisterLocalShortcutsAtom)

  useEffect(() => {
    registerLocalShortcuts(shortcuts)

    return () => {
      unregisterLocalShortcuts(shortcuts)
    }
  }, [registerLocalShortcuts, shortcuts, unregisterLocalShortcuts])

  return useMemo(() => getShortcutMap(shortcuts), [shortcuts])
}
