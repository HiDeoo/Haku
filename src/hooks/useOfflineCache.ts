import { useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { contentAvailableOfflineAtom } from 'atoms/network'

export function useOfflineCache() {
  const contentAvailableOffline = useAtomValue(contentAvailableOfflineAtom)
  const resetContentAvailableOffline = useResetAtom(contentAvailableOfflineAtom)

  useEffect(() => {
    resetContentAvailableOffline()
  }, [resetContentAvailableOffline])

  return { availableOffline: contentAvailableOffline, ready: typeof contentAvailableOffline !== 'undefined' }
}
