import { useSetAtom } from 'jotai'

import { addToastAtom } from 'atoms/toast'

export default function useToast() {
  const addToast = useSetAtom(addToastAtom)

  return { addToast }
}
