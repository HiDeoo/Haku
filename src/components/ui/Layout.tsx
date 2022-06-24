import { useAtomValue } from 'jotai'
import dynamic from 'next/dynamic'

import { sidebarCollapsedAtom } from 'atoms/collapsible'
import Flex from 'components/ui/Flex'
import clst from 'styles/clst'

const Sidebar = dynamic(import('components/ui/Sidebar'))

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
    sidebar && !sidebarCollapsed && 'border-l border-l-zinc-600/30'
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
