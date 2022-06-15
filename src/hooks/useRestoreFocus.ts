import { useEffect, useRef } from 'react'

export function useRestoreFocus(enabled?: boolean) {
  const originalFocusedElement = useRef<HTMLElement>()

  useEffect(() => {
    if (enabled && document.activeElement && document.activeElement instanceof HTMLElement) {
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
