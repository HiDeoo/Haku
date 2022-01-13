import dynamic from 'next/dynamic'
import { signOut } from 'next-auth/react'
import { RiLogoutCircleRLine } from 'react-icons/ri'

import ContentTree from 'components/ContentTree'
import Flex from 'components/Flex'
import IconButton from 'components/IconButton'
import ContentTypeSwitch from 'components/ContentTypeSwitch'

const ContentModal = dynamic(import('components/ContentModal'))
const FolderModal = dynamic(import('components/FolderModal'))

const Sidebar: React.FC = () => {
  function logout() {
    signOut({ callbackUrl: `/auth/login` })
  }

  return (
    <Flex direction="col" className="w-64 bg-zinc-900">
      <ContentTree />
      <Flex
        justifyContent="center"
        className="z-10 px-4 py-2 border-t border-zinc-600/40 shadow-[0_-1px_1px_0_rgba(0,0,0,1)]"
      >
        <ContentTypeSwitch />
        <ContentModal />
        <FolderModal />
        <IconButton icon={RiLogoutCircleRLine} onPress={logout} tooltip="Logout" />
      </Flex>
    </Flex>
  )
}

export default Sidebar
