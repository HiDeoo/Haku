import dynamic from 'next/dynamic'
import { RiLogoutCircleRLine } from 'react-icons/ri'

import ContentTree from 'components/content/ContentTree'
import ContentTypeSwitch from 'components/content/ContentTypeSwitch'
import IconButton from 'components/form/IconButton'
import CommandPalette from 'components/palette/CommandPalette'
import NavigationPalette from 'components/palette/NavigationPalette'
import SearchPalette from 'components/palette/SearchPalette'
import Flex from 'components/ui/Flex'
import { logout } from 'libs/auth'

const ContentModal = dynamic(import('components/content/ContentModal'))
const FolderModal = dynamic(import('components/folder/FolderModal'))
const ShortcutModal = dynamic(import('components/shortcut/ShortcutModal'))

const Sidebar: React.FC = () => {
  return (
    <>
      <NavigationPalette />
      <CommandPalette />
      <Flex direction="col" className="w-64 bg-zinc-900">
        <ContentTree />
        <Flex
          justifyContent="center"
          className="z-10 border-t border-zinc-600/40 px-4 py-2 shadow-[0_-1px_1px_0_rgba(0,0,0,1)]"
        >
          <ContentTypeSwitch />
          <ContentModal />
          <FolderModal />
          <SearchPalette />
          <ShortcutModal />
          <IconButton icon={RiLogoutCircleRLine} onPress={logout} tooltip="Logout" />
        </Flex>
      </Flex>
    </>
  )
}

export default Sidebar
