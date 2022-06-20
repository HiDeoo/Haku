import { useUpdateAtom } from 'jotai/utils'

import { fileHistoryAtom } from 'atoms/fileHistory'
import useRouteChange from 'hooks/useRouteChange'

const fileRegExp = /^\/(?:notes|todos)\/(?<id>c[\dA-Za-z]+)\/?/

export function useFileHistory() {
  const addToFileHistory = useUpdateAtom(fileHistoryAtom)

  useRouteChange((url) => {
    const match = url.match(fileRegExp)
    const id = match?.groups?.id

    if (id) {
      addToFileHistory(id)
    }
  })
}
