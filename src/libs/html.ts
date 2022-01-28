export function isEventWithoutModifier(event: React.KeyboardEvent<HTMLElement>) {
  return !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
}

export function setContentEditableCaretPosition(element: HTMLElement, position: CaretPosition) {
  const text = element.textContent

  if (!text || !element.firstChild) {
    return
  }

  const elementRect = element.getBoundingClientRect()

  const containerElement = document.createElement('div')
  containerElement.style.height = `${elementRect.height}px`
  containerElement.style.width = `${elementRect.width}px`

  const textElement = document.createElement('span')
  textElement.style.display = 'inline-block'
  containerElement.appendChild(textElement)

  document.body.appendChild(containerElement)

  let index = 1
  let currentOffset = position.left

  for (index; index < text.length; index++) {
    textElement.textContent = text.slice(0, index)

    const offset = Math.abs(position.left - textElement.clientWidth)

    if (offset > currentOffset) {
      break
    }

    currentOffset = offset
  }

  const textNode = element.firstChild

  const range = document.createRange()
  range.setStart(textNode, index - 1)
  range.setEnd(textNode, index - 1)

  window.getSelection()?.removeAllRanges()
  window.getSelection()?.addRange(range)

  textElement.remove()
  containerElement.remove()
}

export function getContentEditableCaretPosition(element: HTMLElement): CaretPosition | undefined {
  const selection = document.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return
  }

  const selectionRange = selection.getRangeAt(0).cloneRange()
  selectionRange.collapse()

  if (!element.contains(selectionRange.startContainer)) {
    return
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

  const caretPosition = {
    atFirstLine: startElement.offsetTop - element.offsetTop < medianLineOffsetHeight,
    atLastLine:
      element.offsetTop + element.offsetHeight - (endElement.offsetTop + lineOffsetHeight) < medianLineOffsetHeight,
    left: startElement.offsetLeft - element.offsetLeft,
  }

  caretPosition.atFirstLine = startElement.offsetTop - element.offsetTop < medianLineOffsetHeight
  caretPosition.atLastLine =
    element.offsetTop + element.offsetHeight - (endElement.offsetTop + lineOffsetHeight) < medianLineOffsetHeight

  startElement.remove()
  endElement.remove()
  lineBreakElement.remove()
  element.normalize()

  startElement.remove()

  return caretPosition
}

export interface CaretPosition {
  atFirstLine: boolean
  atLastLine: boolean
  left: number
}
