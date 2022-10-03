import { Root } from '@radix-ui/react-accessible-icon'

import { clst } from 'styles/clst'

export const Icon = ({ 'aria-hidden': ariaHidden, className, icon, label }: IconProps) => {
  const Component = icon

  const iconClasses = clst('h-4 w-4 select-none', className)

  const content = <Component className={iconClasses} aria-hidden={ariaHidden} />

  return label ? <Root label={label}>{content}</Root> : content
}

export interface IconProps {
  'aria-hidden'?: React.ComponentPropsWithoutRef<'svg'>['aria-hidden']
  className?: string
  icon: React.ComponentType<Pick<IconProps, 'className' | 'aria-hidden'>>
  label?: string
}
