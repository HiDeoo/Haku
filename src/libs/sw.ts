export async function registerServiceWorker(swPath: string) {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath)

    handleServiceWorkerUpdate(registration)
  } catch (error) {
    console.error('Error while registering service worker:', error)
  }
}

function handleServiceWorkerUpdate(registration: ServiceWorkerRegistration) {
  // Trigger the update flow if a pending update is already available.
  if (registration.waiting) {
    // TODO(HiDeoo)
    console.log('UPDATE ALREADY AVAILABLE')
  }

  registration.addEventListener('updatefound', () => {
    registration.installing?.addEventListener('statechange', () => {
      // Wait until a new version is fully installed before triggering the update flow.
      if (registration.waiting && navigator.serviceWorker.controller) {
        // TODO(HiDeoo)
        console.log('UPDATE AVAILABLE AND DONE INSTALLING')
      }
    })
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // When the new version has taken over, reload the page.
    window.location.reload()
  })
}
