import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function useRouteChange(callback: () => void) {
  const router = useRouter()

  useEffect(() => {
    function onRouteChangeStart(url: string) {
      if (router.asPath !== url) {
        callback()
      }
    }

    router.events.on('routeChangeStart', onRouteChangeStart)

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart)
    }
  }, [callback, router.asPath, router.events])
}
