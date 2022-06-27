import { Editor } from '@tiptap/core'
import { createContext, useContext, useEffect, useRef } from 'react'

import { isFocusable } from 'libs/html'

export const FocusRestorationContext = createContext<{ noteEditor: Editor | undefined }>({ noteEditor: undefined })

export default function useFocusRestoration(enabled?: boolean) {
  const { noteEditor } = useContext(FocusRestorationContext)

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
        if (noteEditor) {
          noteEditor.commands.focus()
        } else {
          originalFocusedElement.current.focus()
        }

        originalFocusedElement.current = undefined
      }
    }
  }, [enabled, noteEditor])
}
