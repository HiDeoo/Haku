import { useEffect, useRef, useState } from 'react'
import { throttle } from 'throttle-debounce'

const activityEvents: (keyof WindowEventMap)[] = ['keydown', 'mousedown', 'mousemove', 'resize', 'touchstart', 'wheel']

export default function useIdle(durationInSeconds = 10) {
  const [idle, setIdle] = useState(false)

  const enabled = useRef(true)
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    enabled.current = true

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

    const eventListenerOptions: AddEventListenerOptions & EventListenerOptions = { passive: true }

    document.addEventListener('visibilitychange', onVisibilityChange, eventListenerOptions)

    for (const event of activityEvents) {
      window.addEventListener(event, onActivity, eventListenerOptions)
    }

    startIdleTimer()

    return () => {
      enabled.current = false

      if (timeout?.current) {
        clearTimeout(timeout.current)
      }

      document.removeEventListener('visibilitychange', onVisibilityChange, eventListenerOptions)

      for (const event of activityEvents) {
        window.removeEventListener(event, onActivity, eventListenerOptions)
      }
    }
  }, [durationInSeconds])

  return idle
}
