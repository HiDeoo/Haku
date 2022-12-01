# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### 🐞 Bug Fixes

- Fix an issue with the command and navigation palettes sometime displaying only partial results.

## v0.3.0

### 🚀 Features

- Pasting multi-line text in the to-do editor will now automatically create multiple to-dos.

### 🐞 Bug Fixes

- The navigation palette no longer contains an entry for the currently opened note or to-do, if any.
- Fix an issue preventing to use the command palette 'Go to Note or Todo' entry.
- Fix an issue when renaming the current to-do hiding its content.

## v0.2.1

### 🚀 Features

- Pressing `Enter` at the beginning of a non-empty todo item will now add a new one above the current one. For other cases, the behavior is unchanged.

### 🐞 Bug Fixes

- Fix stale name update issue after renaming the current note or to-do.

## v0.2.0

### 🚀 Features

- Search improvements:
  - The search UI is now a drawer and no longer a palette.
  - Add options to only include one or multiple types of results (notes, todos and inbox entries).
  - The search query & options are persisted during a session.
  - Search results can be focused with the `Meta + ↓` shortcut and navigation between them is possible using the arrow keys.
- Navigation palette entries are now sorted by recent activity.
- Quotes in the editor can be highlighted by using bold text at the start of the quote.
- Add support for editor code block language aliases (e.g. `ts` -> `TypeScript`).

### 💄 UI

- Tweak PWA icon to have a more native macOS / iOS look and feel.

### 🐞 Bug Fixes

- Properly display unknown editor code block languages as `Unknown`.
- Fix missing editor highlight when selecting a separator.
- Fix content update issue on slow connections.
- Improve note editor focus restoration mechanism.

## v0.1.5

### 💄 UI

- Reduce note editor title sizes.

### 🐞 Bug Fixes

- Update inbox shortcut to `Control + i` to prevent conflicts with the note editor.
- Ensure new content is automatically focused after creating a new note or todo.
- Improve editor code block accessibility when using the `Tab` key.
- Fix focus restoration when using the inbox.
- Fix an issue preventing to save a todo after only moving a root todo node.

## v0.1.4

### 🐞 Bug Fixes

- Clear errors that may be visible when closing content creation modals.
- Fix issue that could prevent focusing a todo note.
- Fix issue when trying to remove a todo node.
- Ensure current content is saved before creating a new folder, note or todo.
- Fix various todo highlighting issues.
- Fix focus restoration when using a palette.

## v0.1.3

### 🐞 Bug Fixes

- Fix production domain issue.

## v0.1.2

### 🐞 Bug Fixes

- Fix Content Security Policy production issue.

## v0.1.1

### 🐞 Bug Fixes

- Fix tRPC production URL.

## v0.1.0

### 🚀 Features

- Initial public release.
