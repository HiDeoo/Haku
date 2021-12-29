import { useRouter } from 'next/router'

export default function useContentType(): ContentType | undefined {
  const { route } = useRouter()

  if (route.startsWith('/notes')) {
    return ContentType.NOTE
  } else if (route.startsWith('/todos')) {
    return ContentType.TODO
  }

  return
}

export enum ContentType {
  NOTE = 'NOTE',
  TODO = 'TODO',
}
