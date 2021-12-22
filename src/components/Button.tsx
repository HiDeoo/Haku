import { useButton } from '@react-aria/button'
import clsx from 'clsx'
import { useRef } from 'react'

const Button: React.FC<ButtonProps> = ({ children, className, disabled, pressedClassName, primary, ...props }) => {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps, isPressed } = useButton({ ...props, isDisabled: disabled, preventFocusOnPress: true }, ref)

  const buttonClasses = clsx(
    {
      'bg-red-600 hover:bg-red-500': !primary && !isPressed,
      'bg-blue-600 hover:bg-blue-500': primary && !isPressed,
      'bg-red-400': !primary && isPressed,
      'bg-blue-400': primary && isPressed,
    },
    pressedClassName && { [pressedClassName]: isPressed },
    'disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-800 focus-visible:ring-offset-2',
    'px-3.5 py-1 mx-1.5 first:ml-0 last:mr-0',
    'rounded',
    className
  )

  return (
    <button {...buttonProps} ref={ref} className={buttonClasses}>
      {children}
    </button>
  )
}

export default Button

export interface ButtonProps {
  className?: string
  disabled?: UseButtonProps['isDisabled']
  onPress: UseButtonProps['onPress']
  pressedClassName?: string
  primary?: boolean
}

type UseButtonProps = Parameters<typeof useButton>[0]
