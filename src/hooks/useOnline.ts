import { useAtomValue } from 'jotai/utils'

import { onlineAtom } from 'atoms/network'

export function useOnline() {
  const online = useAtomValue(onlineAtom)

  return online
}
