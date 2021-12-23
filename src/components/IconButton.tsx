import Button, { type ButtonProps } from 'components/Button'
import Tooltip from 'components/Tooltip'

const IconButton: React.FC<Props> = ({ children, tooltip, ...props }) => {
  return (
    <Tooltip content={tooltip}>
      <Button
        {...props}
        className="bg-inherit hover:bg-zinc-700/75 hover:text-blue-600 disabled:bg-inherit disabled:text-inherit px-2 mx-0.5"
        pressedClassName="bg-blue-50/20 hover:bg-blue-50/20"
      >
        {children}
      </Button>
    </Tooltip>
  )
}

export default IconButton

interface Props extends Omit<ButtonProps, 'primary'> {
  tooltip: string
}
