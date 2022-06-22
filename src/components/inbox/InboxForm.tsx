import { useForm } from 'react-hook-form'
import { RiAddLine } from 'react-icons/ri'

import IconButton from 'components/form/IconButton'
import TextInput from 'components/form/TextInput'
import Drawer from 'components/ui/Drawer'
import { useInboxEntryMutation } from 'hooks/useInboxEntryMutation'
import { useNetworkStatus } from 'hooks/useNetworkStatus'

const InboxForm: React.FC = () => {
  const { offline } = useNetworkStatus()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>()

  const { error, isLoading, mutateAdd } = useInboxEntryMutation()

  const handleFormSubmit = handleSubmit((data) => {
    mutateAdd(data, { onSuccess: handleMutationSuccess })
  })

  function handleMutationSuccess() {
    reset()
  }

  return (
    <Drawer.Form error={error} onSubmit={handleFormSubmit}>
      <div className="flex gap-2.5">
        <TextInput
          autoFocus
          type="text"
          enterKeyHint="done"
          readOnly={isLoading}
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
      </div>
    </Drawer.Form>
  )
}

export default InboxForm

type FormFields = {
  text: string
}
