import { type ToastImplProps } from '@radix-ui/react-toast'
import { atom } from 'jotai/vanilla'
import IconNotification2Line from '~icons/ri/notification-2-line'

import { type IconProps } from 'components/ui/Icon'

let toastId = 0

export const toastsAtom = atom<WarmToast[]>([])

export const addToastAtom = atom(null, (_, set, newToast: AtomParamsNewToast) => {
  set(toastsAtom, (prevToasts) => [
    ...prevToasts,
    {
      ...newToast,
      icon: newToast.icon ?? IconNotification2Line,
      id: toastId++,
      type: newToast.type ?? 'foreground',
    },
  ])
})

export const removeToastAtom = atom(null, (_, set, toastId: WarmToast['id']) => {
  set(toastsAtom, (prevToasts) => prevToasts.filter((toast) => toast.id !== toastId))
})

export interface WarmToast {
  action?: () => void
  actionLabel?: string
  details?: string
  duration?: number
  icon: IconProps['icon']
  id: number
  text: string
  type: ToastImplProps['type']
}

type AtomParamsNewToast = Pick<WarmToast, 'action' | 'actionLabel' | 'text' | 'details'> & {
  duration?: ToastImplProps['duration'] // In milliseconds
  icon?: IconProps['icon']
  type?: ToastImplProps['type']
}
