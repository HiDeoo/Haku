import { useSetAtom } from 'jotai'

import { fileHistoryAtom } from 'atoms/fileHistory'
import { useRouteChange } from 'hooks/useRouteChange'

const fileRegExp = /^\/(?:notes|todos)\/(?<id>c[\dA-Za-z]+)\/?/

export function useFileHistory() {
  const addToFileHistory = useSetAtom(fileHistoryAtom)

  useRouteChange((url) => {
    const match = url.match(fileRegExp)
    const id = match?.groups?.id

    if (id) {
      addToFileHistory(id)
    }
  })
}
