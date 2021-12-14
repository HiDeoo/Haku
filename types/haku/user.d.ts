declare global {
  import { type Session } from 'next-auth'

  type UserId = Session['user']['id']
}

export {}
