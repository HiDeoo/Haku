import { QueryObserver, useQueryClient } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai/react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { RiInboxFill } from 'react-icons/ri'

import { inboxDrawerAtom, setInboxDrawerOpenedAtom } from 'atoms/togglable'
import { IconButton } from 'components/form/IconButton'
import { type InboxProps } from 'components/inbox/Inbox'
import { Drawer } from 'components/ui/Drawer'
import { useGlobalShortcuts } from 'hooks/useGlobalShortcuts'
import { isNotEmpty } from 'libs/array'
import { type InboxEntriesData } from 'libs/db/inbox'
import { clst } from 'styles/clst'

const Inbox = dynamic<InboxProps>(import('components/inbox/Inbox').then((module) => module.Inbox))

export const InboxDrawer = () => {
  const queryClient = useQueryClient()

  const [showInboxIndicator, setShowInboxIndicator] = useState(false)

  useEffect(() => {
    const observer = new QueryObserver<unknown, unknown, InboxEntriesData>(queryClient, {
      enabled: false,
      queryKey: [['inbox', 'list'], { type: 'query' }],
    })

    const unsubscribe = observer.subscribe((result) => {
      setShowInboxIndicator(isNotEmpty(result.data))
    })

    return () => {
      unsubscribe()
    }
  }, [queryClient])

  const { opened } = useAtomValue(inboxDrawerAtom)
  const setOpened = useSetAtom(setInboxDrawerOpenedAtom)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Miscellaneous',
          keybinding: 'Control+i',
          label: 'Open Inbox',
          onKeyDown: () => {
            setOpened(true)
          },
        },
      ],
      [setOpened]
    )
  )

  const triggerClasses = clst(
    showInboxIndicator && [
      'relative',
      'before:absolute before:top-[2px] before:right-[1px] before:w-3 before:h-3 before:rounded-full',
      'before:bg-zinc-900 before:hover:bg-zinc-700/75',
      'after:absolute after:top-[4px] after:right-[3px] after:w-2 after:h-2 after:rounded-full',
      'after:bg-blue-50 after:hover:bg-blue-600',
    ]
  )

  return (
    <Drawer
      title="Inbox"
      opened={opened}
      onOpenChange={setOpened}
      className="flex flex-col overflow-hidden"
      trigger={<IconButton icon={RiInboxFill} tooltip="Inbox" className={triggerClasses} />}
    >
      <Inbox />
    </Drawer>
  )
}
