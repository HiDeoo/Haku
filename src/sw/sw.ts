// https://github.com/microsoft/TypeScript/issues/14877#issuecomment-872329108
const sw = self as ServiceWorkerGlobalScope & typeof globalThis

sw.addEventListener('message', handleMessageEvent)
sw.addEventListener('fetch', handleFetchEvent)

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

function handleFetchEvent() {
  return
}
