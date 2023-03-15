import { forwardRef, useCallback, useRef, useState } from 'react'
import IconCheckLine from '~icons/ri/check-line'
import IconClipboardLine from '~icons/ri/clipboard-line'
import IconErrorWarningLine from '~icons/ri/error-warning-line'

import { IconButton, type IconButtonProps } from 'components/form/IconButton'
import { useToast } from 'hooks/useToast'
import { clst } from 'styles/clst'

export const ClipboardCopyButton = forwardRef<HTMLButtonElement, ClipboardCopyButtonProps>(
  ({ content, ...props }, forwardedRef) => {
    const { addToast } = useToast()

    const iconTimeout = useRef<ReturnType<typeof setTimeout>>()

    const [status, setStatus] = useState<'idle' | 'copied' | 'errored'>('idle')

    const handleCopyPress = useCallback(async () => {
      try {
        if (iconTimeout.current) {
          clearTimeout(iconTimeout.current)
        }

        await navigator.clipboard.writeText(content)

        setStatus('copied')
      } catch (error) {
        setStatus('errored')

        console.error('Failed to copy inbox entry to the clipboard:', error)

        addToast({
          details: 'Please try again.',
          icon: IconErrorWarningLine,
          text: 'Failed to copy to the clipboard.',
          type: 'foreground',
        })
      } finally {
        iconTimeout.current = setTimeout(() => {
          setStatus('idle')
        }, 1000)
      }
    }, [addToast, content])

    const icon = status === 'idle' ? IconClipboardLine : status === 'copied' ? IconCheckLine : IconErrorWarningLine
    const iconClasses = clst(status !== 'idle' && 'motion-safe:animate-bounce-in')

    return (
      <IconButton
        {...props}
        icon={icon}
        tooltip="Copy"
        ref={forwardedRef}
        onPress={handleCopyPress}
        iconClassName={iconClasses}
      />
    )
  }
)

ClipboardCopyButton.displayName = 'ClipboardCopyButton'

interface ClipboardCopyButtonProps extends Omit<IconButtonProps, 'icon'> {
  content: string
}
