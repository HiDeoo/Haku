import { useRouter } from 'next/router'

export function useContentId() {
  const { isReady, query } = useRouter()

  return { contentId: query.id && typeof query.id === 'string' ? query.id : undefined, isReady }
}
