import { useEffect, useState } from 'react'
import { throttle } from 'throttle-debounce'

const activityEvents: (keyof WindowEventMap)[] = ['keydown', 'mousedown', 'mousemove', 'resize', 'touchstart', 'wheel']

export default function useIdle(durationInSeconds = 5) {
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    function startIdleTimer() {
      timeout = setTimeout(() => {
        setIdle(true)
      }, durationInSeconds * 1_000)
    }

    const onActivity = throttle(250, () => {
      setIdle(false)

      if (timeout) {
        clearTimeout(timeout)
      }

      startIdleTimer()
    })

    function onVisibilityChange() {
      if (!document.hidden) {
        onActivity()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    for (const event of activityEvents) {
      window.addEventListener(event, onActivity)
    }

    startIdleTimer()

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)

      for (const event of activityEvents) {
        window.removeEventListener(event, onActivity)
      }
    }
  }, [durationInSeconds])

  return idle
}
