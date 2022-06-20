# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### 🚀 Features

- Quotes in the editor can be highlighted by using bold text on the first line.
- Add support for editor code block language aliases (e.g. `ts` -> `TypeScript`).

### 🐞 Bug Fixes

- Properly display unknown editor code block languages as `Unknown`.

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
