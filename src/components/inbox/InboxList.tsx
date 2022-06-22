import InboxListEntry from 'components/inbox/InboxListEntry'
import Drawer from 'components/ui/Drawer'
import { isEmpty } from 'libs/array'
import { isNetworkError } from 'libs/trpc'
import { trpc } from 'libs/trpc'

const InboxList: React.FC = () => {
  const { data, isLoading } = trpc.useQuery(['inbox.list'], { useErrorBoundary: isNetworkError })

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

export default InboxList
