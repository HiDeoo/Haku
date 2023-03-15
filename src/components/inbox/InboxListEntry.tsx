import { LinkItUrl } from 'react-linkify-it'
import IconDeleteBin7Line from '~icons/ri/delete-bin-7-line'

import { ClipboardCopyButton } from 'components/form/ClipboardCopyButton'
import { Drawer } from 'components/ui/Drawer'
import { LIST_BUTTON_CLASSES, LIST_BUTTON_PRESSED_CLASSES } from 'components/ui/List'
import { useInboxEntryMutation } from 'hooks/useInboxEntryMutation'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { type RouterOutput } from 'libs/trpc'
import { clst } from 'styles/clst'

export const InboxListEntry = ({ entry }: InboxListEntryProps) => {
  const { offline } = useNetworkStatus()

  const { mutateDelete } = useInboxEntryMutation()

  function handleRemovePress() {
    mutateDelete({ id: entry.id })
  }

  const textClasses = clst(
    'min-w-0 break-words',
    '[&>a]:text-blue-200 [&>a]:underline hover:[&>a]:no-underline [&>a]:rounded',
    'focus-visible:[&>a]:outline-none focus-visible:[&>a]:no-underline focus-visible:[&>a]:ring-2',
    'focus-visible:[&>a]:ring-blue-600 focus-visible:[&>a]:ring-offset-zinc-800 focus-visible:[&>a]:ring-offset-2'
  )

  return (
    <Drawer.List.Item>
      <LinkItUrl>
        <div className={textClasses}>{entry.text}</div>
      </LinkItUrl>
      <div className="flex self-start">
        <ClipboardCopyButton
          content={entry.text}
          className={LIST_BUTTON_CLASSES}
          pressedClassName={LIST_BUTTON_PRESSED_CLASSES}
        />
        <Drawer.List.Button icon={IconDeleteBin7Line} tooltip="Delete" onPress={handleRemovePress} disabled={offline} />
      </div>
    </Drawer.List.Item>
  )
}

interface InboxListEntryProps {
  entry: RouterOutput['inbox']['list'][number]
}
