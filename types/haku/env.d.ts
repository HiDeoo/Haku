declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_VERSION: string
      NEXT_PUBLIC_BUGS_URL: string

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

      CLOUDINARY_CLOUD_NAME: string
      CLOUDINARY_API_KEY: string
      CLOUDINARY_API_SECRET: string

      NEXT_PUBLIC_INBOX_APPLE_SHORTCUT_LINK: string

      ADMIN_API_KEY: string

      NEXTAUTH_SECRET: string

      DB_URL: string
      MIGRATE_DB_URL: string
      SHADOW_DB_URL: string
    }
  }
}

export {}
