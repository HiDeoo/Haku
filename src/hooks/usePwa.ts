import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { RiRefreshLine } from 'react-icons/ri'

import { deferrefPromptEventAtom } from 'atoms/pwa'
import useInterval from 'hooks/useInterval'
import useToast from 'hooks/useToast'
import { checkServiceWorkerUpdate, registerServiceWorker, sendServiceWorkerMessage } from 'libs/sw'

export default function usePwa() {
  const { addToast } = useToast()
  const setDeferrefPromptEventAtom = useSetAtom(deferrefPromptEventAtom)

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

      sendServiceWorkerMessage({ type: 'LOAD' })
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

  useInterval(() => {
    checkServiceWorkerUpdate()
  }, 86_400_000 /* 1 day */)
}
