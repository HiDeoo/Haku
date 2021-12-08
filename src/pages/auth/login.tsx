import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import { useSession, signIn } from 'next-auth/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

const Login: NextPage = () => {
  const { push } = useRouter()
  const { status } = useSession()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>()

  useEffect(() => {
    if (status === 'authenticated') {
      push('/')
    }
  }, [push, status])

  function onSubmit({ email }: FormFields) {
    signIn('email-api', { email })
  }

  if (status === 'loading') {
    return <div>LOADING</div>
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
