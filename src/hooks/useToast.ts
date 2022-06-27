import { useSetAtom } from 'jotai'

import { addToastAtom } from 'atoms/toast'

export function useToast() {
  const addToast = useSetAtom(addToastAtom)

  return { addToast }
}
