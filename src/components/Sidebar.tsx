import { ExitIcon } from '@radix-ui/react-icons'
import { signOut } from 'next-auth/react'

import Flex from 'components/Flex'
import IconButton from 'components/IconButton'
import NewFolderModal from 'components/NewFolderModal'

const Sidebar: React.FC = () => {
  function logout() {
    signOut({ callbackUrl: `/auth/login` })
  }

  return (
    <Flex direction="col" className="w-64 bg-zinc-900">
      <Flex as="nav" flex className="overflow-y-auto">
        START
        <br />
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit nostrum ea sapiente pariatur, debitis corrupti
        aspernatur excepturi illo error? Porro asperiores quibusdam similique dolorum! Dolores in voluptate nam quo
        placeat?
        <br />
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit nostrum ea sapiente pariatur, debitis corrupti
        aspernatur excepturi illo error? Porro asperiores quibusdam similique dolorum! Dolores in voluptate nam quo
        placeat?
        <br />
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit nostrum ea sapiente pariatur, debitis corrupti
        aspernatur excepturi illo error? Porro asperiores quibusdam similique dolorum! Dolores in voluptate nam quo
        placeat?
        <br />
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit nostrum ea sapiente pariatur, debitis corrupti
        aspernatur excepturi illo error? Porro asperiores quibusdam similique dolorum! Dolores in voluptate nam quo
        placeat?
        <br />
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit nostrum ea sapiente pariatur, debitis corrupti
        aspernatur excepturi illo error? Porro asperiores quibusdam similique dolorum! Dolores in voluptate nam quo
        placeat?
        <br />
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit nostrum ea sapiente pariatur, debitis corrupti
        aspernatur excepturi illo error? Porro asperiores quibusdam similique dolorum! Dolores in voluptate nam quo
        placeat?
        <br />
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit nostrum ea sapiente pariatur, debitis corrupti
        aspernatur excepturi illo error? Porro asperiores quibusdam similique dolorum! Dolores in voluptate nam quo
        placeat?
        <br />
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Impedit nostrum ea sapiente pariatur, debitis corrupti
        aspernatur excepturi illo error? Porro asperiores quibusdam similique dolorum! Dolores in voluptate nam quo
        placeat?
        <br />
        END
      </Flex>
      <Flex
        justifyContent="center"
        className="z-10 px-4 pb-2 border-t border-zinc-600/40 pt-1.5 shadow-[0_-1px_1px_0_rgba(0,0,0,1)]"
      >
        <NewFolderModal />
        <IconButton onPress={logout} tooltip="Logout">
          <ExitIcon />
        </IconButton>
      </Flex>
    </Flex>
  )
}

export default Sidebar
