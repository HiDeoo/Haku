import { Button as Roving, Root } from '@radix-ui/react-toolbar'

import Button, { type ButtonProps } from 'components/Button'
import { type IconProps } from 'components/Icon'
import IconButton from 'components/IconButton'
import Tooltip from 'components/Tooltip'
import clst from 'styles/clst'

const Inspector: InspectorComponent = ({ children }) => {
  return <div className="shrink-0 w-64 overflow-hidden bg-zinc-900 border-l border-zinc-600/50">{children}</div>
}

export default Inspector

const InspectorSection: React.FC<InspectorSectionProps> = ({ children, title }) => {
  const sectionClasses = clst('pt-2 pb-3 px-3 border-b border-zinc-600/25 last-of-type:border-0', {
    'pt-3': typeof title === 'undefined',
  })

  const content = (
    <div className={sectionClasses}>
      {title ? <div className="mb-2 text-blue-100/75 text-xs font-medium">{title}</div> : null}
      {children}
    </div>
  )

  return title ? (
    <Root asChild orientation="horizontal">
      {content}
    </Root>
  ) : (
    content
  )
}

Inspector.Section = InspectorSection

const InspectorButton: React.FC<ButtonProps> = (props) => {
  const buttonClasses = clst('bg-zinc-700 hover:bg-zinc-600 shadow-none', {
    'bg-blue-600 hover:bg-blue-500': props.primary,
  })
  const pressedButtonClasses = clst('bg-zinc-500 hover:bg-zinc-500', {
    'bg-blue-400 hover:bg-blue-400': props.primary,
  })

  return <Button {...props} className={buttonClasses} pressedClassName={pressedButtonClasses} />
}

Inspector.Button = InspectorButton

const InspectorToggle: React.FC<InspectorToggleProps> = ({ onToggle, toggled, ...props }) => {
  const buttonClasses = clst({
    'bg-blue-500 hover:bg-blue-400 border-blue-400': toggled,
  })
  const pressedButtonClasses = clst({
    'bg-zinc-400 hover:bg-zinc-500': !toggled,
    'bg-blue-300 hover:bg-blue-300': toggled,
  })

  function onPress() {
    onToggle(!toggled)
  }

  return (
    <InspectorIconButton
      {...props}
      onPress={onPress}
      className={buttonClasses}
      pressedClassName={pressedButtonClasses}
    />
  )
}

Inspector.Toggle = InspectorToggle

const InspectorIconButton: React.FC<InspectorIconButtonProps> = ({
  className,
  pressedClassName,
  tooltip,
  ...props
}) => {
  const buttonClasses = clst('bg-zinc-700 hover:bg-zinc-600 hover:text-blue-50 shadow-none', className)
  const pressedButtonClasses = clst('bg-zinc-500 hover:bg-zinc-500', pressedClassName)

  return (
    <Tooltip content={tooltip}>
      <span className="inline-block mx-1 first-of-type:ml-0 last-of-type:mr-0" role="button">
        <Roving asChild>
          <IconButton
            {...props}
            aria-label={tooltip}
            className={buttonClasses}
            pressedClassName={pressedButtonClasses}
          />
        </Roving>
      </span>
    </Tooltip>
  )
}

type InspectorComponent = React.FC & {
  Button: typeof InspectorButton
  Section: typeof InspectorSection
  Toggle: typeof InspectorToggle
}

interface InspectorSectionProps {
  title?: string
}

interface InspectorIconButtonProps {
  className?: string
  icon: IconProps['icon']
  onPress: ButtonProps['onPress']
  pressedClassName?: string
  tooltip: string
}

interface InspectorToggleProps extends Omit<InspectorIconButtonProps, 'onPress'> {
  toggled?: boolean
  onToggle: (toggled: boolean) => void
}
