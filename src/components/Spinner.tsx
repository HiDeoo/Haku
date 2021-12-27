import clsx from 'clsx'
import { useEffect, useState } from 'react'

const Spinner: React.FC<Props> = ({ className, color, delay }) => {
  const [pastDelay, setPastDelay] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (delay) {
      timeout = setTimeout(() => {
        setPastDelay(true)
      }, 250)
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [delay])

  // Avoid a flash of the spinner if a component / route loads really quickly (<250ms).
  if (delay && !pastDelay) {
    return null
  }

  const spinnerClasses = clsx('animate-spin-slow', color ?? 'text-blue-50/40', className)

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className={spinnerClasses}>
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
        className="stroke-current motion-safe:animate-dash [stroke-linecap:round]"
      ></circle>
    </svg>
  )
}

export default Spinner

interface Props {
  className?: string
  color?: string
  delay?: boolean
}
