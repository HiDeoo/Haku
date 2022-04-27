export const EDITOR_SHORTCUTS = [
  { group: 'Note', keybinding: 'Shift+Enter', label: 'Add a Line Break' },
  { group: 'Note', keybinding: 'Meta+B', label: 'Toggle Bold' },
  { group: 'Note', keybinding: 'Meta+I', label: 'Toggle Italic' },
  { group: 'Note', keybinding: 'Meta+E', label: 'Toggle Code' },
  { group: 'Note', keybinding: 'Meta+K', label: 'Toggle / Edit Link' },
  { group: 'Note', keybinding: 'Meta+Alt+C', label: 'Toggle Code Block' },
  { group: 'Note', keybinding: 'Meta+Shift+X', label: 'Toggle Strike' },
  { group: 'Note', keybinding: 'Meta+Shift+H', label: 'Toggle Highlight' },
  { group: 'Note', keybinding: 'Meta+Shift+B', label: 'Toggle Quote' },
  { group: 'Note', keybinding: 'Meta+Alt+0', label: 'Clear Format' },
  { group: 'Note', keybinding: 'Meta+Alt+1', label: 'Toggle Heading 1' },
  { group: 'Note', keybinding: 'Meta+Alt+2', label: 'Toggle Heading 2' },
  { group: 'Note', keybinding: 'Meta+Alt+3', label: 'Toggle Heading 3' },
  { group: 'Note', keybinding: 'Meta+Alt+4', label: 'Toggle Heading 4' },
  { group: 'Note', keybinding: 'Meta+Alt+5', label: 'Toggle Heading 5' },
  { group: 'Note', keybinding: 'Meta+Alt+6', label: 'Toggle Heading 6' },
  { group: 'Note', keybinding: 'Meta+Shift+7', label: 'Toggle Ordered List' },
  { group: 'Note', keybinding: 'Meta+Shift+8', label: 'Toggle Bullet List' },
] as const

export const TODO_NODE_ITEM_SHORTCUTS = [
  { group: 'Todo', keybinding: 'Enter', label: 'Create New Todo' },
  { group: 'Todo', keybinding: 'Meta+Enter', label: 'Toggle Todo Completion' },
  { group: 'Todo', keybinding: 'Meta+Alt+Enter', label: 'Toggle Todo Cancellation' },
  { group: 'Todo', keybinding: 'Shift+Enter', label: 'Move between Todo & Note' },
  { group: 'Todo', keybinding: 'Meta+Backspace', label: 'Delete Todo' },
  { group: 'Todo', keybinding: 'Tab', label: 'Indent Todo' },
  { group: 'Todo', keybinding: 'Shift+Tab', label: 'Unindent Todo' },
  { keybinding: 'ArrowUp' },
  { group: 'Todo', keybinding: 'Meta+ArrowUp', label: 'Move Todo Up' },
  { keybinding: 'ArrowDown' },
  { group: 'Todo', keybinding: 'Meta+ArrowDown', label: 'Move Todo Down' },
  { group: 'Todo', keybinding: 'Meta+Shift+.', label: 'Collapse Todo' },
  ...EDITOR_SHORTCUTS.filter(
    (shortcut) => shortcut.label !== 'Add a Line Break' && shortcut.label !== 'Toggle / Edit Link'
  ),
] as const
