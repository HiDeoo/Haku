import Flex from 'components/Flex'
import Sidebar from 'components/Sidebar'
import clst from 'styles/clst'

const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  const centered = sidebar ? undefined : 'center'

  const mainClasses = clst('overflow-hidden', { 'border-l border-zinc-600/30': sidebar })

  return (
    <Flex fullHeight fullWidth>
      {sidebar ? <Sidebar /> : null}
      <Flex as="main" justifyContent={centered} alignItems={centered} direction="col" flex className={mainClasses}>
        {children}
      </Flex>
    </Flex>
  )
}

export default Layout

interface LayoutProps {
  sidebar: boolean
}
