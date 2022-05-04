import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function useRouteChange(callback: () => void) {
  const { asPath, events } = useRouter()

  useEffect(() => {
    function onRouteChangeStart(url: string) {
      if (asPath !== url) {
        callback()
      }
    }

    events.on('routeChangeStart', onRouteChangeStart)

    return () => {
      events.off('routeChangeStart', onRouteChangeStart)
    }
  }, [callback, asPath, events])
}
