import { isUserAgentDataPlatformAvailable } from './html'

const keybindingModifiers = ['Alt', 'Control', 'Meta', 'Shift']

const platformNativeMetaModifier =
  // As of 02/15/22, the `userAgentData` Navigator API is currently not available on any iOS browser.
  // https://caniuse.com/mdn-api_navigator_useragentdata
  (isUserAgentDataPlatformAvailable() && navigator.userAgentData?.platform === 'macOS') ||
  (typeof navigator === 'object' && /Mac|iPad|iPhone|iPod/.test(navigator.platform))
    ? 'Meta'
    : 'Control'

export function getShortcutMap<TKeybinding extends Keybinding>(shortcuts: Shortcut<TKeybinding>[]) {
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
    keybindingModifiers.every((mod) => mods.includes(mod) || key === mod || !event.getModifierState(mod))
  )
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
  group?: string
  keybinding: TKeybinding
  label: string
  onKeyDown?: (event: KeyboardEvent) => void
}

type Keybinding = string
type ParsedKeybinding = [mods: string[], key: string]

type ParsedShortcut = Shortcut & { parsedKeybinding: ParsedKeybinding }

export type ShortcutMap = Record<string, ParsedShortcut>
