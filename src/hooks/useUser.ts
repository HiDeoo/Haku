import { useSession } from 'next-auth/react'

export default function useUser() {
  const { data: session } = useSession()

  if (!session) {
    throw new Error('The session does not contain an authenticated user.')
  }

  return session.user
}
