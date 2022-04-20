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
