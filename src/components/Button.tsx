import { useButton } from '@react-aria/button'
import { useObjectRef } from '@react-aria/utils'
import clsx from 'clsx'
import { forwardRef, type HTMLAttributes, type PropsWithChildren } from 'react'

import Flex from 'components/Flex'

const Button: React.FC<ButtonProps> = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
  (
    { children, className, disabled, loading, onMouseEnter, onMouseLeave, pressedClassName, primary, ...props },
    forwardedRef
  ) => {
    const ref = useObjectRef(forwardedRef)
    const { buttonProps, isPressed } = useButton({ ...props, isDisabled: disabled, preventFocusOnPress: true }, ref)

    const buttonClasses = clsx(
      {
        'bg-red-600 hover:bg-red-500 disabled:bg-red-500/60': !primary && !isPressed,
        'bg-blue-600 hover:bg-blue-500 disabled:bg-blue-500/60': primary && !isPressed,
        'bg-red-400': !primary && isPressed,
        'bg-blue-400': primary && isPressed,
      },
      pressedClassName && { [pressedClassName]: isPressed },
      'disabled:cursor-not-allowed disabled:opacity-75',
      'focus:outline-none',
      'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-800 focus-visible:ring-offset-2',
      'px-3.5 py-1.5 mx-1.5 first-of-type:ml-0 last-of-type:mr-0',
      'rounded-md',
      className
    )

    return (
      <button
        {...buttonProps}
        ref={ref}
        className={buttonClasses}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {loading ? <LoadingSpinner /> : children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

const LoadingSpinner: React.FC = () => {
  return (
    <Flex justifyContent="center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 my-0.5 animate-spin">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
        <path
          fill="currentColor"
          className="opacity-75"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </Flex>
  )
}

export interface ButtonProps {
  className?: string
  disabled?: UseButtonProps['isDisabled']
  loading?: boolean
  onMouseEnter?: HTMLAttributes<HTMLButtonElement>['onMouseEnter']
  onMouseLeave?: HTMLAttributes<HTMLButtonElement>['onMouseLeave']
  onPress?: UseButtonProps['onPress']
  pressedClassName?: string
  primary?: boolean
  type?: 'submit'
}

type UseButtonProps = Parameters<typeof useButton>[0]
