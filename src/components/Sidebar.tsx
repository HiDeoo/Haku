import { ExitIcon } from '@radix-ui/react-icons'
import { signOut } from 'next-auth/react'

import IconButton from 'components/IconButton'

const Sidebar: React.FC = () => {
  function logout() {
    signOut({ callbackUrl: `/auth/login` })
  }

  return (
    <nav className="flex-none w-64 bg-zinc-900 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
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
      </div>
      <div className="flex-none px-4 pb-2">
        <div className="pt-2 border-t border-zinc-600/40 flex justify-center">
          <IconButton onPress={logout} tooltip="Log Out">
            <ExitIcon />
          </IconButton>
        </div>
      </div>
    </nav>
  )
}

export default Sidebar
