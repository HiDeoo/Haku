import { Content, Item, Portal, Root, Trigger } from '@radix-ui/react-dropdown-menu'
import { Children, cloneElement, forwardRef, isValidElement } from 'react'

import Button, { type ButtonProps } from 'components/form/Button'
import IconButton, { type IconButtonProps } from 'components/form/IconButton'
import Flex from 'components/ui/Flex'
import { type IconProps } from 'components/ui/Icon'
import clst from 'styles/clst'

const controlClasses = clst(
  'border-t border-zinc-600/40 px-2 py-2 shadow-[0_-1px_1px_0_theme(colors.black)]',
  'supports-max:pr-[calc(theme(spacing.2)+max(0px,env(safe-area-inset-right)))]',
  'supports-max:pb-[calc(theme(spacing.2)+max(0px,env(safe-area-inset-bottom)))]'
)

const Inspector: InspectorComponent = ({ children, collapsed, controls, disabled }) => {
  const inspectorClasses = clst(
    'shrink-0 border-l border-zinc-600/50 bg-zinc-900',
    'motion-safe:transition-[width,opacity] motion-safe:duration-150 motion-safe:ease-in-out',
    collapsed
      ? [
          'w-0 md:w-12 md:supports-max:w-[calc(theme(spacing.12)+max(0px,env(safe-area-inset-right)))]',
          ' opacity-0 md:opacity-100',
        ]
      : 'w-[15.2rem] supports-max:w-[calc(15.2rem+max(0px,env(safe-area-inset-left)))]'
  )

  return (
    <Flex direction="col" className={inspectorClasses}>
      <Flex
        role="toolbar"
        direction="col"
        aria-orientation="vertical"
        className="overflow-y-auto scrollbar-hide supports-max:pr-[max(0px,env(safe-area-inset-right))]"
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child)) {
            return null
          }

          return cloneElement(child, { ...child.props, collapsed, disabled })
        })}
      </Flex>
      {controls ? (
        <>
          <div className="grow" />
          <div className={controlClasses}>{controls}</div>
        </>
      ) : null}
    </Flex>
  )
}

export default Inspector

const InspectorSection: React.FC<InspectorSectionProps> = ({
  children,
  collapsed,
  className,
  disabled,
  role,
  sectionClassName,
  title,
  titleClassName,
}) => {
  const sectionClasses = clst(
    'shrink-0 pt-2 pb-3 border-t border-zinc-600/25 first-of-type:border-0 overflow-hidden select-none',
    { 'pt-3': typeof title === 'undefined' && !collapsed },
    collapsed ? 'px-2.5 py-2.5' : 'px-3',
    sectionClassName
  )
  const titleClasses = clst('mb-2 text-blue-100/75 text-xs font-medium', titleClassName)
  const contentClasses = clst('gap-2.5', className)

  return (
    <Flex direction="col" className={sectionClasses} role={role}>
      {!collapsed && title ? <div className={titleClasses}>{title}</div> : null}
      <Flex wrap alignItems="baseline" className={contentClasses}>
        {Children.map(children, (child) => {
          if (!isValidElement(child)) {
            return null
          }

          return cloneElement(child, { ...child.props, collapsed, disabled: child.props.disabled || disabled })
        })}
      </Flex>
    </Flex>
  )
}

Inspector.Section = InspectorSection

const InspectorButton: React.FC<ButtonProps & Collapsible> = ({ collapsed, ...props }) => {
  const buttonClasses = clst('mx-0 py-1 bg-zinc-700 hover:bg-zinc-600 shadow-none', {
    'bg-blue-600 hover:bg-blue-500': props.primary,
  })
  const pressedButtonClasses = clst('bg-zinc-500 hover:bg-zinc-500', {
    'bg-blue-400 hover:bg-blue-400': props.primary,
  })

  return <Button {...props} className={buttonClasses} pressedClassName={pressedButtonClasses} />
}

Inspector.Button = InspectorButton

const InspectorToggle: React.FC<InspectorToggleProps> = ({ collapsed, onToggle, toggled, ...props }) => {
  const buttonClasses = clst({
    'bg-blue-500 hover:bg-blue-400 border-blue-400': toggled,
  })
  const pressedButtonClasses = clst(toggled ? 'bg-blue-300 hover:bg-blue-300' : 'bg-zinc-400 hover:bg-zinc-500')

  function handlePress() {
    onToggle(!toggled)
  }

  return (
    <InspectorIconButton
      {...props}
      onPress={handlePress}
      className={buttonClasses}
      pressedClassName={pressedButtonClasses}
    />
  )
}

Inspector.Toggle = InspectorToggle

const InspectorIconButton = forwardRef<HTMLButtonElement, InspectorIconButtonProps>(
  ({ className, collapsed, pressedClassName, tooltip, ...props }, forwardedRef) => {
    const buttonClasses = clst(
      'mx-0 bg-zinc-700 hover:bg-zinc-600 hover:text-zinc-100 shadow-none disabled:bg-zinc-700',
      className
    )
    const pressedButtonClasses = clst('bg-zinc-500 hover:bg-zinc-500', pressedClassName)

    return (
      <IconButton
        {...props}
        tooltip={tooltip}
        ref={forwardedRef}
        className={buttonClasses}
        pressedClassName={pressedButtonClasses}
      />
    )
  }
)

InspectorIconButton.displayName = 'InspectorIconButton'
Inspector.IconButton = InspectorIconButton

const InspectorIconMenu: React.FC<InspectorIconButtonMenuProps> = ({
  children,
  collapsed,
  disabled,
  icon,
  toggled,
  tooltip,
}) => {
  const buttonClasses = clst({
    'bg-blue-500 hover:bg-blue-400 border-blue-400': toggled,
  })
  const pressedButtonClasses = clst({
    'bg-blue-300 hover:bg-blue-300': toggled,
  })

  return (
    <Root>
      <Trigger asChild>
        <InspectorIconButton
          icon={icon}
          tooltip={tooltip}
          disabled={disabled}
          className={buttonClasses}
          pressedClassName={pressedButtonClasses}
        />
      </Trigger>
      <Portal>
        <Content
          loop
          sideOffset={collapsed ? 7 : 0}
          side={collapsed ? 'left' : 'bottom'}
          onCloseAutoFocus={handleIconMenuCloseAutoFocus}
        >
          <Flex direction="col" className="mt-[theme(spacing[0.5])] rounded-md bg-zinc-700 shadow-sm shadow-black/50">
            {children}
          </Flex>
        </Content>
      </Portal>
    </Root>
  )
}

Inspector.IconMenu = InspectorIconMenu

function handleIconMenuCloseAutoFocus(event: Event) {
  event.preventDefault()
}

const InspectorIconMenuItem: React.FC<InspectorIconMenuItemProps> = ({ icon, onClick }) => {
  return (
    <Item asChild>
      <InspectorIconButton
        icon={icon}
        onClick={onClick}
        className="[&[data-highlighted]]:ring-inset [&[data-highlighted]]:ring-offset-0"
      />
    </Item>
  )
}

Inspector.IconMenuItem = InspectorIconMenuItem

type InspectorComponent = React.FC<InspectorProps> & {
  Button: typeof InspectorButton
  IconButton: typeof InspectorIconButton
  IconMenu: typeof InspectorIconMenu
  IconMenuItem: typeof InspectorIconMenuItem
  Section: typeof InspectorSection
  Toggle: typeof InspectorToggle
}

interface InspectorProps extends Collapsible {
  children: React.ReactNode
  controls?: React.ReactNode
  disabled?: boolean
}

interface InspectorSectionProps extends Collapsible {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  role?: React.HtmlHTMLAttributes<HTMLElement>['role']
  sectionClassName?: string
  title?: string
  titleClassName?: string
}

interface InspectorIconButtonProps extends Collapsible {
  className?: string
  disabled?: IconButtonProps['disabled']
  icon: IconProps['icon']
  onClick?: IconButtonProps['onClick']
  onPress?: IconButtonProps['onPress']
  pressedClassName?: string
  tooltip?: string
}

interface InspectorToggleProps extends Collapsible, Omit<InspectorIconButtonProps, 'onPress'> {
  toggled?: boolean
  onToggle: (toggled: boolean) => void
}

interface InspectorIconButtonMenuProps extends Collapsible {
  children: React.ReactNode
  collapsed?: boolean
  disabled?: boolean
  icon: IconProps['icon']
  toggled?: boolean
  tooltip: string
}

interface InspectorIconMenuItemProps extends Omit<InspectorIconButtonMenuProps, 'children' | 'tooltip'> {
  onClick: IconButtonProps['onClick']
}

interface Collapsible {
  collapsed?: boolean
}
