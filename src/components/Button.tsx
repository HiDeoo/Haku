import { useButton } from '@react-aria/button'
import { useObjectRef } from '@react-aria/utils'
import { forwardRef } from 'react'

import Flex from 'components/Flex'
import Spinner from 'components/Spinner'
import clst from 'styles/clst'

const Button = forwardRef<HTMLButtonElement, React.PropsWithChildren<ButtonProps>>(
  (
    {
      children,
      className,
      disabled,
      loading,
      onKeyDown,
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

    function onDeprecatedOnClick(event: PressEvent) {
      if (isButtonPropsWithOnClickHandler(props)) {
        props.onClick(event)
      }
    }

    const buttonClasses = clst(
      {
        'bg-zinc-600 hover:bg-zinc-500 disabled:bg-zinc-600/50': !primary && !isPressed,
        'bg-blue-600 hover:bg-blue-500 disabled:bg-blue-500/60': primary && !isPressed,
        'bg-zinc-400': !primary && isPressed,
        'bg-blue-400': primary && isPressed,
      },
      'rounded-md shadow-sm shadow-zinc-900/50 disabled:shadow-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'focus:outline-none',
      'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-800 focus-visible:ring-offset-2',
      'min-w-[75px] px-3.5 py-1.5 mx-1.5 first-of-type:ml-0 last-of-type:mr-0',
      className,
      pressedClassName && { [pressedClassName]: isPressed }
    )

    return (
      <button
        {...buttonProps}
        ref={ref}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        className={buttonClasses}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={props['aria-label']}
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
  'aria-label'?: React.HTMLAttributes<HTMLButtonElement>['aria-label']
  className?: string
  disabled?: UseButtonProps['isDisabled']
  loading?: boolean
  onKeyDown?: React.HTMLAttributes<HTMLButtonElement>['onKeyDown']
  onMouseEnter?: React.HTMLAttributes<HTMLButtonElement>['onMouseEnter']
  onMouseLeave?: React.HTMLAttributes<HTMLButtonElement>['onMouseLeave']
  onPress?: UseButtonProps['onPress']
  pressedClassName?: string
  primary?: boolean
  tabIndex?: React.HTMLAttributes<HTMLButtonElement>['tabIndex']
  type?: 'submit'
}

export interface ButtonPropsWithOnClickHandler extends ButtonProps {
  /**
   * Some third-party library might use a button and attach it an `onClick` event handler.
   * @see https://react-spectrum.adobe.com/react-aria/usePress.html#features
   */
  onClick: (event: PressEvent) => void
}

type UseButtonProps = Parameters<typeof useButton>[0]

type PressEvent = Parameters<NonNullable<UseButtonProps['onPress']>>[0]
