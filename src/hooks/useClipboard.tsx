import { useCallback } from 'react'
import { RiClipboardLine, RiErrorWarningLine } from 'react-icons/ri'

import useToast from './useToast'

export default function useClipboard() {
  const { addToast } = useToast()

  const copy = useCallback(
    async (text: string) => {
      let didError = false

      try {
        await navigator.clipboard.writeText(text)
      } catch (error) {
        didError = true

        console.error('Failed to copy inbox entry to the clipboard:', error)
      } finally {
        addToast({
          details: didError ? 'Please try again.' : undefined,
          icon: didError ? RiErrorWarningLine : RiClipboardLine,
          text: didError ? 'Failed to copy to the clipboard.' : 'Text copied to the clipboard.',
          type: didError ? 'foreground' : 'background',
        })
      }
    },
    [addToast]
  )

  return { copy }
}
