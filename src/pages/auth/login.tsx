import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'

import { getAuthErrorMesssage } from 'libs/auth'

const Login: NextPage = () => {
  const { query } = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>()

  function onSubmit({ email }: FormFields) {
    signIn('email-api', { email, callbackUrl: '/' })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="email" {...register('email', { required: true })} />
      {errors.email && <div>This field is required</div>}
      {query.error && <div>{getAuthErrorMesssage(query.error)}</div>}
      <input type="submit" />
    </form>
  )
}

export default Login

type FormFields = {
  email: string
}
