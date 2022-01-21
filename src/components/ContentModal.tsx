import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { type NestedValue, useForm } from 'react-hook-form'
import { RiFileAddLine } from 'react-icons/ri'

import { contentModalAtom, setContentModalOpenedAtom } from 'atoms/modal'
import Alert from 'components/Alert'
import Button from 'components/Button'
import FolderPicker, { ROOT_FOLDER_ID } from 'components/FolderPicker'
import Form from 'components/Form'
import IconButton from 'components/IconButton'
import Modal from 'components/Modal'
import TextInput from 'components/TextInput'
import useMetadataMutation, { type MetadataMutation } from 'hooks/useMetadataMutation'
import { type FolderData } from 'libs/db/folder'
import useContentType from 'hooks/useContentType'

const NewContentModal: React.FC = () => {
  const { cType, lcType } = useContentType()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>()

  const { error, isLoading, mutate } = useMetadataMutation()
  const [{ action, data: content, opened }] = useAtom(contentModalAtom)
  const setOpened = useUpdateAtom(setContentModalOpenedAtom)

  const isUpdating = action === 'update' && typeof content !== 'undefined'
  const isRemoving = action === 'delete' && typeof content !== 'undefined'

  useEffect(() => {
    reset()
  }, [opened, reset])

  const onSubmit = handleSubmit(({ folder, ...data }) => {
    const folderId = folder.id === ROOT_FOLDER_ID ? undefined : folder.id

    const mutationData: MetadataMutation = isUpdating
      ? { ...data, action: 'update', folderId, id: content.id }
      : { ...data, action: 'insert', folderId }

    mutate(mutationData, { onSuccess: onSuccessfulMutation })
  })

  function onConfirmDelete() {
    if (isRemoving) {
      mutate({ action: 'delete', id: content.id }, { onSuccess: onSuccessfulMutation })
    }
  }

  function onSuccessfulMutation() {
    setOpened(false)
    reset()
  }

  const title = `${isUpdating ? 'Edit' : 'New'} ${cType}`

  return (
    <>
      <Alert
        disabled={isLoading}
        onOpenChange={setOpened}
        title={`Delete ${cType}`}
        onConfirm={onConfirmDelete}
        opened={opened && isRemoving}
      >
        Are you sure you want to delete the {lcType} <strong>&ldquo;{content?.name}&rdquo;</strong>?
      </Alert>
      <Modal
        title={title}
        disabled={isLoading}
        onOpenChange={setOpened}
        opened={opened && !isRemoving}
        trigger={<IconButton icon={RiFileAddLine} tooltip={title} />}
      >
        <Form onSubmit={onSubmit} error={error}>
          <TextInput
            type="text"
            label="Name"
            disabled={isLoading}
            placeholder="Beef Bourguignon"
            defaultValue={content?.name ?? ''}
            errorMessage={errors.name?.message}
            {...register('name', { required: 'required' })}
          />
          <FolderPicker
            name="folder"
            control={control}
            disabled={isLoading}
            defaultFolderId={content?.folderId}
            errorMessage={errors.folder?.message}
          />
          <Modal.Footer disabled={isLoading}>
            <Button type="submit" primary disabled={isLoading} loading={isLoading}>
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

export default NewContentModal

type FormFields = {
  name: string
  folder: NestedValue<FolderData>
}
