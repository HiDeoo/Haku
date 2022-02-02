import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function useRouteChange(callback: () => void) {
  const router = useRouter()

  useEffect(() => {
    router.events.on('routeChangeStart', callback)

    return () => {
      router.events.off('routeChangeStart', callback)
    }
  }, [callback, router.events])
}
