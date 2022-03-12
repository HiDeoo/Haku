import { Children, cloneElement, isValidElement } from 'react'

import Button, { ButtonProps } from 'components/form/Button'
import Flex from 'components/ui/Flex'
import clst from 'styles/clst'

const Navbar: NavbarComponent = ({ children, disabled, title }) => {
  return (
    <Flex alignItems="center" className="gap-3 border-b border-zinc-600/50 bg-zinc-900 py-2 px-2.5 text-sm">
      {title && title.length > 0 && (
        <div className="grow truncate font-semibold text-zinc-50">{`${title} `.repeat(4)}</div>
      )}
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return null
        }

        return cloneElement(child, { ...child.props, disabled: child.props.disabled || disabled })
      })}
    </Flex>
  )
}

export default Navbar

const NavbarButton: React.FC<ButtonProps> = (props) => {
  const buttonClasses = clst('min-w-[65px] mx-0 py-1 bg-zinc-700 hover:bg-zinc-600 shadow-none', {
    'bg-blue-600 hover:bg-blue-500': props.primary,
  })
  const pressedButtonClasses = clst('bg-zinc-500 hover:bg-zinc-500', {
    'bg-blue-400 hover:bg-blue-400': props.primary,
  })

  return <Button {...props} className={buttonClasses} pressedClassName={pressedButtonClasses} />
}

Navbar.Button = NavbarButton

const NavbarSpacer: React.FC = () => {
  return <div className="grow" />
}

Navbar.Spacer = NavbarSpacer

type NavbarComponent = React.FC<NavbarProps> & {
  Button: typeof NavbarButton
  Spacer: typeof NavbarSpacer
}

interface NavbarProps {
  disabled?: boolean
  title?: string
}
