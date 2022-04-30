import useInboxEntriesQuery from 'hooks/useInboxEntriesQuery'

const InboxList: React.FC = () => {
  const { data, isLoading } = useInboxEntriesQuery()

  if (isLoading) {
    // TODO(HiDeoo)
    return <div>Loading...</div>
  }

  // TODO(HiDeoo) NIS

  return (
    <div>
      {data?.map((entry) => {
        return <div key={entry.id}>{entry.text}</div>
      })}
    </div>
  )
}

export default InboxList
