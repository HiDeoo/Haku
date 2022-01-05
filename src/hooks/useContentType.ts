import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { capitalize } from 'libs/string'

export default function useContentType(): UseContentTypeReturnValue {
  const { route } = useRouter()

  return useMemo(() => {
    const contentType: UseContentTypeReturnValue = { cType: '', lcType: '', type: undefined, urlPath: '' }

    if (route.startsWith('/notes')) {
      contentType.type = ContentType.NOTE
    } else if (route.startsWith('/todos')) {
      contentType.type = ContentType.TODO
    }

    if (contentType.type) {
      contentType.cType = capitalize(contentType.type)
      contentType.lcType = contentType.type.toLowerCase()
      contentType.urlPath = `/${contentType.lcType}s`
    }

    return contentType
  }, [route])
}

export enum ContentType {
  NOTE = 'NOTE',
  TODO = 'TODO',
}

export interface UseContentTypeReturnValue {
  // The capitalized version of the content type.
  cType: string
  // The lowercase version of the content type.
  lcType: string
  type: ContentType | undefined
  urlPath: string
}
