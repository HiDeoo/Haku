import { Provider, Viewport } from '@radix-ui/react-toast'
import { useAtomValue } from 'jotai'

import { toastsAtom } from 'atoms/toast'
import { Toast } from 'components/ui/Toast'
import { isNotEmpty } from 'libs/array'
import { clst } from 'styles/clst'

export const Toaster = () => {
  const toasts = useAtomValue(toastsAtom)

  const viewportClasses = clst(
    'fixed max-h-screen z-[60] flex max-w-md flex-col items-end gap-2.5 p-3.5',
    'supports-max:bottom-[max(0px,env(safe-area-inset-bottom))]',
    'supports-max:right-[max(0px,env(safe-area-inset-right))]',
    'overflow-y-auto overflow-x-hidden',
    'focus:outline-none',
    isNotEmpty(toasts) && 'focus-visible:ring-2 focus-visible:ring-blue-600'
  )

  return (
    <Provider>
      <Viewport className={viewportClasses} />
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </Provider>
  )
}

export type ToasterProps = Record<string, never>
