import { isPlatformMacOS } from './html'

const modifiers = ['Alt', 'Control', 'Meta', 'Shift']

const platformNativeMetaModifier = isPlatformMacOS ? 'Meta' : 'Control'

export function getShortcutMap<TKeybinding extends Keybinding>(shortcuts: readonly Shortcut<TKeybinding>[]) {
  const shortcutMap = {} as Record<TKeybinding, Shortcut & { parsedKeybinding: ParsedKeybinding }>

  for (const shortcut of shortcuts) {
    shortcutMap[shortcut.keybinding] = { ...shortcut, parsedKeybinding: parseKeybinding(shortcut.keybinding) }
  }

  return shortcutMap
}

export function isShortcutEvent(
  event: React.KeyboardEvent<HTMLElement> | KeyboardEvent,
  shortcut: ParsedShortcut
): boolean {
  const [mods, key] = shortcut.parsedKeybinding

  return (
    // Match against `event.key` only.
    event.key.toLowerCase() === key.toLowerCase() &&
    // Ensure required modifiers are pressed.
    mods.every((mod) => event.getModifierState(mod)) &&
    // Ensure non-required modifiers are not pressed.
    modifiers.every((mod) => mods.includes(mod) || key === mod || !event.getModifierState(mod))
  )
}

export function sortShortcutsByLabel(shortcuts: ParsedShortcut[]) {
  return shortcuts.sort((firstShortcut, secondShortcut) => firstShortcut.label.localeCompare(secondShortcut.label))
}

export function getKeyAriaLabel(key: string): string {
  return key.replace('Alt', isPlatformMacOS ? 'Option' : 'Alt').replace('Meta', isPlatformMacOS ? 'Command' : 'Control')
}

function parseKeybinding(keybinding: Keybinding): ParsedKeybinding {
  const parsedKeybinding = keybinding.trim().split('+')

  const key = parsedKeybinding.pop()
  const mods = parsedKeybinding.map((mod) => (mod === 'Meta' ? platformNativeMetaModifier : mod))

  if (!key) {
    throw new Error('Missing keybinding key.')
  }

  return [mods, key]
}

export interface Shortcut<TKeybinding = Keybinding> {
  readonly group: string
  readonly keybinding: TKeybinding
  readonly label: string
  readonly onKeyDown?: (event: KeyboardEvent) => void
}

export type Keybinding = string
type ParsedKeybinding = [mods: string[], key: string]

export type ParsedShortcut = Shortcut & { readonly parsedKeybinding: ParsedKeybinding }

export type ShortcutMap = Record<string, ParsedShortcut>
