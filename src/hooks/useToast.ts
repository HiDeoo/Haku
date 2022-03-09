import { useUpdateAtom } from 'jotai/utils'

import { addToastAtom } from 'atoms/toast'

export default function useToast() {
  const addToast = useUpdateAtom(addToastAtom)

  return { addToast }
}
