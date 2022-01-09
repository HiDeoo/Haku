import { forwardRef } from 'react'

import Button, { type ButtonPropsWithOnClickHandler, type ButtonProps } from 'components/Button'
import Icon, { type IconProps } from 'components/Icon'
import Tooltip from 'components/Tooltip'
import clst from 'styles/clst'

const IconButton = forwardRef<HTMLButtonElement, React.PropsWithChildren<IconButtonProps>>(
  ({ className, icon, pressedClassName, tooltip, ...props }, forwardedRef) => {
    const buttonClasses = clst(
      'bg-inherit hover:bg-zinc-700/75 hover:text-blue-600 disabled:bg-inherit disabled:text-inherit shadow-none',
      'px-1.5 mx-0.5 min-w-0',
      className
    )
    const pressedButtonClasses = clst('bg-blue-50/20 hover:bg-blue-50/20', pressedClassName)

    const content = (
      <Button
        {...props}
        ref={forwardedRef}
        aria-label={tooltip}
        className={buttonClasses}
        pressedClassName={pressedButtonClasses}
      >
        <Icon icon={icon} />
      </Button>
    )

    return tooltip ? <Tooltip content={tooltip}>{content}</Tooltip> : content
  }
)

IconButton.displayName = 'IconButton'

export default IconButton

export interface IconButtonProps extends Omit<ButtonProps, 'primary'>, Partial<ButtonPropsWithOnClickHandler> {
  className?: string
  icon: IconProps['icon']
  onPress?: ButtonProps['onPress']
  pressedClassName?: string
  tabIndex?: ButtonProps['tabIndex']
  tooltip?: string
}
