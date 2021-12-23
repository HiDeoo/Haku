import { ExitIcon } from '@radix-ui/react-icons'
import { signOut } from 'next-auth/react'

import Flex from 'components/Flex'
import IconButton from 'components/IconButton'

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
      <div className="px-4 pb-2">
        <Flex justifyContent="center" className="pt-2 border-t border-zinc-600/40">
          <IconButton onPress={logout} tooltip="Log Out">
            <ExitIcon />
          </IconButton>
        </Flex>
      </div>
    </Flex>
  )
}

export default Sidebar
