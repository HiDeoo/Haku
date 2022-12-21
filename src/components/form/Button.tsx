import { useButton } from '@react-aria/button'
import { mergeProps, useObjectRef } from '@react-aria/utils'
import { type AriaButtonProps } from '@react-types/button'
import { forwardRef } from 'react'

import { Flex } from 'components/ui/Flex'
import { Spinner } from 'components/ui/Spinner'
import { clst } from 'styles/clst'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, disabled, loading, onPress, pressedClassName, primary, ...props }, forwardedRef) => {
    let sanitizedProps = props

    if (isButtonPropsWithOnClickHandler(props)) {
      const { onClick, ...propsWithoutOnClickHandler } = props

      sanitizedProps = propsWithoutOnClickHandler
    }

    const useButtonProps: UseButtonProps = {
      ...sanitizedProps,
      onPress: isButtonPropsWithOnClickHandler(props) ? handleDeprecatedClick : onPress,
    }

    const ref = useObjectRef(forwardedRef)
    const { buttonProps, isPressed } = useButton(
      { ...useButtonProps, isDisabled: disabled, preventFocusOnPress: true },
      ref
    )

    function handleDeprecatedClick(event: PressEvent) {
      if (isButtonPropsWithOnClickHandler(props)) {
        props.onClick(event)

        if (onPress) {
          onPress(event)
        }
      }
    }

    const buttonClasses = clst(
      !primary && !isPressed && 'bg-zinc-600 hover:bg-zinc-500 disabled:bg-zinc-600/50',
      primary && !isPressed && 'bg-blue-600 hover:bg-blue-500 disabled:bg-blue-500/60',
      !primary && isPressed && 'bg-zinc-400',
      primary && isPressed && 'bg-blue-400',
      'rounded-md shadow-sm shadow-zinc-900/50 disabled:shadow-none select-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'focus:outline-none',
      'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-800 focus-visible:ring-offset-2',
      'min-w-[75px] px-3.5 py-1.5 mx-1.5 first-of-type:ml-0 last-of-type:mr-0',
      className,
      pressedClassName !== undefined && isPressed && pressedClassName
    )

    return (
      <button {...mergeProps(sanitizedProps, buttonProps)} ref={ref} className={buttonClasses}>
        {loading ? (
          <Flex justifyContent="center">
            <Spinner className="my-0.5 h-4 w-4" color="text-zinc-100/80" />
          </Flex>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

function isButtonPropsWithOnClickHandler(props: ButtonProps): props is ButtonPropsWithOnClickHandler {
  return (props as Partial<ButtonPropsWithOnClickHandler>).onClick !== undefined
}

export interface ButtonProps {
  'aria-label'?: React.ComponentPropsWithoutRef<'button'>['aria-label']
  children?: React.ReactNode
  className?: string
  disabled?: UseButtonProps['isDisabled']
  id?: string
  loading?: boolean
  onPress?: UseButtonProps['onPress']
  pressedClassName?: string
  primary?: boolean
  tabIndex?: React.ComponentPropsWithoutRef<'button'>['tabIndex']
  type?: React.ComponentPropsWithoutRef<'button'>['type']
}

export interface ButtonPropsWithOnClickHandler extends ButtonProps {
  /**
   * Some third-party library might use a button and attach it an `onClick` event handler.
   * @see https://react-spectrum.adobe.com/react-aria/usePress.html#features
   */
  onClick: (event: PressEvent) => void
}

type UseButtonProps = AriaButtonProps

type PressEvent = Parameters<NonNullable<UseButtonProps['onPress']>>[0]
