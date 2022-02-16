import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'

import { registerGlobalShortcutsAtom, globalShortcutsAtom, unregisterGlobalShortcutsAtom } from 'atoms/shortcuts'
import { isShortcutEvent, type Shortcut } from 'libs/shortcut'

// The shortcuts must be memoized using `useMemo` to avoid infinitely re-registering them.
export default function useGlobalShortcuts(shortcuts: Shortcut[]) {
  const registeredShortcuts = useAtomValue(globalShortcutsAtom)

  const registerGlobalShortcuts = useUpdateAtom(registerGlobalShortcutsAtom)
  const unregisterGlobalShortcuts = useUpdateAtom(unregisterGlobalShortcutsAtom)

  useEffect(() => {
    registerGlobalShortcuts(shortcuts)

    return () => {
      unregisterGlobalShortcuts(shortcuts)
    }
  }, [registerGlobalShortcuts, shortcuts, unregisterGlobalShortcuts])

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
