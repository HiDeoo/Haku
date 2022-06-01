import { useForm } from 'react-hook-form'
import { RiAddLine } from 'react-icons/ri'

import Form from 'components/form/Form'
import IconButton from 'components/form/IconButton'
import TextInput from 'components/form/TextInput'
import { useInboxEntryMutation } from 'hooks/useInboxEntryMutation'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import clst from 'styles/clst'

const InboxForm: React.FC = () => {
  const { offline } = useNetworkStatus()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
  } = useForm<FormFields>()

  const { error, isLoading, mutateAdd } = useInboxEntryMutation()

  const formClasses = clst(
    'z-10 bg-zinc-900/10 p-3 shadow-[0px_1px_2px_0px_rgb(0,0,0,0.5)]',
    'supports-max:pl-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-left)))]'
  )

  const handleFormSubmit = handleSubmit((data) => {
    mutateAdd(data, { onSuccess: handleMutationSuccess })
  })

  function handleMutationSuccess() {
    // https://github.com/react-hook-form/react-hook-form/issues/6978#issuecomment-975668363
    requestAnimationFrame(() => {
      reset()

      requestAnimationFrame(() => {
        setFocus('text')
      })
    })
  }

  return (
    <Form error={error} onSubmit={handleFormSubmit} className={formClasses}>
      <div className="flex gap-2.5">
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
      </div>
    </Form>
  )
}

export default InboxForm

type FormFields = {
  text: string
}
