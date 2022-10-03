import { Children, cloneElement, isValidElement } from 'react'

import { Button, type ButtonProps } from 'components/form/Button'
import { Flex } from 'components/ui/Flex'
import { Icon, type IconProps } from 'components/ui/Icon'
import { Tooltip } from 'components/ui/Tooltip'
import { clst } from 'styles/clst'

const navbarClasses = clst(
  'py-2 px-2.5 supports-max:pr-[calc(theme(spacing[2.5])+max(0px,env(safe-area-inset-right)))]',
  'gap-3 border-b border-zinc-600/50 bg-zinc-900 text-sm'
)

const buttonPingClasses = clst(
  'before:absolute before:-top-[0.16rem] before:-right-[0.16rem] before:w-2 before:h-2 before:rounded-full',
  'before:bg-blue-200 before:motion-safe:animate-ping',
  'after:absolute after:-top-[0.16rem] after:-right-[0.16rem] after:w-2 after:h-2 after:rounded-full',
  'after:bg-blue-300'
)

export const Navbar = ({ children, disabled, title }: NavbarProps) => {
  return (
    <Flex alignItems="center" className={navbarClasses}>
      {title && title.length > 0 && <div className="grow truncate font-semibold text-zinc-50">{title}</div>}
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return null
        }

        return cloneElement(child, { ...child.props, disabled: child.props.disabled || disabled })
      })}
    </Flex>
  )
}

const NavbarButton = ({ pinged, ...props }: NavbarButtonProps) => {
  const buttonClasses = clst(
    'min-w-[65px] mx-0 py-1 bg-zinc-700 hover:bg-zinc-600 shadow-none',
    props.primary && 'bg-blue-600 hover:bg-blue-500',
    pinged && ['relative', buttonPingClasses]
  )
  const pressedButtonClasses = clst('bg-zinc-500 hover:bg-zinc-500', props.primary && 'bg-blue-400 hover:bg-blue-400')

  return <Button {...props} className={buttonClasses} pressedClassName={pressedButtonClasses} />
}

Navbar.Button = NavbarButton

const NavbarIcon = ({ icon, iconLabel, tooltip }: NavbarIconProps) => {
  return (
    <Tooltip content={tooltip}>
      <Flex fullHeight alignItems="center" className="shrink-0">
        <Icon icon={icon} className="h-4 w-4 text-zinc-500" label={iconLabel} />
      </Flex>
    </Tooltip>
  )
}

Navbar.Icon = NavbarIcon

const NavbarSpacer = () => {
  return <div className="grow" />
}

Navbar.Spacer = NavbarSpacer

interface NavbarProps {
  children: React.ReactNode
  disabled?: boolean
  title?: string
}

interface NavbarButtonProps extends ButtonProps {
  pinged?: boolean
}

interface NavbarIconProps {
  icon: IconProps['icon']
  iconLabel: string
  tooltip: string
}
