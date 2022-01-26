export function isEventWithoutKeyboardModifier(event: React.KeyboardEvent<HTMLElement>) {
  return !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
}

export function getElementSelectionPosition(element: HTMLElement): SelectionPosition {
  const selectionPosition = { firstLine: false, lastLine: false }

  if (document.activeElement !== element) {
    return selectionPosition
  }

  const range = document.getSelection()?.getRangeAt(0).cloneRange()

  if (!range) {
    return selectionPosition
  }

  const elementRect = element.getBoundingClientRect()
  let selectionRect = range.getBoundingClientRect()

  if (range.getClientRects().length === 0) {
    // We may get an empty collection of bounding rectangles right after creating a new node. This means that
    // `selectionRect` would be a zero bounding rect.
    // To prevent this issue, we temporarily insert a zero-width space character, fetch the bounding rectanle again and
    // remove it.
    if (range.collapsed && selectionRect.top === 0 && selectionRect.left === 0) {
      const tmpNode = document.createTextNode('\ufeff')
      range.insertNode(tmpNode)

      selectionRect = range.getBoundingClientRect()

      tmpNode.remove()

      // If we still don't have a valid bounding rectangle, bail out.
      if (range.getClientRects().length === 0) {
        return selectionPosition
      }
    }
  }

  const lineHeight = parseFloat(window.getComputedStyle(element, null).getPropertyValue('line-height'))

  return {
    firstLine: Math.abs(selectionRect.y - elementRect.y) < lineHeight,
    lastLine: Math.abs(selectionRect.bottom - elementRect.bottom) < lineHeight,
  }
}

interface SelectionPosition {
  firstLine: boolean
  lastLine: boolean
}
