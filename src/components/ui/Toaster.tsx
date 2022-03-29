import { Provider, Viewport } from '@radix-ui/react-toast'
import { useAtomValue } from 'jotai/utils'
import dynamic from 'next/dynamic'

import { toastsAtom } from 'atoms/toast'
import clst from 'styles/clst'

const Toast = dynamic(import('components/ui/Toast'))

const Toaster: React.FC = () => {
  const toasts = useAtomValue(toastsAtom)

  const viewportClasses = clst(
    'fixed max-h-screen z-[60] flex max-w-md flex-col items-end gap-2.5 p-3.5',
    'supports-max:bottom-[max(0px,env(safe-area-inset-bottom))]',
    'supports-max:right-[max(0px,env(safe-area-inset-right))]',
    'overflow-y-auto overflow-x-hidden',
    'focus:outline-none',
    {
      'focus-visible:ring-2 focus-visible:ring-blue-600': toasts.length > 0,
    }
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

export default Toaster
