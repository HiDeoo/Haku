import Button, { type ButtonProps } from 'components/Button'

const IconButton: React.FC<Props> = ({ children, ...props }) => {
  return (
    <Button
      {...props}
      className="bg-inherit hover:bg-blue-50/10 hover:text-blue-600 disabled:bg-inherit disabled:text-inherit px-2 mx-0.5"
      pressedClassName="bg-blue-50/20 hover:bg-blue-50/20"
    >
      {children}
    </Button>
  )
}

export default IconButton

type Props = Omit<ButtonProps, 'primary'>
