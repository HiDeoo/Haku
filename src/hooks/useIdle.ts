import { useEffect, useRef, useState } from 'react'
import { throttle } from 'throttle-debounce'

const activityEvents: (keyof WindowEventMap)[] = ['keydown', 'mousedown', 'mousemove', 'resize', 'touchstart', 'wheel']

export default function useIdle(durationInSeconds = 5) {
  const [idle, setIdle] = useState(false)

  const enabled = useRef(true)
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    function startIdleTimer() {
      timeout.current = setTimeout(() => {
        if (enabled.current) {
          setIdle(true)
        }
      }, durationInSeconds * 1_000)
    }

    const onActivity = throttle(250, () => {
      setIdle(false)

      if (timeout.current) {
        clearTimeout(timeout.current)
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
      enabled.current = false

      if (timeout?.current) {
        clearTimeout(timeout.current)
      }

      document.removeEventListener('visibilitychange', onVisibilityChange)

      for (const event of activityEvents) {
        window.removeEventListener(event, onActivity)
      }
    }
  }, [durationInSeconds])

  return idle
}
