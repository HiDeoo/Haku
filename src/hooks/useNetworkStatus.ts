import { useAtomValue } from 'jotai/utils'

import { onlineAtom } from 'atoms/network'

export function useNetworkStatus() {
  const online = useAtomValue(onlineAtom)

  return { offline: !online, online }
}
