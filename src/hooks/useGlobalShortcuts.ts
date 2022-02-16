import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'

import { registerShortcutsAtom, shortcutsAtom, unregisterShortcutsAtom } from 'atoms/shortcuts'
import { isShortcutEvent, type Shortcut } from 'libs/shortcut'

// The shortcuts must be memoized using `useMemo` to avoid infinitely re-registering them.
export default function useGlobalShortcuts(shortcuts: Shortcut[]) {
  const registeredShortcuts = useAtomValue(shortcutsAtom)

  const registerShortcuts = useUpdateAtom(registerShortcutsAtom)
  const unregisterShortcuts = useUpdateAtom(unregisterShortcutsAtom)

  useEffect(() => {
    registerShortcuts(shortcuts)

    return () => {
      unregisterShortcuts(shortcuts)
    }
  }, [registerShortcuts, shortcuts, unregisterShortcuts])

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of Object.values(registeredShortcuts)) {
        if (shortcut.onKeyDown && isShortcutEvent(event, shortcut)) {
          shortcut.onKeyDown(event)
        }
      }
    },
    [registeredShortcuts]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])
}
