import { CardStackPlusIcon } from '@radix-ui/react-icons'
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
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>()

  const { error, mutate } = useAddFolder()

  const onSubmit = handleSubmit(({ parentFolder, ...data }) => {
    mutate({ ...data, parentId: parentFolder.id === ROOT_FOLDER_ID ? undefined : parentFolder.id })
  })

  return (
    <Modal
      title="New Folder"
      trigger={
        <IconButton tooltip="New Folder">
          <CardStackPlusIcon />
        </IconButton>
      }
    >
      <Form onSubmit={onSubmit} error={error}>
        <TextInput
          type="text"
          label="Name"
          placeholder="Recipes"
          errorMessage={errors.name?.message}
          {...register('name', { required: 'required' })}
        />
        <FolderPicker
          control={control}
          name="parentFolder"
          label="Parent Folder"
          errorMessage={errors.parentFolder?.message}
        />
        <Modal.Footer>
          <Button type="submit" primary>
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
