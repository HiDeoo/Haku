import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect, useMemo } from 'react'

import { registerGlobalShortcutsAtom, unregisterGlobalShortcutsAtom } from 'atoms/shortcuts'
import { getShortcutMap, isShortcutEvent, type Shortcut } from 'libs/shortcut'

// The shortcuts must be memoized using `useMemo` to avoid infinitely re-registering them.
export default function useGlobalShortcuts(shortcuts: Shortcut[]) {
  const registerGlobalShortcuts = useUpdateAtom(registerGlobalShortcutsAtom)
  const unregisterGlobalShortcuts = useUpdateAtom(unregisterGlobalShortcutsAtom)

  const shortcutMap = useMemo(() => getShortcutMap(shortcuts), [shortcuts])

  useEffect(() => {
    registerGlobalShortcuts(shortcuts)

    return () => {
      unregisterGlobalShortcuts(shortcuts)
    }
  }, [registerGlobalShortcuts, shortcuts, unregisterGlobalShortcuts])

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of Object.values(shortcutMap)) {
        if (shortcut.onKeyDown && isShortcutEvent(event, shortcut)) {
          shortcut.onKeyDown(event)
        }
      }
    },
    [shortcutMap]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [onKeyDown])
}
