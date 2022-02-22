import dynamic from 'next/dynamic'
import { signOut } from 'next-auth/react'
import { RiLogoutCircleRLine } from 'react-icons/ri'

import ContentTree from 'components/content/ContentTree'
import Flex from 'components/ui/Flex'
import IconButton from 'components/form/IconButton'
import ContentTypeSwitch from 'components/content/ContentTypeSwitch'
import NavigationPalette from 'components/palette/NavigationPalette'

const ContentModal = dynamic(import('components/content/ContentModal'))
const FolderModal = dynamic(import('components/folder/FolderModal'))
const ShortcutModal = dynamic(import('components/shortcut/ShortcutModal'))

const Sidebar: React.FC = () => {
  function logout() {
    signOut({ callbackUrl: `/auth/login` })
  }

  return (
    <>
      <NavigationPalette />
      <Flex direction="col" className="w-64 bg-zinc-900">
        <ContentTree />
        <Flex
          justifyContent="center"
          className="z-10 border-t border-zinc-600/40 px-4 py-2 shadow-[0_-1px_1px_0_rgba(0,0,0,1)]"
        >
          <ContentTypeSwitch />
          <ContentModal />
          <FolderModal />
          <ShortcutModal />
          <IconButton icon={RiLogoutCircleRLine} onPress={logout} tooltip="Logout" />
        </Flex>
      </Flex>
    </>
  )
}

export default Sidebar
