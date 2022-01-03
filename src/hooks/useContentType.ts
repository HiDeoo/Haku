import { useRouter } from 'next/router'

export default function useContentType(): UseContentTypeReturnValue {
  const { route } = useRouter()

  const contentType: UseContentTypeReturnValue = { hrType: undefined, type: undefined }

  if (route.startsWith('/notes')) {
    contentType.type = ContentType.NOTE
  } else if (route.startsWith('/todos')) {
    contentType.type = ContentType.TODO
  }

  if (contentType.type) {
    contentType.hrType = contentType.type.toLowerCase()
  }

  return contentType
}

export enum ContentType {
  NOTE = 'NOTE',
  TODO = 'TODO',
}

export interface UseContentTypeReturnValue {
  // The lowercase human readable version of the content type.
  hrType: string | undefined
  type: ContentType | undefined
}
