import { useAtom } from 'jotai'
import { useMemo } from 'react'

import { ContentType, contentTypeAtom } from 'atoms/contentType'
import { capitalize } from 'libs/string'

export { ContentType } from 'atoms/contentType'

export default function useContentType(): UseContentTypeReturnValue {
  const [contentType] = useAtom(contentTypeAtom)

  return useMemo(() => {
    return getContentType(contentType)
  }, [contentType])
}

export function getContentType(type: ContentType | undefined): UseContentTypeReturnValue {
  const value: UseContentTypeReturnValue = { cType: '', lcType: '', type: undefined, urlPath: '' }

  if (type) {
    value.type = type
  }

  if (value.type) {
    value.cType = capitalize(value.type)
    value.lcType = value.type.toLowerCase()
    value.urlPath = `/${value.lcType}s`
  }

  return value
}

export interface UseContentTypeReturnValue {
  // The capitalized version of the content type.
  cType: string
  // The lowercase version of the content type.
  lcType: string
  type: ContentType | undefined
  urlPath: string
}
