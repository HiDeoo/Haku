declare global {
  // https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1029#issuecomment-869224737
  interface ServiceWorkerRegistration {
    readonly navigationPreload: NavigationPreloadManager
  }

  // https://github.com/GoogleChrome/workbox/issues/2974#issuecomment-963219535
  interface FetchEvent {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly preloadResponse?: Promise<any>
  }
}

export {}
