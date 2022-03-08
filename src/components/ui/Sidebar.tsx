import dynamic from 'next/dynamic'

import ContentTree from 'components/content/ContentTree'
import CommandPalette from 'components/palette/CommandPalette'
import NavigationPalette from 'components/palette/NavigationPalette'
import Flex from 'components/ui/Flex'

const SidebarMenu = dynamic(import('components/ui/SidebarMenu'))

const Sidebar: React.FC = () => {
  return (
    <>
      <NavigationPalette />
      <CommandPalette />
      <Flex direction="col" className="w-64 bg-zinc-900 pwa:border-t pwa:border-zinc-700">
        <ContentTree />
        <SidebarMenu />
      </Flex>
    </>
  )
}

export default Sidebar
