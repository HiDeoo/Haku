import { forwardRef } from 'react'

import Button, { type ButtonPropsWithOnClickHandler, type ButtonProps } from 'components/form/Button'
import Icon, { type IconProps } from 'components/ui/Icon'
import Tooltip from 'components/ui/Tooltip'
import clst from 'styles/clst'

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, iconClassName, pressedClassName, tooltip, ...props }, forwardedRef) => {
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
        className={buttonClasses}
        pressedClassName={pressedButtonClasses}
        aria-label={tooltip ?? props['aria-label']}
      >
        <Icon icon={icon} className={iconClassName} />
      </Button>
    )

    return tooltip ? <Tooltip content={tooltip}>{content}</Tooltip> : content
  }
)

IconButton.displayName = 'IconButton'

export default IconButton

export interface IconButtonProps
  extends Omit<ButtonProps, 'children' | 'primary'>,
    Partial<ButtonPropsWithOnClickHandler> {
  className?: string
  disabled?: ButtonProps['disabled']
  icon: IconProps['icon']
  iconClassName?: IconProps['className']
  onPress?: ButtonProps['onPress']
  pressedClassName?: string
  tabIndex?: ButtonProps['tabIndex']
  tooltip?: string
}
