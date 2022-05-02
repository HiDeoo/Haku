import { RiCloseLine } from 'react-icons/ri'

import List from 'components/ui/List'
import useInboxEntriesQuery from 'hooks/useInboxEntriesQuery'
import { useInboxEntryMutation } from 'hooks/useInboxEntryMutation'
import { InboxEntryData } from 'libs/db/inbox'

const InboxList: React.FC = () => {
  const { data, isLoading } = useInboxEntriesQuery()

  if (isLoading) {
    // TODO(HiDeoo)
    return <div>Loading...</div>
  }

  // TODO(HiDeoo) NIS

  return (
    <List
      shimmerItemCount={5}
      isLoading={isLoading}
      shimmerClassNames={[]}
      className="grow overflow-y-auto border-t border-b border-zinc-900 p-3"
    >
      {data?.map((entry) => (
        <InboxListEntry key={entry.id} entry={entry} />
      ))}
    </List>
  )
}

export default InboxList

const InboxListEntry: React.FC<InboxListEntryProps> = ({ entry }) => {
  const { mutate } = useInboxEntryMutation()

  function onClickRemove() {
    mutate({ action: 'delete', id: entry.id })
  }

  return (
    <List.Item className="py-2 pr-2">
      <div>{entry.text}</div>
      <div>
        <List.Button icon={RiCloseLine} tooltip="Delete" onPress={onClickRemove} />
      </div>
    </List.Item>
  )
}

interface InboxListEntryProps {
  entry: InboxEntryData
}