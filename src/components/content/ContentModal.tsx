import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { type NestedValue, useForm } from 'react-hook-form'
import { RiErrorWarningLine, RiFileAddLine } from 'react-icons/ri'

import { contentModalAtom, setContentModalOpenedAtom } from 'atoms/togglable'
import { FolderPicker } from 'components/folder/FolderPicker'
import { Button } from 'components/form/Button'
import { Form } from 'components/form/Form'
import { IconButton } from 'components/form/IconButton'
import { TextInput } from 'components/form/TextInput'
import { Alert } from 'components/ui/Alert'
import { Modal } from 'components/ui/Modal'
import { ROOT_FOLDER_ID } from 'constants/folder'
import { useContentType } from 'hooks/useContentType'
import { useMetadataMutation } from 'hooks/useMetadataMutation'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { useToast } from 'hooks/useToast'
import { type FolderData } from 'libs/db/folder'

export const ContentModal: React.FC = () => {
  const { offline } = useNetworkStatus()

  const { cType, lcType } = useContentType()

  const { addToast } = useToast()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<FormFields>()

  const { error, isLoading, mutateAdd, mutateDelete, mutateUpdate, reset: resetMutation } = useMetadataMutation()
  const { action, data: content, opened } = useAtomValue(contentModalAtom)
  const setOpened = useSetAtom(setContentModalOpenedAtom)

  const isUpdating = action === 'update' && typeof content !== 'undefined'
  const isRemoving = action === 'delete' && typeof content !== 'undefined'

  const restoreFocusOnClose = useRef(true)

  useEffect(() => {
    resetForm()
    resetMutation()
  }, [opened, resetForm, resetMutation])

  const handleFormSubmit = handleSubmit(({ folder, ...data }) => {
    const folderId = folder.id === ROOT_FOLDER_ID ? undefined : folder.id

    if (isUpdating) {
      mutateUpdate({ ...data, folderId, id: content.id }, { onSuccess: handleMutationSuccess })
    } else {
      mutateAdd({ ...data, folderId }, { onSuccess: handleMutationSuccess })
    }
  })

  function handleDeleteConfirm() {
    if (isRemoving) {
      mutateDelete({ id: content.id }, { onSuccess: handleMutationSuccess, onError: handleMutationError })
    }
  }

  function handleMutationSuccess() {
    if (!isRemoving) {
      restoreFocusOnClose.current = false
    }

    setOpened(false)
    resetForm()
  }

  function handleMutationError() {
    const action = isRemoving ? 'delete' : isUpdating ? 'update' : 'create'

    addToast({
      details: 'Please try again.',
      icon: RiErrorWarningLine,
      text: `Failed to ${action} ${lcType}.`,
      type: 'foreground',
    })
  }

  function handleModalCloseAutoFocus(event: Event) {
    if (!restoreFocusOnClose.current) {
      event.preventDefault()

      restoreFocusOnClose.current = true
    }
  }

  const title = `${isUpdating ? 'Edit' : 'New'} ${cType}`

  return (
    <>
      <Alert
        disabled={isLoading}
        onOpenChange={setOpened}
        title={`Delete ${cType}`}
        opened={opened && isRemoving}
        onConfirm={handleDeleteConfirm}
      >
        Are you sure you want to delete the {lcType} <strong>&ldquo;{content?.name}&rdquo;</strong>?
      </Alert>
      <Modal
        title={title}
        disabled={isLoading}
        onOpenChange={setOpened}
        opened={opened && !isRemoving}
        onCloseAutoFocus={handleModalCloseAutoFocus}
        trigger={<IconButton icon={RiFileAddLine} tooltip={title} disabled={offline} />}
      >
        <Form onSubmit={handleFormSubmit} error={error}>
          <TextInput
            type="text"
            label="Name"
            enterKeyHint="done"
            readOnly={isLoading}
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
            <Button type="submit" primary disabled={isLoading || offline} loading={isLoading}>
              {isUpdating ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}

type FormFields = {
  name: string
  folder: NestedValue<FolderData>
}
