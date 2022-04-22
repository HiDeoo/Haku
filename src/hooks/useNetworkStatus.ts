import { useAtomValue } from 'jotai'

import { onlineAtom } from 'atoms/network'

export function useNetworkStatus() {
  const online = useAtomValue(onlineAtom)

  return { offline: !online, online }
}
