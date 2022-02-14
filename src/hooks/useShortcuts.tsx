import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useEffect } from 'react'

import { registerShortcutsAtom, shortcutsAtom, unregisterShortcutsAtom, type Shortcut } from 'atoms/shortcuts'

const keybindingModifiers = ['Alt', 'Control', 'Meta', 'Shift']

// The shortcuts must be memoized using `useMemo` to avoid infinitely re-registering them.
export default function useShortcuts(shortcuts: Shortcut[]) {
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
        const { parsedKeybinding } = shortcut
        const mods = parsedKeybinding[0]
        const key = parsedKeybinding[1]

        if (
          // Match against `event.key` or `event.code`.
          (event.key.toLowerCase() === key.toLowerCase() || event.code === key) &&
          // Ensure required modifiers are pressed.
          mods.every((mod) => event.getModifierState(mod)) &&
          // Ensure non-required modifiers are not pressed.
          keybindingModifiers.every((mod) => mods.includes(mod) || key === mod || !event.getModifierState(mod))
        ) {
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
