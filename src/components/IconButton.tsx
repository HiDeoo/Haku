import clsx from 'clsx'
import { forwardRef } from 'react'

import Button, { type ButtonProps } from 'components/Button'
import Tooltip from 'components/Tooltip'

const IconButton = forwardRef<HTMLButtonElement, React.PropsWithChildren<Props>>(
  ({ children, className, tooltip, ...props }, forwardedRef) => {
    const buttonClasses = clsx(
      '!bg-inherit hover:!bg-zinc-700/75 hover:text-blue-600 disabled:!bg-inherit disabled:text-inherit shadow-none',
      'px-2 mx-0.5 min-w-0',
      className
    )

    const content = (
      <Button
        {...props}
        ref={forwardedRef}
        className={buttonClasses}
        aria-label={tooltip}
        pressedClassName="bg-blue-50/20 hover:!bg-blue-50/20"
      >
        {children}
      </Button>
    )

    return tooltip ? <Tooltip content={tooltip}>{content}</Tooltip> : content
  }
)

IconButton.displayName = 'IconButton'

export default IconButton

interface Props extends Omit<ButtonProps, 'primary'> {
  className?: string
  tabIndex?: ButtonProps['tabIndex']
  tooltip?: string
}
