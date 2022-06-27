import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'

import { Button } from 'components/form/Button'
import { Form } from 'components/form/Form'
import { TextArea } from 'components/form/TextArea'
import { Box } from 'components/ui/Box'
import { Safe } from 'components/ui/Safe'
import { ContentType } from 'constants/contentType'
import { getContentTreeQueryPath } from 'hooks/useContentTreeQuery'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { type InferMutationOutput, trpc } from 'libs/trpc'

const Dynalist: Page = () => {
  const { offline } = useNetworkStatus()

  const { push } = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>()

  const { error, isLoading, mutate } = trpc.useMutation(['import.dynalist'], { onSuccess: handleMutationSuccess })
  const { invalidateQueries } = trpc.useContext()

  const handleFormSubmit = handleSubmit((data) => {
    mutate(data)
  })

  function handleMutationSuccess(newMetadata: InferMutationOutput<'import.dynalist'>) {
    invalidateQueries([getContentTreeQueryPath(ContentType.TODO)])
    invalidateQueries(['file.list'])

    push(`/todos/${newMetadata.id}/${newMetadata.slug}`)
  }

  return (
    <Safe>
      <Box
        title="Import from Dynalist"
        details={
          <>
            <p>
              To import a todo from Dynalist, copy its content by right-clicking on a Dynalist todo and selecting
              <strong> Export</strong> and the <strong>OPML</strong> format.
            </p>
            <p>Then, paste it into the text field below.</p>
          </>
        }
      >
        <Form onSubmit={handleFormSubmit} error={error}>
          <TextArea
            rows={3}
            autoFocus
            label="OPML"
            enterKeyHint="done"
            readOnly={isLoading}
            errorMessage={errors.opml?.message}
            placeholder={`<?xml version="1.0" encoding="utf-8"?>
  <opml version="2.0">
    …`}
            {...register('opml', { required: 'required' })}
          />
          <Box.Footer>
            <Button type="submit" primary disabled={isLoading || offline} loading={isLoading}>
              Import
            </Button>
          </Box.Footer>
        </Form>
      </Box>
    </Safe>
  )
}

Dynalist.sidebar = true

export default Dynalist

interface FormFields {
  opml: string
}
