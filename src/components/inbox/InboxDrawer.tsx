import { useAtomValue, useSetAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { RiInboxFill } from 'react-icons/ri'

import { inboxDrawerAtom, setInboxDrawerOpenedAtom } from 'atoms/togglable'
import IconButton from 'components/form/IconButton'
import Drawer from 'components/ui/Drawer'

const InboxForm = dynamic(import('components/inbox/InboxForm'))
const InboxList = dynamic(import('components/inbox/InboxList'))

const InboxDrawer: React.FC = () => {
  const opened = useAtomValue(inboxDrawerAtom)
  const setOpened = useSetAtom(setInboxDrawerOpenedAtom)

  return (
    <Drawer
      title="Inbox"
      opened={opened}
      onOpenChange={setOpened}
      trigger={<IconButton icon={RiInboxFill} tooltip="Inbox" />}
    >
      <InboxForm />
      <InboxList />
    </Drawer>
  )
}

export default InboxDrawer
