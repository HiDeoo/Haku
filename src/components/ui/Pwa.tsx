import { useEffect } from 'react'
import { RiRefreshLine } from 'react-icons/ri'

import useToast from 'hooks/useToast'
import { registerServiceWorker } from 'libs/sw'

const Pwa: React.FC = () => {
  const { addToast } = useToast()

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
    }

    window.addEventListener('load', onLoad, { once: true })
  }, [addToast])

  return null
}

export default Pwa
