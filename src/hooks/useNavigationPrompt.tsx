import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'

import useRouteChange from './useRouteChange'

// https://github.com/vercel/next.js/issues/2476#issuecomment-850030407
export default function useNavigationPrompt(
  enabled: boolean,
  message = 'Are you sure that you want to leave this page with unsaved changes?'
) {
  const router = useRouter()

  const prevHistoryState = useRef(window.history.state)

  useRouteChange(() => {
    prevHistoryState.current = window.history.state
  })

  useEffect(() => {
    let prompted = false

    function onRouteChangeStart(url: string) {
      if (router.asPath !== url && enabled && !prompted) {
        prompted = true

        if (window.confirm(message)) {
          router.push(url)
        } else {
          prompted = false

          router.events.emit('routeChangeError')

          const state = prevHistoryState.current

          if (state && history.state && state.idx !== history.state.idx) {
            history.go(state.idx < history.state.idx ? -1 : 1)
          }

          throw `Route change to "${url}" aborted by the user. You can safely ignore this error.`
        }
      }
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (enabled && !prompted) {
        event.preventDefault()

        return (event.returnValue = message)
      }

      return null
    }

    router.events.on('routeChangeStart', onRouteChangeStart)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [enabled, message, router])
}
