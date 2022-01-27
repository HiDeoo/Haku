export function isEventWithoutModifier(event: React.KeyboardEvent<HTMLElement>) {
  return !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
}

export function getElementSelectionPosition(element: HTMLElement): SelectionPosition {
  const selectionPosition = { atFirstLine: false, atLastLine: false }

  const selection = document.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return selectionPosition
  }

  const selectionRange = selection.getRangeAt(0).cloneRange()
  selectionRange.collapse()

  if (!element.contains(selectionRange.startContainer)) {
    return selectionPosition
  }

  const range = document.createRange()
  range.setStart(selectionRange.startContainer, selectionRange.startOffset)
  range.setEnd(element, element.childNodes.length)

  const rangeRects = range.getClientRects()
  let rangeRect = rangeRects[0]

  if (rangeRect && rangeRect.width === 0 && rangeRects.length > 1) {
    rangeRect = rangeRects[1]
  }

  // To check if the selection is at the first or last line of the element and avoid various browser implementation
  // issues (specially regarding new lines), we add empty inline elements at the beginning and end of the selection and
  // then compare the position of these elements with the position of the original element.
  const startElement = document.createElement('span')
  const endElement = document.createElement('span')
  const lineBreakElement = document.createElement('br')

  range.insertNode(startElement)
  startElement.parentNode?.insertBefore(endElement, startElement.nextSibling)

  const endRect = endElement.getBoundingClientRect()
  const atNewLine = rangeRect && rangeRect.top >= endRect.bottom

  // If the element text is automatically wrapped and we position the caret at the beginning of the second line, the
  // reported position will be the same as the first line, and thus incorrect. To prevent this, we need to insert a line
  // break element.
  if (atNewLine) {
    endElement.parentNode?.insertBefore(lineBreakElement, endElement)
  }

  const lineOffsetHeight = endElement.offsetHeight
  const medianLineOffsetHeight = lineOffsetHeight / 2

  selectionPosition.atFirstLine = startElement.offsetTop - element.offsetTop < medianLineOffsetHeight
  selectionPosition.atLastLine =
    element.offsetTop + element.offsetHeight - (endElement.offsetTop + lineOffsetHeight) < medianLineOffsetHeight

  startElement.remove()
  endElement.remove()
  lineBreakElement.remove()
  element.normalize()

  startElement.remove()

  return selectionPosition
}

interface SelectionPosition {
  atFirstLine: boolean
  atLastLine: boolean
}
