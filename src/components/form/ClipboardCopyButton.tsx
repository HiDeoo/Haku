import { forwardRef, useCallback, useRef, useState } from 'react'
import { RiCheckLine, RiClipboardLine, RiErrorWarningLine } from 'react-icons/ri'

import IconButton, { type IconButtonProps } from 'components/form/IconButton'
import useToast from 'hooks/useToast'
import clst from 'styles/clst'

const ClipboardCopyButton = forwardRef<HTMLButtonElement, ClipboardCopyButtonProps>(
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
          icon: RiErrorWarningLine,
          text: 'Failed to copy to the clipboard.',
          type: 'foreground',
        })
      } finally {
        iconTimeout.current = setTimeout(() => {
          setStatus('idle')
        }, 1000)
      }
    }, [addToast, content])

    const icon = status === 'idle' ? RiClipboardLine : status === 'copied' ? RiCheckLine : RiErrorWarningLine
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

export default ClipboardCopyButton

interface ClipboardCopyButtonProps extends Omit<IconButtonProps, 'icon'> {
  content: string
}
