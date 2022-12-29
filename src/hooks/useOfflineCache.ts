import { useAtomValue } from 'jotai/react'
import { useResetAtom } from 'jotai/react/utils'
import { useEffect } from 'react'

import { contentAvailableOfflineAtom } from 'atoms/network'

export function useOfflineCache() {
  const contentAvailableOffline = useAtomValue(contentAvailableOfflineAtom)
  const resetContentAvailableOffline = useResetAtom(contentAvailableOfflineAtom)

  useEffect(() => {
    resetContentAvailableOffline()
  }, [resetContentAvailableOffline])

  return { availableOffline: contentAvailableOffline, ready: contentAvailableOffline !== undefined }
}
