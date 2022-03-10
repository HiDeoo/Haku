import { useAtomValue } from 'jotai/utils'
import dynamic from 'next/dynamic'

import { sidebarCollapsedAtom } from 'atoms/sidebar'
import ContentTree from 'components/content/ContentTree'
import CommandPalette from 'components/palette/CommandPalette'
import NavigationPalette from 'components/palette/NavigationPalette'
import Flex from 'components/ui/Flex'
import clst from 'styles/clst'

const SidebarMenu = dynamic(import('components/ui/SidebarMenu'))

const Sidebar: React.FC = () => {
  const collapsed = useAtomValue(sidebarCollapsedAtom)

  const sidebarClasses = clst(
    'bg-zinc-900 pwa:input-hover:border-t pwa:input-hover:border-zinc-700',
    collapsed ? 'w-12' : 'w-[17rem]'
  )

  return (
    <>
      <NavigationPalette />
      <CommandPalette />
      <Flex direction="col" className={sidebarClasses}>
        <ContentTree />
        <SidebarMenu />
      </Flex>
    </>
  )
}

export default Sidebar
