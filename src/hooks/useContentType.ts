import { useMemo } from 'react'

import { capitalize } from 'libs/string'
import { ContentType } from 'stores/contentType'
import { useStore, type StoreState } from 'stores'

export { ContentType } from 'stores/contentType'

const contentTypeStoreSelector = (state: StoreState) => state.contentType

export default function useContentType(): UseContentTypeReturnValue {
  const contentType = useStore(contentTypeStoreSelector)

  return useMemo(() => {
    const value: UseContentTypeReturnValue = { cType: '', lcType: '', type: undefined, urlPath: '' }

    if (contentType) {
      value.type = contentType
    }

    if (value.type) {
      value.cType = capitalize(value.type)
      value.lcType = value.type.toLowerCase()
      value.urlPath = `/${value.lcType}s`
    }
    return value
  }, [contentType])
}

export interface UseContentTypeReturnValue {
  // The capitalized version of the content type.
  cType: string
  // The lowercase version of the content type.
  lcType: string
  type: ContentType | undefined
  urlPath: string
}
