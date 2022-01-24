import { useRouter } from 'next/router'

export default function useContentId() {
  const { query } = useRouter()

  return query.id && typeof query.id === 'string' ? query.id : undefined
}
