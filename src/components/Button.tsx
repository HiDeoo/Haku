import { useButton } from '@react-aria/button'
import { useObjectRef } from '@react-aria/utils'
import clsx from 'clsx'
import { forwardRef, type HTMLAttributes, type PropsWithChildren } from 'react'

import Flex from 'components/Flex'
import Spinner from 'components/Spinner'

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
  (
    {
      children,
      className,
      disabled,
      loading,
      onMouseEnter,
      onMouseLeave,
      pressedClassName,
      primary,
      tabIndex,
      ...props
    },
    forwardedRef
  ) => {
    const useButtonProps: UseButtonProps = isButtonPropsWithOnClickHandler(props)
      ? { onPress: props.onPress ?? onDeprecatedOnClick, type: props.type }
      : props

    const ref = useObjectRef(forwardedRef)
    const { buttonProps, isPressed } = useButton(
      { ...useButtonProps, isDisabled: disabled, preventFocusOnPress: true },
      ref
    )

    const buttonClasses = clsx(
      {
        'bg-zinc-600 hover:bg-zinc-500 disabled:bg-zinc-600/50': !primary && !isPressed,
        'bg-blue-600 hover:bg-blue-500 disabled:bg-blue-500/60': primary && !isPressed,
        'bg-zinc-400': !primary && isPressed,
        'bg-blue-400': primary && isPressed,
      },
      pressedClassName && { [pressedClassName]: isPressed },
      'shadow-sm shadow-zinc-900/50 disabled:shadow-none',
      'disabled:cursor-not-allowed disabled:opacity-75',
      'focus:outline-none',
      'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-800 focus-visible:ring-offset-2',
      'min-w-[70px] px-3.5 py-1.5 mx-1.5 first-of-type:ml-0 last-of-type:mr-0',
      'rounded-md',
      className
    )

    function onDeprecatedOnClick(event: PressEvent) {
      if (isButtonPropsWithOnClickHandler(props)) {
        props.onClick(event)
      }
    }

    return (
      <button
        {...buttonProps}
        ref={ref}
        tabIndex={tabIndex}
        className={buttonClasses}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {loading ? (
          <Flex justifyContent="center">
            <Spinner className="h-4 w-4 my-0.5" color="text-blue-50/80" />
          </Flex>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

function isButtonPropsWithOnClickHandler(props: ButtonProps): props is ButtonPropsWithOnClickHandler {
  return typeof (props as ButtonPropsWithOnClickHandler).onClick !== 'undefined'
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
  tabIndex?: HTMLAttributes<HTMLButtonElement>['tabIndex']
  type?: 'submit'
}

interface ButtonPropsWithOnClickHandler extends ButtonProps {
  /**
   * Some third-party library might use a button and attach it an `onClick` event handler.
   * @see https://react-spectrum.adobe.com/react-aria/usePress.html#features
   */
  onClick: (event: PressEvent) => void
}

type UseButtonProps = Parameters<typeof useButton>[0]

type PressEvent = Parameters<NonNullable<UseButtonProps['onPress']>>[0]
