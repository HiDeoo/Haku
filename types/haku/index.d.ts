import { type NextPage } from 'next'
import { type Session } from 'next-auth'

import './env'
import './webworker'

declare global {
  type UserId = Session['user']['id']

  type Page = NextPage & {
    sidebar?: boolean
  }
}
