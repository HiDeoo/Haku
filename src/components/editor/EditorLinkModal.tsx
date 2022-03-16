import { type Editor } from '@tiptap/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import Button from 'components/form/Button'
import Form from 'components/form/Form'
import TextInput from 'components/form/TextInput'
import Modal, { type ModalProps } from 'components/ui/Modal'

const EditorLinkModal: React.FC<EditorLinkModalProps> = ({ editor, opened, onOpenChange }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormFields>()

  useEffect(() => {
    reset()

    if (!opened) {
      editor?.commands.focus()
    }
  }, [editor, opened, reset])

  const onSubmit = handleSubmit(({ url }) => {
    onOpenChange(false)

    if (url.length === 0) {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  })

  return (
    <Modal opened={opened} onOpenChange={onOpenChange} title="Link">
      <Form onSubmit={onSubmit}>
        <TextInput
          type="url"
          label="URL"
          enterKeyHint="done"
          {...register('url')}
          placeholder="https://address.com"
          errorMessage={errors.url?.message}
          defaultValue={editor?.getAttributes('link').href}
        />
        <Modal.Footer>
          <Button type="submit" primary>
            Update
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default EditorLinkModal

interface EditorLinkModalProps extends Pick<ModalProps, 'opened' | 'onOpenChange'> {
  editor: Editor | null
}

interface FormFields {
  url: string
}
