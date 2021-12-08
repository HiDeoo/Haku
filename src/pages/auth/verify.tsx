import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

const Email: NextPage = () => {
  const { push } = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      push('/')
    }
  }, [push, status])

  if (status === 'loading') {
    return <div>LOADING</div>
  }

  return (
    <>
      <div>Check your email</div>
      <div>A sign in link has been sent to your email address.</div>
    </>
  )
}

export default Email
