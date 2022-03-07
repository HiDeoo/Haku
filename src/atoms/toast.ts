import { type ToastImplProps } from '@radix-ui/react-toast'
import { atom } from 'jotai'
import { RiNotification2Line } from 'react-icons/ri'

import { type IconProps } from 'components/ui/Icon'

let toastId = 0

export const toastsAtom = atom<WarmToast[]>([])

export const addToastAtom = atom(null, (_, set, newToast: AtomParamsNewToast) => {
  set(toastsAtom, (prevToasts) => [
    ...prevToasts,
    {
      ...newToast,
      icon: newToast.icon ?? RiNotification2Line,
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
  duration?: number
  icon: IconProps['icon']
  id: number
  text: string
  type: ToastImplProps['type']
}

type AtomParamsNewToast = Pick<WarmToast, 'action' | 'actionLabel' | 'text'> & {
  duration?: ToastImplProps['duration'] // In milliseconds
  icon?: IconProps['icon']
  type?: ToastImplProps['type']
}
