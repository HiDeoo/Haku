import { useEffect, useRef } from 'react'

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function handleInterval() {
      savedCallback.current()
    }

    const interval = setInterval(handleInterval, delay)

    return () => {
      clearInterval(interval)
    }
  }, [delay])
}
