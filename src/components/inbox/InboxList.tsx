import { InboxListEntry } from 'components/inbox/InboxListEntry'
import { Drawer } from 'components/ui/Drawer'
import { isEmpty } from 'libs/array'
import { isNetworkError, trpc } from 'libs/trpc'

export const InboxList = () => {
  const { data, isLoading } = trpc.inbox.list.useQuery(undefined, { useErrorBoundary: isNetworkError })

  if (!isLoading && isEmpty(data)) {
    return <Drawer.Nis text="Start by creating a new inbox entry." />
  }

  return (
    <Drawer.List isLoading={isLoading}>
      {data?.map((entry) => (
        <InboxListEntry key={entry.id} entry={entry} />
      ))}
    </Drawer.List>
  )
}
