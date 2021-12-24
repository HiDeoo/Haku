import clsx from 'clsx'
import { useEffect, useState } from 'react'

import styles from 'styles/Spinner.module.css'

const Spinner: React.FC<Props> = ({ className, color, delay }) => {
  const spinnerClasses = clsx(styles.spinner, color ?? styles.spinnerColor, className)

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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className={spinnerClasses}>
      <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" className={styles.circle}></circle>
    </svg>
  )
}

export default Spinner

interface Props {
  className?: string
  color?: string
  delay?: boolean
}
