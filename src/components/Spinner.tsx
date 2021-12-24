import clsx from 'clsx'
import { useEffect, useState } from 'react'

const Spinner: React.FC<Props> = ({ className, delay }) => {
  const classes = clsx('animate-spin', className)

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

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={classes}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
      <path
        fill="currentColor"
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )
}

export default Spinner

interface Props {
  className?: string
  delay?: boolean
}
