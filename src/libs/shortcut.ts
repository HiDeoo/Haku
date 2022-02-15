const keybindingModifiers = ['Alt', 'Control', 'Meta', 'Shift']

export function parseKeybinding(keybinding: Keybinding): ParsedKeybinding {
  const parsedKeybinding = keybinding.trim().split('+')

  const key = parsedKeybinding.pop()
  const mods = parsedKeybinding

  if (!key) {
    throw new Error('Missing keybinding key.')
  }

  return [mods, key]
}

export function isEventWithKeybinding(
  event: React.KeyboardEvent<HTMLElement> | KeyboardEvent,
  keybinding: Keybinding | ParsedKeybinding
): boolean {
  const [mods, key] = typeof keybinding === 'string' ? parseKeybinding(keybinding) : keybinding

  return (
    // Match against `event.key` only.
    event.key.toLowerCase() === key.toLowerCase() &&
    // Ensure required modifiers are pressed.
    mods.every((mod) => event.getModifierState(mod)) &&
    // Ensure non-required modifiers are not pressed.
    keybindingModifiers.every((mod) => mods.includes(mod) || key === mod || !event.getModifierState(mod))
  )
}

export interface Shortcut {
  group?: string
  keybinding: Keybinding
  label: string
  onKeyDown: (event: KeyboardEvent) => void
}

type Keybinding = string
type ParsedKeybinding = [mods: string[], key: string]

export type ShortcutMap = Record<string, Shortcut & { parsedKeybinding: ParsedKeybinding }>
