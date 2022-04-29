import { useForm } from 'react-hook-form'
import { RiAddLine } from 'react-icons/ri'

import Form from 'components/form/Form'
import IconButton from 'components/form/IconButton'
import TextInput from 'components/form/TextInput'
import { useInboxEntryMutation } from 'hooks/useInboxEntryMutation'
import { useNetworkStatus } from 'hooks/useNetworkStatus'

const InboxForm: React.FC = () => {
  const { offline } = useNetworkStatus()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
  } = useForm<FormFields>()

  const { error, isLoading, mutate } = useInboxEntryMutation()

  const onSubmit = handleSubmit((data) => {
    mutate(data, { onSuccess: onSuccessfulMutation })
  })

  function onSuccessfulMutation() {
    reset()

    requestAnimationFrame(() => {
      setFocus('text')
    })
  }

  return (
    <Form onSubmit={onSubmit} error={error} className="flex gap-2.5 py-2">
      <TextInput
        autoFocus
        type="text"
        enterKeyHint="done"
        disabled={isLoading}
        aria-label="New inbox entry"
        placeholder="Add new inbox entry"
        errorMessage={errors.text?.message}
        {...register('text', { required: 'required' })}
      />
      <IconButton
        primary
        type="submit"
        className="px-2"
        icon={RiAddLine}
        loading={isLoading}
        disabled={isLoading || offline}
      />
    </Form>
  )
}

export default InboxForm

type FormFields = {
  text: string
}
