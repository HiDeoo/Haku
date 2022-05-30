import { useCallback, useRef, useState } from 'react'
import { RiCheckLine, RiClipboardLine, RiErrorWarningLine } from 'react-icons/ri'

import IconButton, { type IconButtonProps } from 'components/form/IconButton'
import useToast from 'hooks/useToast'
import clst from 'styles/clst'

const ClipboardCopyButton: React.FC<ClipboardCopyButtonProps> = ({ content, ...props }) => {
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
      }, 1_000)
    }
  }, [addToast, content])

  const icon = status === 'idle' ? RiClipboardLine : status === 'copied' ? RiCheckLine : RiErrorWarningLine
  const iconClasses = clst(status !== 'idle' && 'motion-safe:animate-bounce-in')

  return <IconButton tooltip="Copy" {...props} onPress={handleCopyPress} icon={icon} iconClassName={iconClasses} />
}

export default ClipboardCopyButton

interface ClipboardCopyButtonProps extends Omit<IconButtonProps, 'icon'> {
  content: string
}
