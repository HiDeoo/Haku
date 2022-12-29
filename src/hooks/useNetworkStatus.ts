import { useAtomValue } from 'jotai/react'

import { onlineAtom } from 'atoms/network'

export function useNetworkStatus() {
  const online = useAtomValue(onlineAtom)

  return { offline: !online, online }
}
