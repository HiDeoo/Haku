import Flex from 'components/ui/Flex'
import Sidebar from 'components/ui/Sidebar'
import clst from 'styles/clst'

const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  const centered = sidebar ? undefined : 'center'

  const mainClasses = clst('overflow-hidden pwa:border-t pwa:border-t-zinc-700', {
    'border-l border-l-zinc-600/30': sidebar,
  })

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
