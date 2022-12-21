import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { RiFolderAddLine } from 'react-icons/ri'

import { folderModalAtom, setFolderModalOpenedAtom } from 'atoms/togglable'
import { FolderPicker } from 'components/folder/FolderPicker'
import { Button } from 'components/form/Button'
import { Form } from 'components/form/Form'
import { IconButton } from 'components/form/IconButton'
import { TextInput } from 'components/form/TextInput'
import { Alert } from 'components/ui/Alert'
import { Modal } from 'components/ui/Modal'
import { ROOT_FOLDER_ID } from 'constants/folder'
import { useFolderMutation } from 'hooks/useFolderMutation'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { type FolderData } from 'libs/db/folder'

export const FolderModal = () => {
  const { offline } = useNetworkStatus()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<FormFields>()

  const { error, isLoading, mutateAdd, mutateDelete, mutateUpdate, reset: resetMutation, type } = useFolderMutation()
  const { action, data: folder, opened } = useAtomValue(folderModalAtom)
  const setOpened = useSetAtom(setFolderModalOpenedAtom)

  const isUpdating = action === 'update' && folder !== undefined
  const isRemoving = action === 'delete' && folder !== undefined

  useEffect(() => {
    resetForm()
    resetMutation()
  }, [opened, resetForm, resetMutation])

  const handleFormSubmit = handleSubmit(({ parentFolder, ...data }) => {
    const parentId = parentFolder.id === ROOT_FOLDER_ID ? null : parentFolder.id

    if (isUpdating) {
      mutateUpdate({ ...data, id: folder.id, parentId }, { onSuccess: handleMutationSuccess })
    } else {
      mutateAdd({ ...data, parentId, type }, { onSuccess: handleMutationSuccess })
    }
  })

  function handleDeleteConfirm() {
    if (isRemoving) {
      mutateDelete({ id: folder.id }, { onSuccess: handleMutationSuccess })
    }
  }

  function handleMutationSuccess() {
    setOpened(false)
    resetForm()
  }

  return (
    <>
      <Alert
        disabled={isLoading}
        title="Delete Folder"
        onOpenChange={setOpened}
        opened={opened && isRemoving}
        onConfirm={handleDeleteConfirm}
      >
        Are you sure you want to delete the folder <strong>&ldquo;{folder?.name}&rdquo;</strong> and all its contents?
      </Alert>
      <Modal
        disabled={isLoading}
        onOpenChange={setOpened}
        opened={opened && !isRemoving}
        title={`${isUpdating ? 'Edit' : 'New'} Folder`}
        trigger={<IconButton icon={RiFolderAddLine} tooltip="New Folder" disabled={offline} />}
      >
        <Form onSubmit={handleFormSubmit} error={error}>
          <TextInput
            type="text"
            label="Name"
            enterKeyHint="done"
            readOnly={isLoading}
            placeholder="Recipes"
            defaultValue={folder?.name ?? ''}
            errorMessage={errors.name?.message}
            {...register('name', { required: 'required' })}
          />
          <FolderPicker
            control={control}
            name="parentFolder"
            disabled={isLoading}
            label="Parent Folder"
            defaultFolderId={folder?.parentId}
            errorMessage={errors.parentFolder?.message}
          />
          <Modal.Footer disabled={isLoading}>
            <Button type="submit" primary disabled={isLoading || offline} loading={isLoading}>
              {isUpdating ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

interface FormFields {
  name: string
  parentFolder: FolderData
}
