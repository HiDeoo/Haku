import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function useRouteChange(callback: () => void) {
  const { asPath, events } = useRouter()

  useEffect(() => {
    function handleRouteChangeStart(url: string) {
      if (asPath !== url) {
        callback()
      }
    }

    events.on('routeChangeStart', handleRouteChangeStart)

    return () => {
      events.off('routeChangeStart', handleRouteChangeStart)
    }
  }, [callback, asPath, events])
}
