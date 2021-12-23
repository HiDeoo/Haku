import Flex from 'components/Flex'
import Sidebar from 'components/Sidebar'

const Layout: React.FC<Props> = ({ children, sidebar }) => {
  return (
    <Flex fullHeight fullWidth className="overflow-hidden bg-zinc-800 text-blue-50 text-sm">
      {sidebar ? <Sidebar /> : null}
      <Flex flex className="overflow-y-auto">
        {children}
      </Flex>
    </Flex>
  )
}

export default Layout

interface Props {
  sidebar: boolean
}
