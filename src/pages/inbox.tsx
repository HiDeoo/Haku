import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import { Callout } from 'components/form/Callout'
import { Spinner } from 'components/ui/Spinner'
import { useInboxEntryMutation } from 'hooks/useInboxEntryMutation'

const Inbox: Page = () => {
  const { pathname, query, replace } = useRouter()

  const entryText = typeof query['text'] === 'string' && query['text'].length > 0 ? query['text'] : null

  const didSubmit = useRef(false)
  const [submitState, setSubmitState] = useState<'pending' | 'success' | 'error'>('pending')

  const { mutateAddAsync } = useInboxEntryMutation()

  useEffect(() => {
    // https://github.com/reactwg/react-18/discussions/18#discussion-3385714
    async function addInboxEntry() {
      if (!entryText) {
        return
      }

      try {
        await mutateAddAsync({ text: entryText })

        setSubmitState('success')

        replace(pathname, undefined, { shallow: true })
      } catch {
        setSubmitState('error')
      }
    }

    if (!didSubmit.current) {
      didSubmit.current = true

      addInboxEntry()
    }
  }, [entryText, mutateAddAsync, pathname, replace])

  const isLoading = entryText && submitState === 'pending'
  const isSuccess = submitState === 'success'
  const isError = submitState === 'error'

  if (isLoading) {
    return <Spinner delay className="h-10 w-10" />
  }

  const intent = isSuccess ? 'success' : 'error'
  const title = isSuccess ? 'Inbox entry created' : 'Oops, something went wrong!'
  const message = isSuccess ? 'You can now close this window.' : isError ? 'Please try again.' : 'Invalid URL syntax.'

  return <Callout intent={intent} title={title} message={message} className="mx-4" />
}

Inbox.sidebar = false

export default Inbox
