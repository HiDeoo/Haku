import { useSetAtom } from 'jotai/react'

import { addToastAtom } from 'atoms/toast'

export function useToast() {
  const addToast = useSetAtom(addToastAtom)

  return { addToast }
}
