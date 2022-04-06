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

      IMAGEKIT_URL_ENDPOINT: string
      IMAGEKIT_PRIVATE_API_KEY: string

      ADMIN_API_KEY: string

      NEXTAUTH_SECRET: string

      DB_URL: string
      MIGRATE_DB_URL: string
      SHADOW_DB_URL: string
    }
  }

  // https://wicg.github.io/ua-client-hints/#dictdef-uadatavalues
  interface Navigator {
    userAgentData?: {
      brands: string[]
      mobile: boolean
      architecture: string
      bitness: string
      model: string
      platform: string
      platformVersion: string
      uaFullVersion: string
      wow64: boolean
      fullVersionList: {
        brand: string
        version: string
      }[]
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    prompt: () => Promise<void>
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }

  // https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1029#issuecomment-869224737
  interface ServiceWorkerRegistration {
    readonly navigationPreload: NavigationPreloadManager
  }

  // https://github.com/GoogleChrome/workbox/issues/2974#issuecomment-963219535
  interface FetchEvent {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly preloadResponse?: Promise<any>
  }

  // https://github.com/microsoft/TypeScript/pull/47254
  declare namespace Intl {
    type ListFormatLocaleMatcher = 'lookup' | 'best fit'
    type ListFormatType = 'conjunction' | 'disjunction' | 'unit'
    type ListFormatStyle = 'long' | 'short' | 'narrow'

    interface ListFormatOptions {
      localeMatcher?: ListFormatLocaleMatcher
      type?: ListFormatType
      style?: ListFormatStyle
    }

    interface ListFormat {
      format(list: Iterable<string>): string

      formatToParts(list: Iterable<string>): { type: 'element' | 'literal'; value: string }[]
    }

    const ListFormat: {
      prototype: ListFormat

      new (locales?: BCP47LanguageTag | BCP47LanguageTag[], options?: ListFormatOptions): ListFormat

      supportedLocalesOf(
        locales: BCP47LanguageTag | BCP47LanguageTag[],
        options?: Pick<ListFormatOptions, 'localeMatcher'>
      ): BCP47LanguageTag[]
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
