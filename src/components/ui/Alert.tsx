import { useEffect, useRef } from 'react'

import { Button } from 'components/form/Button'
import { Modal, type ModalProps } from 'components/ui/Modal'
import { clst } from 'styles/clst'

export const Alert = ({
  cancelText = 'Cancel',
  children,
  confirmText = 'Confirm',
  disabled,
  loading,
  onConfirm,
  onOpenChange,
  opened,
  title,
}: AlertProps) => {
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

  const confirmButtonClasses = clst(
    'bg-red-600 hover:bg-red-500 disabled:bg-red-500/60 focus:ring-2',
    'focus-visible:ring-red-600 focus:ring-red-600 focus:ring-offset-zinc-800 focus:ring-offset-2'
  )

  return (
    <Modal
      title={title}
      opened={opened}
      role="alertdialog"
      disabled={disabled}
      onOpenChange={onOpenChange}
      contentClassName="max-w-[400px]"
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
          pressedClassName="bg-red-400 hover:bg-red-400"
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

interface AlertProps {
  cancelText?: string
  children: React.ReactNode
  confirmText?: string
  disabled?: ModalProps['disabled']
  loading?: boolean
  onConfirm?: () => void
  onOpenChange: ModalProps['onOpenChange']
  opened: ModalProps['opened']
  title: string
}
