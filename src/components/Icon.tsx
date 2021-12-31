import { Root } from '@radix-ui/react-accessible-icon'
import clsx from 'clsx'

const Icon: React.FC<IconProps> = ({ className, icon, label }) => {
  const Component = icon

  const iconClasses = clsx('h-4 w-4', className)

  const content = <Component className={iconClasses} />

  return label ? <Root label={label}>{content}</Root> : content
}

export default Icon

export interface IconProps {
  className?: string
  icon: React.ElementType<Pick<IconProps, 'className'>>
  label?: string
}
