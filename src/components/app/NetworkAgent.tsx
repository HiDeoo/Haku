import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { onlineAtom } from 'atoms/network'

export const NetworkAgent: React.FC = () => {
  const setOnline = useSetAtom(onlineAtom)

  useEffect(() => {
    function handleNetworkStatusChange() {
      setOnline(navigator.onLine)
    }

    const eventListenerOptions: AddEventListenerOptions & EventListenerOptions = { passive: true }

    window.addEventListener('online', handleNetworkStatusChange, eventListenerOptions)
    window.addEventListener('offline', handleNetworkStatusChange, eventListenerOptions)

    return () => {
      window.removeEventListener('online', handleNetworkStatusChange, eventListenerOptions)
      window.removeEventListener('offline', handleNetworkStatusChange, eventListenerOptions)
    }
  }, [setOnline])

  return null
}
