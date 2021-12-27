import { CardStackPlusIcon } from '@radix-ui/react-icons'
import { useForm } from 'react-hook-form'

import Button from 'components/Button'
import IconButton from 'components/IconButton'
import Modal from 'components/Modal'
import Combobox from 'components/Combobox'
import TextInput from 'components/TextInput'

const NewFolderModal: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>()

  function onSubmit(t: FormFields) {
    // TODO(HiDeoo)
    console.log('t ', t)
    console.log('name ', t.name)
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
        <Combobox
          items={[
            '11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
            '22222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222',
            '33333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333',
            '44444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444',
            '55555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555',
            '66666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666',
            '77777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777',
            '88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888',
            '99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
          ]}
          label="pick it"
          control={control}
          defaultItem={1}
          name="prout"
          errorMessage={errors.prout?.message}
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
  prout: number
}
