import clsx from 'clsx'
import { useEffect, useRef } from 'react'

import Button from 'components/Button'
import Modal, { type ModalProps } from 'components/Modal'

const Alert: React.FC<AlertProps> = ({
  cancelText = 'Cancel',
  children,
  confirmText = 'Confirm',
  disabled,
  loading,
  onConfirm,
  onOpenChange,
  opened,
  title,
}) => {
  const confirmButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let animationFrame: ReturnType<typeof requestAnimationFrame>

    if (opened) {
      animationFrame = requestAnimationFrame(() => {
        confirmButton.current?.focus()
      })
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [opened])

  const confirmButtonClasses = clsx(
    '!bg-red-600 hover:!bg-red-500 disabled:!bg-red-500/60 focus:ring-2',
    'focus-visible:!ring-red-600 focus:ring-red-600 focus:ring-offset-zinc-800 focus:ring-offset-2'
  )

  return (
    <Modal
      title={title}
      opened={opened}
      disabled={disabled}
      onOpenChange={onOpenChange}
      contentClassName="!max-w-[400px]"
    >
      {children}
      <Modal.Footer disabled={disabled} closeText={cancelText}>
        <Button
          primary
          loading={loading}
          ref={confirmButton}
          disabled={disabled}
          onPress={onConfirm}
          className={confirmButtonClasses}
          pressedClassName="!bg-red-400 hover:!bg-red-400"
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default Alert

interface AlertProps {
  cancelText?: string
  confirmText?: string
  disabled?: ModalProps['disabled']
  loading?: boolean
  onConfirm?: () => void
  onOpenChange: ModalProps['onOpenChange']
  opened: ModalProps['opened']
  title: string
}
