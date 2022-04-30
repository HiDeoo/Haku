import List from 'components/ui/List'
import useInboxEntriesQuery from 'hooks/useInboxEntriesQuery'

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
      {data?.map((entry) => {
        return <List.Item key={entry.id}>{entry.text}</List.Item>
      })}
    </List>
  )
}

export default InboxList
