import { useEffect, useRef } from 'react'

export default function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function onInterval() {
      savedCallback.current()
    }

    const interval = setInterval(onInterval, delay)

    return () => {
      clearInterval(interval)
    }
  }, [delay])
}
