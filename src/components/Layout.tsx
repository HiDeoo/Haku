import Flex from 'components/Flex'
import Sidebar from 'components/Sidebar'

const Layout: React.FC<Props> = ({ children, sidebar }) => {
  const centered = sidebar ? undefined : 'center'

  return (
    <Flex fullHeight fullWidth>
      {sidebar ? <Sidebar /> : null}
      <Flex justifyContent={centered} alignItems={centered} direction="col" flex className="overflow-y-auto">
        {children}
      </Flex>
    </Flex>
  )
}

export default Layout

interface Props {
  sidebar: boolean
}
