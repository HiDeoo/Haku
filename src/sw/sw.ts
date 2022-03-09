// https://github.com/microsoft/TypeScript/issues/14877#issuecomment-872329108
const sw = self as ServiceWorkerGlobalScope & typeof globalThis

// The version of the offline cache that can be incremented to trigger an update of the service worker which would
// result in a network update of the previously cached resources (this should only be used if the offline fallback page
// has been updated without the service worker being updated).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const offlineCacheVersion = 1

const offlineCacheName = 'offline'
const offlineCacheUrl = '/offline.html'

sw.addEventListener('install', handleInstallEvent)
sw.addEventListener('activate', handleActivateEvent)
sw.addEventListener('message', handleMessageEvent)
sw.addEventListener('fetch', handleFetchEvent)

function handleInstallEvent(event: ExtendableEvent) {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(offlineCacheName)
      await cache.add(new Request(offlineCacheUrl, { cache: 'reload' }))
    })()
  )
}

function handleActivateEvent(event: ExtendableEvent) {
  event.waitUntil(
    (async () => {
      if ('navigationPreload' in sw.registration) {
        await sw.registration.navigationPreload.enable()
      }
    })()
  )
}

function handleMessageEvent(event: ExtendableMessageEvent) {
  if (typeof event.data !== 'object' || typeof event.data.type !== 'string') {
    return
  }

  switch (event.data.type) {
    case 'UPDATE': {
      sw.skipWaiting()

      break
    }
    default: {
      console.error('Unsupported service worker message type.')
    }
  }
}

function handleFetchEvent(event: FetchEvent) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse

          if (preloadResponse) {
            return preloadResponse
          }

          const networkResponse = await fetch(event.request)

          return networkResponse
        } catch (error) {
          const cache = await caches.open(offlineCacheName)
          const cachedResponse = await cache.match(offlineCacheUrl)

          return cachedResponse
        }
      })()
    )
  }

  return
}
