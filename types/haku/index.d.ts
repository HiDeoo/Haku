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

      ADMIN_API_KEY: string

      DB_URL: string
      MIGRATE_DB_URL: string
      SHADOW_DB_URL: string
    }
  }
}

export {}
