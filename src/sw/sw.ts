// https://github.com/microsoft/TypeScript/issues/14877#issuecomment-872329108
const sw = self as ServiceWorkerGlobalScope & typeof globalThis

self.importScripts('/sw-config.js')

sw.addEventListener('install', handleInstallEvent)
sw.addEventListener('activate', handleActivateEvent)
sw.addEventListener('message', handleMessageEvent)
sw.addEventListener('fetch', handleFetchEvent)

function handleInstallEvent(event: ExtendableEvent) {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHES.Assets)

      for (const asset of ASSETS) {
        await cache.add(new Request(asset, { cache: 'reload' }))
      }
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
    case 'INSTALL': {
      event.waitUntil(sw.clients.claim())

      break
    }
    case 'UPDATE': {
      sw.skipWaiting()

      event.waitUntil(
        (async () => {
          const cache = await caches.open(CACHES.Assets)
          const requests = await cache.keys()

          for (const request of requests) {
            const requestUrl = new URL(request.url)

            if (!ASSETS.includes(requestUrl.pathname)) {
              await cache.delete(request)
            }
          }
        })()
      )

      break
    }
    case 'LOAD': {
      clearCache(CACHES.Api, 50)
      clearCache(CACHES.Images, 25)

      break
    }
    case 'LOGOUT': {
      event.waitUntil(caches.delete(CACHES.Api))
      event.waitUntil(caches.delete(CACHES.Images))

      break
    }
    default: {
      console.error(`Unsupported service worker message type '${event.data.type}'.`)
    }
  }
}

function handleFetchEvent(event: FetchEvent) {
  if (event.request.method !== 'GET' || event.request.headers.has('range')) {
    return
  }

  const requestUrl = new URL(event.request.url)

  if (IS_PROD && (requestUrl.origin === location.origin || requestUrl.origin === IMAGE_DELIVERY_URL)) {
    if (/^\/(?:_next\/static|images)\/.*\.(?:js|css|png|jpg|ico|svg)$/i.test(requestUrl.pathname)) {
      return respondWithCacheThenNetwork(event, CACHES.Assets)
    } else if (/^\/api\/(?!.*(?:csrf|search)$)[/\w-.]+$/i.test(requestUrl.pathname)) {
      return respondWithNetworkThenCache(event, CACHES.Api)
    } else if (/^\/[a-z]+\/image\/private\//.test(requestUrl.pathname)) {
      return respondWithCacheThenNetwork(event, CACHES.Images)
    } else if (
      event.request.mode === 'navigate' ||
      event.request.headers.get('accept')?.startsWith('text/html') ||
      requestUrl.pathname === '/manifest.webmanifest'
    ) {
      return respondWithPage(event, requestUrl.pathname)
    }
  }

  event.respondWith(
    (async function () {
      const preloadResponse = await event.preloadResponse

      if (preloadResponse) {
        return preloadResponse
      }

      return fetch(event.request)
    })()
  )
}

function respondWithCacheThenNetwork(event: FetchEvent, cacheName: string) {
  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(event.request)

      if (cachedResponse) {
        return cachedResponse
      }

      return fetchAndCacheResponse(event, cacheName)
    })()
  )
}

function respondWithNetworkThenCache(event: FetchEvent, cacheName: string) {
  event.respondWith(
    (async () => {
      try {
        return await fetchAndCacheResponse(event, cacheName, true)
      } catch {
        // Silently fallback to the cache if the network request failed.
      }

      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(event.request)

      if (cachedResponse) {
        return cachedResponse
      }

      return respondWithNetworkError()
    })()
  )
}

function respondWithPage(event: FetchEvent, pathName: string) {
  const isNotePage = /^\/notes\/.+$/i.test(pathName)
  const isTodoPage = /^\/todos\/.+$/i.test(pathName)

  const requestInfo = isNotePage ? '/notes/[id]' : isTodoPage ? '/todos/[id]' : event.request

  event.respondWith(
    (async () => {
      try {
        // For navigation related event, it looks like we have to consume the preload response first before even
        // querying the cache or the browser will emit an error about the preload request being cancelled before the
        // response.
        const preloadResponse = await preloadAndCacheResponse(event, CACHES.Assets, requestInfo)

        if (preloadResponse) {
          return preloadResponse
        }
      } catch {
        // Silently fallback to the cache if the preload request failed.
      }

      const cache = await caches.open(CACHES.Assets)
      const cachedResponse = await cache.match(requestInfo)

      if (cachedResponse) {
        return cachedResponse
      }

      try {
        return await fetchAndCacheResponse(event, CACHES.Assets, true, requestInfo, false)
      } catch {
        return cache.match('/offline')
      }
    })()
  )
}

async function fetchAndCacheResponse(
  event: FetchEvent,
  cacheName: string,
  throwOnNetworkError = false,
  cacheRequestInfo: RequestInfo = event.request,
  usePreload = true
) {
  try {
    if (usePreload) {
      const preloadResponse = await preloadAndCacheResponse(event, cacheName, cacheRequestInfo)

      if (preloadResponse) {
        return preloadResponse
      }
    }

    const networkResponse = await fetch(event.request)

    await cacheResponse(cacheRequestInfo, networkResponse, cacheName)

    return networkResponse
  } catch (error) {
    if (!throwOnNetworkError) {
      return respondWithNetworkError()
    }

    throw error
  }
}

async function preloadAndCacheResponse(
  event: FetchEvent,
  cacheName: string,
  cacheRequestInfo: RequestInfo = event.request
) {
  const preloadResponse = await event.preloadResponse

  if (preloadResponse) {
    await cacheResponse(cacheRequestInfo, preloadResponse, cacheName)

    return preloadResponse
  }
}

async function cacheResponse(requestInfo: RequestInfo, response: Response, cacheName: string) {
  if (response && response.ok) {
    const cache = await caches.open(cacheName)

    cache.put(requestInfo, response.clone())
  }
}

function respondWithNetworkError() {
  return new Response('Network fetch error', { status: 408, headers: { 'Content-Type': 'text/plain' } })
}

async function clearCache(cacheName: string, maxEntries: number) {
  const cache = await caches.open(cacheName)
  const requests = await cache.keys()
  const firstRequest = requests[0]

  // Delete a bit more entries so that we don't have to clear the cache too often.
  if (requests.length > maxEntries - Math.round(maxEntries / 5) && firstRequest) {
    await cache.delete(firstRequest)

    clearCache(cacheName, maxEntries)
  }
}

declare const ASSETS: string[]
declare const CACHES: { Api: string; Assets: string; Images: string }
declare const IMAGE_DELIVERY_URL: string
declare const IS_PROD: boolean
