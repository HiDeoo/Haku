import { type Session } from 'next-auth'

declare global {
  type UserId = Session['user']['id']

  // Just for the sake of object destructuring and having a better named ID e.g. `const { userId } = user`.
  type UserWithUserId = Omit<Session['user'], 'id'> & { userId: UserId }
}

export {}
