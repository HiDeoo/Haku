import { useRouter } from 'next/router'

export default function useContentId() {
  const { isReady, query } = useRouter()

  return { contentId: query.id && typeof query.id === 'string' ? query.id : undefined, isReady }
}
