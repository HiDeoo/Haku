import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { onlineAtom } from 'atoms/network'

const NetworkAgent: React.FC = () => {
  const setOnline = useUpdateAtom(onlineAtom)

  useEffect(() => {
    function onNetworkStatusChange() {
      setOnline(navigator.onLine)
    }

    const eventListenerOptions: AddEventListenerOptions & EventListenerOptions = { passive: true }

    window.addEventListener('online', onNetworkStatusChange, eventListenerOptions)
    window.addEventListener('offline', onNetworkStatusChange, eventListenerOptions)

    return () => {
      window.removeEventListener('online', onNetworkStatusChange, eventListenerOptions)
      window.removeEventListener('offline', onNetworkStatusChange, eventListenerOptions)
    }
  }, [setOnline])

  return null
}

export default NetworkAgent
