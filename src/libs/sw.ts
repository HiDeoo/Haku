export async function registerServiceWorker(swPath: string, onAvailableUpdate: ServiceWorkerRegistrationUpdateHandler) {
  if ('serviceWorker' in navigator === false) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath, { updateViaCache: 'none' })

    handleServiceWorkerUpdate(registration, onAvailableUpdate)
  } catch (error) {
    console.error('Error while registering service worker:', error)
  }
}

export function sendServiceWorkerMessage<TMessage extends ServiceWorkerMessage>(message: TMessage) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller?.state === 'activated') {
    navigator.serviceWorker.controller.postMessage(message)
  }
}

export async function isResourceCached(cacheName: string, resource: string, input?: Record<string, string>) {
  if ('serviceWorker' in navigator === false || 'caches' in window === false) {
    return false
  }

  let resourceUri = resource

  if (input) {
    resourceUri = `${resource}?input=${encodeURIComponent(JSON.stringify(input))}`
  }

  const cache = await caches.open(cacheName)
  const response = await cache.match(resourceUri)

  return typeof response !== 'undefined'
}

function handleServiceWorkerUpdate(
  registration: ServiceWorkerRegistration,
  onAvailableUpdate: ServiceWorkerRegistrationUpdateHandler
) {
  const updateServiceWorker = () => {
    registration.waiting?.postMessage({ type: 'UPDATE' })
  }

  // Trigger the update flow if a pending update is already available.
  if (registration.waiting) {
    onAvailableUpdate(updateServiceWorker)
  }

  registration.addEventListener('updatefound', () => {
    registration.installing?.addEventListener('statechange', () => {
      // Wait until a (new) version is fully installed before triggering the install/update flow.
      if (registration.waiting) {
        if (navigator.serviceWorker.controller) {
          onAvailableUpdate(updateServiceWorker)
        } else {
          registration.waiting?.postMessage({ type: 'INSTALL' })
        }
      }
    })
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // When the new version has taken over, reload the page.
    window.location.reload()
  })
}

type ServiceWorkerRegistrationUpdateHandler = (updateServiceWorker: () => void) => void

interface ServiceWorkerMessage {
  type: string
}
