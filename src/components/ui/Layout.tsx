import { useAtomValue } from 'jotai/utils'

import { sidebarCollapsedAtom } from 'atoms/collapsible'
import Flex from 'components/ui/Flex'
import Sidebar from 'components/ui/Sidebar'
import clst from 'styles/clst'

const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)

  const centered = sidebar ? undefined : 'center'

  const mainClasses = clst('overflow-hidden pwa:input-hover:border-t pwa:input-hover:border-t-zinc-700', {
    'md:border-l md:border-l-zinc-600/30': sidebar,
    'border-l border-l-zinc-600/30': sidebar && !sidebarCollapsed,
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
