import { type NextPage } from 'next'
import { type Session } from 'next-auth'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_HOST: string
      DB_NAME: string
      DB_USER: string
      DB_PASSWORD: string

      SHADOW_DB_HOST: string
      SHADOW_DB_NAME: string
      SHADOW_DB_USER: string
      SHADOW_DB_PASSWORD: string

      EMAIL_JS_USER_ID: string
      EMAIL_JS_ACCESS_TOKEN: string
      EMAIL_JS_SERVICE_ID: string
      EMAIL_JS_TEMPLATE_ID_LOGIN: string

      ADMIN_API_KEY: string

      NEXTAUTH_SECRET: string

      DB_URL: string
      MIGRATE_DB_URL: string
      SHADOW_DB_URL: string
    }
  }

  type UserId = Session['user']['id']

  // Just for the sake of object destructuring and having a better named ID e.g. `const { userId } = user`.
  type UserWithUserId = Omit<Session['user'], 'id'> & { userId: UserId }

  type Page = NextPage & {
    sidebar?: boolean
  }
}

export {}
