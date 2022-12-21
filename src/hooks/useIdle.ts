import { useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { throttle } from 'throttle-debounce'

import { contentModalAtom, folderModalAtom } from 'atoms/togglable'

const activityEvents: (keyof WindowEventMap)[] = ['keydown', 'mousedown', 'mousemove', 'resize', 'touchstart', 'wheel']

export function useIdle(idleHandler: () => void, durationInSeconds = 10) {
  const [idle, setIdle] = useState(false)

  const enabled = useRef(true)
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  const { opened: folderModalOpened } = useAtomValue(folderModalAtom)
  const { opened: contentModalOpened } = useAtomValue(contentModalAtom)

  useEffect(() => {
    enabled.current = true

    function startIdleTimer() {
      timeout.current = setTimeout(() => {
        if (enabled.current) {
          setIdle(true)
        }
      }, durationInSeconds * 1000)
    }

    const handleActivity = throttle(250, () => {
      setIdle(false)

      if (timeout.current) {
        clearTimeout(timeout.current)
      }

      startIdleTimer()
    })

    function handleVisibilityChange() {
      if (!document.hidden) {
        handleActivity()
      }
    }

    const eventListenerOptions: AddEventListenerOptions & EventListenerOptions = { passive: true }

    document.addEventListener('visibilitychange', handleVisibilityChange, eventListenerOptions)

    for (const event of activityEvents) {
      window.addEventListener(event, handleActivity, eventListenerOptions)
    }

    startIdleTimer()

    return () => {
      enabled.current = false

      if (timeout.current) {
        clearTimeout(timeout.current)
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange, eventListenerOptions)

      for (const event of activityEvents) {
        window.removeEventListener(event, handleActivity, eventListenerOptions)
      }
    }
  }, [durationInSeconds])

  useEffect(() => {
    // Opening a modal triggering a navigation should mark the user as idle.
    if (enabled.current && (folderModalOpened || contentModalOpened)) {
      setIdle(true)
    }
  }, [folderModalOpened, contentModalOpened])

  useEffect(() => {
    if (idle) {
      idleHandler()
    }
  }, [idle, idleHandler])
}
