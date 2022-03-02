import { useEffect, useState } from 'react'

export default function useIntersectionObserver(
  ref: React.RefObject<Element>,
  { enabled }: useIntersectionObserverOptions
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIsIntersecting(entry.isIntersecting)
      }
    }, {})

    if (enabled && ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      setIsIntersecting(false)

      observer.disconnect()
    }
  }, [enabled, ref])

  return isIntersecting
}

interface useIntersectionObserverOptions {
  enabled: boolean
}
