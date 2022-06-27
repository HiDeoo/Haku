import { useEffect, useState } from 'react'

export function useDelay(enabled = true, delayInMs = 250): boolean {
  const [pastDelay, setPastDelay] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (enabled) {
      timeout = setTimeout(() => {
        setPastDelay(true)
      }, delayInMs)
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [delayInMs, enabled])

  return pastDelay
}
