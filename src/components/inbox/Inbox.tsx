import { InboxForm } from 'components/inbox/InboxForm'
import { InboxList } from 'components/inbox/InboxList'

export const Inbox = () => {
  return (
    <>
      <InboxForm />
      <InboxList />
    </>
  )
}

export type InboxProps = Record<string, never>
