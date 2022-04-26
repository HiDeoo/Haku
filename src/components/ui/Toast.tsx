import { Action, Close, Description, Root } from '@radix-ui/react-toast'
import { useSetAtom } from 'jotai'
import { useCallback, useRef } from 'react'
import { RiCloseLine } from 'react-icons/ri'

import { removeToastAtom, type WarmToast } from 'atoms/toast'
import Button from 'components/form/Button'
import IconButton from 'components/form/IconButton'
import Icon from 'components/ui/Icon'
import styles from 'styles/Toast.module.css'

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const toastRoot = useRef<HTMLLIElement>(null)

  const removeToast = useSetAtom(removeToastAtom)

  const onToastOpenChange = useCallback(
    (opened: boolean) => {
      if (!opened) {
        toastRoot.current?.addEventListener(
          'animationend',
          () => {
            removeToast(toast.id)
          },
          { once: true }
        )
      }
    },
    [removeToast, toast.id]
  )

  return (
    <Root
      ref={toastRoot}
      type={toast.type}
      className={styles.toast}
      duration={toast.duration}
      onOpenChange={onToastOpenChange}
    >
      <div className="mt-0.5 shrink-0 p-0.5 text-zinc-300">
        <Icon icon={toast.icon} label={toast.text} />
      </div>
      <Description className="mt-0.5 pr-2">
        <p>{toast.text}</p>
        {toast.details ? <p className="mt-1 text-zinc-300">{toast.details}</p> : null}
        {toast.action && toast.actionLabel ? (
          <Action asChild onClick={toast.action} altText={toast.actionLabel}>
            <Button
              pressedClassName="bg-blue-400 hover:bg-blue-400"
              className="mt-2 bg-blue-600 shadow-none hover:bg-blue-500"
            >
              {toast.actionLabel}
            </Button>
          </Action>
        ) : null}
      </Description>
      <Close asChild>
        <IconButton
          icon={RiCloseLine}
          aria-label="Dismiss"
          iconClassName="h-5 w-5"
          className="shrink-0 rounded-full p-0.5 text-zinc-300 hover:bg-zinc-500 hover:text-blue-50"
        />
      </Close>
    </Root>
  )
}

export default Toast

interface ToastProps {
  toast: WarmToast
}
