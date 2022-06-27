import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { registerGlobalShortcutsAtom, unregisterGlobalShortcutsAtom } from 'atoms/shortcuts'
import { getShortcutMap, isShortcutEvent, type Shortcut } from 'libs/shortcut'

// The shortcuts must be memoized using `useMemo` to avoid infinitely re-registering them.
export function useGlobalShortcuts(shortcuts: Shortcut[]) {
  const registerGlobalShortcuts = useSetAtom(registerGlobalShortcutsAtom)
  const unregisterGlobalShortcuts = useSetAtom(unregisterGlobalShortcutsAtom)

  const shortcutMap = useMemo(() => getShortcutMap(shortcuts), [shortcuts])

  useEffect(() => {
    registerGlobalShortcuts(shortcuts)

    return () => {
      unregisterGlobalShortcuts(shortcuts)
    }
  }, [registerGlobalShortcuts, shortcuts, unregisterGlobalShortcuts])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const shortcut of Object.values(shortcutMap)) {
        if (shortcut.onKeyDown && isShortcutEvent(event, shortcut)) {
          shortcut.onKeyDown(event)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [shortcutMap])
}
