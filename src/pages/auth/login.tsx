import { type NextPage } from 'next'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'

const Login: NextPage = () => {
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
      {errors.email && <span>This field is required</span>}
      <input type="submit" />
    </form>
  )
}

export default Login

type FormFields = {
  email: string
}
