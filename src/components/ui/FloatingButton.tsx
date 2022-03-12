import { ButtonProps } from 'components/form/Button'
import IconButton from 'components/form/IconButton'
import { type IconProps } from 'components/ui/Icon'
import clst from 'styles/clst'

const FloatingButton: React.FC<FloatingButtonProps> = ({ className, icon, onPress, tooltip, visible }) => {
  const buttonClasses = clst(
    'fixed bottom-2 z-30 bg-zinc-900 p-2 shadow shadow-zinc-900 hover:bg-zinc-600 hover:text-blue-50 md:hidden',
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
