import { CardStackPlusIcon } from '@radix-ui/react-icons'
import { useForm } from 'react-hook-form'

import Button from 'components/Button'
import IconButton from 'components/IconButton'
import Modal from 'components/Modal'
import TextInput from 'components/TextInput'

const NewFolderModal: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>()

  function onSubmit({ name }: FormFields) {
    // TODO(HiDeoo)
    console.log('name ', name)
  }

  return (
    <Modal
      title="New Folder"
      trigger={
        <IconButton tooltip="New Folder">
          <CardStackPlusIcon />
        </IconButton>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          type="text"
          label="Name"
          placeholder="Recipes"
          errorMessage={errors.name?.message}
          {...register('name', { required: 'required' })}
        />
        <Modal.Footer>
          <Button type="submit" primary>
            Create
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default NewFolderModal

type FormFields = {
  name: string
}
