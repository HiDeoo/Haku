import clsx from 'clsx'

import Flex from 'components/Flex'
import Sidebar from 'components/Sidebar'

const Layout: React.FC<Props> = ({ children, sidebar }) => {
  const centered = sidebar ? undefined : 'center'

  const mainClasses = clsx('overflow-y-auto', { 'border-l border-zinc-600/30': sidebar })

  return (
    <Flex fullHeight fullWidth>
      {sidebar ? <Sidebar /> : null}
      <Flex as="main" justifyContent={centered} alignItems={centered} direction="col" flex className={mainClasses}>
        {children}
      </Flex>
    </Flex>
  )
}

export default Layout

interface Props {
  sidebar: boolean
}
