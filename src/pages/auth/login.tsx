import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'

import { getAuthErrorMesssage } from 'libs/auth'
import TextInput from 'components/TextInput'
import Button from 'components/Button'
import Flex from 'components/Flex'
import Callout from 'components/Callout'

const Login: Page = () => {
  const { query } = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormFields>()

  function onSubmit({ email }: FormFields) {
    signIn('email-api', { email, callbackUrl: '/' })
  }

  return (
    <Flex direction="col" className="w-60">
      {query.error ? <Callout intent="error" message={getAuthErrorMesssage(query.error)} /> : null}
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          type="email"
          label="Email"
          placeholder="user@address.com"
          errorMessage={errors.email?.message}
          {...register('email', { required: 'required' })}
        />
        <Button type="submit" primary className="w-full" disabled={isSubmitSuccessful} loading={isSubmitSuccessful}>
          Login
        </Button>
      </form>
    </Flex>
  )
}

Login.sidebar = false

export default Login

type FormFields = {
  email: string
}
