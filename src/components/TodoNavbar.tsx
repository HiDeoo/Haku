import Navbar from 'components/Navbar'

const TodoNavbar: React.FC<TodoNavbarProps> = ({ disabled }) => {
  return (
    <Navbar disabled={disabled}>
      <Navbar.Spacer />
      <Navbar.Button primary>Save</Navbar.Button>
    </Navbar>
  )
}

export default TodoNavbar

interface TodoNavbarProps {
  disabled?: boolean
}
