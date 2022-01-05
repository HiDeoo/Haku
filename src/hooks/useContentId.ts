import { useRouter } from 'next/router'

export default function useContentId() {
  const { query } = useRouter()

  return query.id && typeof query.id === 'string' ? parseInt(query.id, 10) : undefined
}
