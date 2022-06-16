import { useEffect, useRef } from 'react'

import { isFocusable } from 'libs/html'

export function useRestoreFocus(enabled?: boolean) {
  const originalFocusedElement = useRef<HTMLElement>()

  useEffect(() => {
    if (
      enabled &&
      document.activeElement &&
      document.activeElement instanceof HTMLElement &&
      isFocusable(document.activeElement)
    ) {
      originalFocusedElement.current = document.activeElement
    }

    return () => {
      if (enabled && originalFocusedElement.current) {
        originalFocusedElement.current.focus()

        originalFocusedElement.current = undefined
      }
    }
  }, [enabled])
}
