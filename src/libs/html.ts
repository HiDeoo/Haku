// As of 02/15/22, the `userAgentData` Navigator API is currently not available on any iOS browser.
// https://caniuse.com/mdn-api_navigator_useragentdata
export const isPlatformMacOS =
  (isUserAgentDataPlatformAvailable() && navigator.userAgentData?.platform === 'macOS') ||
  (typeof navigator === 'object' && /Mac|iPad|iPhone|iPod/.test(navigator.platform))

export function isPwa() {
  return (
    (typeof navigator === 'object' && 'standalone' in navigator && (navigator as SafariNavigator).standalone) ||
    (typeof window === 'object' && window.matchMedia('(display-mode: standalone)').matches)
  )
}

export function isTextInputElement(element: EventTarget | Element | null): boolean {
  if (!(element instanceof Element)) {
    return false
  }

  const textInput = element.closest('input, textarea, [contenteditable=true], [contenteditable=plaintext-only]')

  if (!textInput) {
    return false
  }

  if (
    isHTMLInputElement(textInput) &&
    (textInput.type === 'checkbox' || textInput.type === 'radio' || textInput.readOnly)
  ) {
    return false
  }

  return true
}

export function getContentEditableCaretIndex(element: HTMLElement): number | undefined {
  const range = window.getSelection()?.getRangeAt(0)

  if (!range) {
    return
  }

  const selectionRange = range.cloneRange()
  selectionRange.selectNodeContents(element)
  selectionRange.setEnd(range.endContainer, range.endOffset)

  return selectionRange.toString().length
}

export function setContentEditableCaretIndex(element: HTMLElement, index = 0) {
  if (!element.firstChild) {
    return
  }

  const range = document.createRange()
  range.setStart(element.firstChild, index)
  range.setEnd(element.firstChild, index)

  document.getSelection()?.removeAllRanges()
  document.getSelection()?.addRange(range)
}

export function setContentEditableCaretPosition(
  element: HTMLElement,
  position: CaretPosition,
  direction: CaretDirection
) {
  const lines = getContentEditableLines(element)
  const isGoingDown = direction === 'down'

  const line = lines[isGoingDown ? 0 : lines.length - 1]

  if (!line || (line.range[0] === 0 && line.range[1] === 0)) {
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

  let textIndex = 0
  let textOffset = position.left

  for (let index = 0; index <= line.text.length; index++) {
    textElement.textContent = line.text.slice(0, index)

    const offset = Math.abs(position.left - textElement.clientWidth)

    if (offset > textOffset) {
      break
    }

    textIndex = index
    textOffset = offset
  }

  if (!isGoingDown) {
    textIndex += line.range[0]
  }

  setContentEditableCaretIndex(element, textIndex)

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

  const lines = getContentEditableLines(element)

  const firstLine = lines[0]
  const lastLine = lines[lines.length - 1]

  if (!firstLine || !lastLine) {
    return { atFirstLine: true, atLastLine: true, left: 0 }
  }

  const left = selectionRange.getBoundingClientRect().left - element.offsetLeft

  if (lines.length === 1) {
    return { atFirstLine: true, atLastLine: true, left }
  }

  return {
    atFirstLine: firstLine.range[0] <= selectionRange.startOffset && selectionRange.startOffset < firstLine.range[1],
    atLastLine: lastLine.range[0] < selectionRange.startOffset && selectionRange.startOffset <= lastLine.range[1],
    left,
  }
}

function getContentEditableLines(element: HTMLElement): ContentEditableLine[] {
  if (!element.firstChild || !element.textContent) {
    return []
  }

  const elementRange = document.createRange()
  elementRange.selectNodeContents(element)
  elementRange.collapse()

  const lineRange = elementRange.cloneRange()
  lineRange.setEnd(element.firstChild, 1)

  let lineHeight
  let prevLineHeight = lineRange.getBoundingClientRect().height

  const lines: ContentEditableLine[] = []

  // Increase the range progressively by looping through each characters to detect line height changes.
  for (let index = 0; index < element.textContent.length; index++) {
    elementRange.setEnd(element.firstChild, index)
    lineRange.setEnd(element.firstChild, index)

    lineHeight = lineRange.getBoundingClientRect().height

    if (lineHeight > prevLineHeight || index === element.textContent.length - 1) {
      // When hitting a new line, revert to the previous range to get the complete line (ignoring the end of text).
      elementRange.setEnd(element.firstChild, index - (index !== element.textContent.length - 1 ? 1 : -1))

      lines.push({ range: [elementRange.startOffset, elementRange.endOffset], text: elementRange.toString() })

      // Continue at the end of the previous line (ignoring the end of text).
      if (index !== element.textContent.length - 1) {
        elementRange.setStart(element.firstChild, index - 1)
      }

      prevLineHeight = lineHeight
    }
  }

  return lines
}

function isUserAgentDataPlatformAvailable(): boolean {
  return typeof navigator === 'object' && !!navigator.userAgentData && !!navigator.userAgentData.platform
}

function isHTMLInputElement(element: Element): element is HTMLInputElement {
  return element.tagName === 'INPUT'
}

export interface CaretPosition {
  atFirstLine: boolean
  atLastLine: boolean
  left: number
}

interface ContentEditableLine {
  range: [number, number]
  text: string
}

export type CaretDirection = 'down' | 'up'

interface SafariNavigator extends Navigator {
  // Available on Apple’s iOS Safari only.
  standalone: boolean
}
