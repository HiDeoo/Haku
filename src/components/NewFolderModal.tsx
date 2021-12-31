import { RiFolderAddLine } from 'react-icons/ri'
import { useState } from 'react'
import { type NestedValue, useForm } from 'react-hook-form'

import Button from 'components/Button'
import FolderPicker, { ROOT_FOLDER_ID } from 'components/FolderPicker'
import Form from 'components/Form'
import IconButton from 'components/IconButton'
import Modal from 'components/Modal'
import TextInput from 'components/TextInput'
import useAddFolder from 'hooks/useAddFolder'
import { type FolderData } from 'libs/db/folder'

const NewFolderModal: React.FC = () => {
  const [opened, setOpened] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>()

  const { error, isLoading, mutate } = useAddFolder()

  const onSubmit = handleSubmit(({ parentFolder, ...data }) => {
    mutate(
      { ...data, parentId: parentFolder.id === ROOT_FOLDER_ID ? undefined : parentFolder.id },
      {
        onSuccess: () => {
          setOpened(false)
          reset()
        },
      }
    )
  })

  return (
    <Modal
      opened={opened}
      title="New Folder"
      onToggle={setOpened}
      disabled={isLoading}
      trigger={<IconButton icon={RiFolderAddLine} tooltip="New Folder" />}
    >
      <Form onSubmit={onSubmit} error={error}>
        <TextInput
          type="text"
          label="Name"
          disabled={isLoading}
          placeholder="Recipes"
          errorMessage={errors.name?.message}
          {...register('name', { required: 'required' })}
        />
        <FolderPicker
          control={control}
          name="parentFolder"
          disabled={isLoading}
          label="Parent Folder"
          errorMessage={errors.parentFolder?.message}
        />
        <Modal.Footer disabled={isLoading}>
          <Button type="submit" primary disabled={isLoading} loading={isLoading}>
            Create
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default NewFolderModal

type FormFields = {
  name: string
  parentFolder: NestedValue<FolderData>
}
