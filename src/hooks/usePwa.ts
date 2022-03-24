import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { RiRefreshLine } from 'react-icons/ri'

import { deferrefPromptEventAtom } from 'atoms/pwa'
import useToast from 'hooks/useToast'
import { registerServiceWorker } from 'libs/sw'

export default function usePwa() {
  const { addToast } = useToast()
  const setDeferrefPromptEventAtom = useUpdateAtom(deferrefPromptEventAtom)

  useEffect(() => {
    function onLoad() {
      registerServiceWorker('/sw.js', (updateServiceWorker) => {
        addToast({
          action: updateServiceWorker,
          actionLabel: 'Refresh',
          duration: 86_400_000, // 1 day
          icon: RiRefreshLine,
          text: 'A new version of Haku is available.',
          type: 'background',
        })
      })

      if (navigator.serviceWorker.controller?.state === 'activated') {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR' })
      }
    }

    window.addEventListener('load', onLoad, { once: true, passive: true })
  }, [addToast])

  useEffect(() => {
    function beforeInstallPrompt(event: BeforeInstallPromptEvent) {
      event.preventDefault()

      setDeferrefPromptEventAtom(event)
    }

    window.addEventListener('beforeinstallprompt', beforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPrompt)
    }
  }, [setDeferrefPromptEventAtom])
}
