import { useEffect } from 'react'
import { type NestedValue, useForm } from 'react-hook-form'
import { RiFileAddLine } from 'react-icons/ri'

import Button from 'components/Button'
import FolderPicker, { ROOT_FOLDER_ID } from 'components/FolderPicker'
import Form from 'components/Form'
import IconButton from 'components/IconButton'
import Modal from 'components/Modal'
import TextInput from 'components/TextInput'
import useAddContent from 'hooks/useAddContent'
import { type FolderData } from 'libs/db/folder'
import useContentType from 'hooks/useContentType'
import { capitalize } from 'libs/string'
import { type StoreState, useStore } from 'stores'

const storeSelector = (state: StoreState) => [state.content, state.setContentModal] as const

const NewContentModal: React.FC = () => {
  const { hrType } = useContentType()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>()

  const { error, isLoading, mutate } = useAddContent()
  const [{ opened }, setOpened] = useStore(storeSelector)

  useEffect(() => {
    if (!opened) {
      reset()
    }
  }, [opened, reset])

  const onSubmit = handleSubmit(({ folder, ...data }) => {
    mutate(
      { ...data, folderId: folder.id === ROOT_FOLDER_ID ? undefined : folder.id },
      {
        onSuccess: () => {
          setOpened(false)
          reset()
        },
      }
    )
  })

  const title = `New ${capitalize(hrType ?? '')}`

  return (
    <Modal
      title={title}
      opened={opened}
      disabled={isLoading}
      onOpenChange={setOpened}
      trigger={<IconButton icon={RiFileAddLine} tooltip={title} />}
    >
      <Form onSubmit={onSubmit} error={error}>
        <TextInput
          type="text"
          label="Name"
          disabled={isLoading}
          placeholder="Beef Bourguignon"
          errorMessage={errors.name?.message}
          {...register('name', { required: 'required' })}
        />
        <FolderPicker control={control} name="folder" disabled={isLoading} errorMessage={errors.folder?.message} />
        <Modal.Footer disabled={isLoading}>
          <Button type="submit" primary disabled={isLoading} loading={isLoading}>
            Create
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default NewContentModal

type FormFields = {
  name: string
  folder: NestedValue<FolderData>
}
