import { ExitIcon } from '@radix-ui/react-icons'
import { signOut } from 'next-auth/react'

import Flex from 'components/Flex'
import IconButton from 'components/IconButton'
import styles from 'styles/Sidebar.module.css'

const Sidebar: React.FC = () => {
  function logout() {
    signOut({ callbackUrl: `/auth/login` })
  }

  return (
    <Flex direction="col" className={styles.container}>
      <Flex as="nav" flex className={styles.navigation}>
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
      <Flex justifyContent="center" className={styles.controls}>
        <IconButton onPress={logout} tooltip="Log Out">
          <ExitIcon />
        </IconButton>
      </Flex>
    </Flex>
  )
}

export default Sidebar
