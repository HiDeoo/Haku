import { RiFileAddLine } from 'react-icons/ri'
import { useState } from 'react'
import { type NestedValue, useForm } from 'react-hook-form'

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

const NewContentModal: React.FC = () => {
  const [opened, setOpened] = useState(false)

  const type = useContentType()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>()

  const { error, isLoading, mutate } = useAddContent()

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

  const title = `New ${capitalize(type ?? '')}`

  return (
    <Modal
      title={title}
      opened={opened}
      onToggle={setOpened}
      disabled={isLoading}
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
