import { useAtomValue, useSetAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { RiInboxFill } from 'react-icons/ri'

import { inboxDrawerAtom, setInboxDrawerOpenedAtom } from 'atoms/togglable'
import IconButton from 'components/form/IconButton'
import Drawer from 'components/ui/Drawer'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'

const InboxForm = dynamic(import('components/inbox/InboxForm'))
const InboxList = dynamic(import('components/inbox/InboxList'))

const InboxDrawer: React.FC = () => {
  const opened = useAtomValue(inboxDrawerAtom)
  const setOpened = useSetAtom(setInboxDrawerOpenedAtom)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Miscellaneous',
          keybinding: 'Meta+i',
          label: 'Open Inbox',
          onKeyDown: () => {
            setOpened(true)
          },
        },
      ],
      [setOpened]
    )
  )

  return (
    <Drawer
      title="Inbox"
      opened={opened}
      onOpenChange={setOpened}
      className="flex flex-col overflow-hidden"
      trigger={<IconButton icon={RiInboxFill} tooltip="Inbox" />}
    >
      <InboxForm />
      <InboxList />
    </Drawer>
  )
}

export default InboxDrawer
