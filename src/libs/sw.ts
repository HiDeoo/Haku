export async function registerServiceWorker(swPath: string, onAvailableUpdate: ServiceWorkerRegistrationUpdateHandler) {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath)

    handleServiceWorkerUpdate(registration, onAvailableUpdate)
  } catch (error) {
    console.error('Error while registering service worker:', error)
  }
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
      // Wait until a new version is fully installed before triggering the update flow.
      if (registration.waiting && navigator.serviceWorker.controller) {
        onAvailableUpdate(updateServiceWorker)
      }
    })
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // When the new version has taken over, reload the page.
    window.location.reload()
  })
}

type ServiceWorkerRegistrationUpdateHandler = (updateServiceWorker: () => void) => void
