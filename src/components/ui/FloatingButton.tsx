import { ButtonProps } from 'components/form/Button'
import IconButton from 'components/form/IconButton'
import { type IconProps } from 'components/ui/Icon'
import clst from 'styles/clst'

const FloatingButton: React.FC<FloatingButtonProps> = ({ className, icon, onPress, tooltip, visible }) => {
  const buttonClasses = clst(
    'fixed z-30 bg-zinc-900 p-2 shadow shadow-zinc-900 hover:bg-zinc-600 hover:text-zinc-100 md:hidden',
    'supports-max:bottom-[calc(theme(spacing.2)+max(0px,env(safe-area-inset-bottom)))]',
    className
  )

  if (!visible) {
    return null
  }

  return (
    <IconButton
      icon={icon}
      onPress={onPress}
      tooltip={tooltip}
      iconClassName="w-5 h-5"
      className={buttonClasses}
      pressedClassName="bg-zinc-500 hover:bg-zinc-500"
    />
  )
}

export default FloatingButton

interface FloatingButtonProps {
  className: string
  icon: IconProps['icon']
  onPress: ButtonProps['onPress']
  tooltip: string
  visible?: boolean
}
