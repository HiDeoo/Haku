import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'

import { getAuthErrorMesssage } from 'libs/auth'
import TextInput from 'components/TextInput'
import Button from 'components/Button'
import Flex from 'components/Flex'
import Form from 'components/Form'

const Login: Page = () => {
  const { query } = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormFields>()

  const callbackUrl = typeof query.callbackUrl === 'string' ? query.callbackUrl : undefined

  function onSubmit({ email }: FormFields) {
    signIn('email-api', { email, callbackUrl: callbackUrl ?? '/' })
  }

  return (
    <Flex direction="col" className="w-60">
      <Form onSubmit={handleSubmit(onSubmit)} errorMessage={query.error && getAuthErrorMesssage(query.error)}>
        <TextInput
          autoFocus
          type="email"
          label="Email"
          placeholder="user@address.com"
          errorMessage={errors.email?.message}
          {...register('email', { required: 'required' })}
        />
        <Button type="submit" primary className="w-full" disabled={isSubmitSuccessful} loading={isSubmitSuccessful}>
          Login
        </Button>
      </Form>
    </Flex>
  )
}

Login.sidebar = false

export default Login

type FormFields = {
  email: string
}
