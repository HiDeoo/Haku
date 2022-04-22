import { useAtomValue } from 'jotai'

import { sidebarCollapsedAtom } from 'atoms/collapsible'
import Flex from 'components/ui/Flex'
import Sidebar from 'components/ui/Sidebar'
import clst from 'styles/clst'

const Layout: React.FC<LayoutProps> = ({ children, sidebar }) => {
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)

  const justifyCenter = sidebar ? undefined : 'center'

  const mainClasses = clst(
    'overflow-hidden pwa:input-hover:border-t pwa:input-hover:border-t-zinc-700',
    sidebar
      ? 'md:border-l md:border-l-zinc-600/30'
      : [
          'supports-max:pb-[max(0px,env(safe-area-inset-bottom))]',
          'supports-max:pl-[max(0px,env(safe-area-inset-left))]',
          ' supports-max:pr-[max(0px,env(safe-area-inset-right))]',
        ],
    {
      'border-l border-l-zinc-600/30': sidebar && !sidebarCollapsed,
    }
  )

  return (
    <Flex fullHeight fullWidth>
      {sidebar ? <Sidebar /> : null}
      <Flex
        flex
        id="main"
        as="main"
        direction="col"
        className={mainClasses}
        alignItems={justifyCenter}
        justifyContent={justifyCenter}
      >
        {children}
      </Flex>
    </Flex>
  )
}

export default Layout

interface LayoutProps {
  children: React.ReactNode
  sidebar: boolean
}
