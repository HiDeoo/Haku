import { type StoreSlice } from 'stores'

export enum ContentType {
  NOTE = 'NOTE',
  TODO = 'TODO',
}

export const createContentTypeSlice: StoreSlice<ContentTypeState> = (set) => ({
  contentType: ContentType.NOTE,
  setContentType: (contentType: ContentType) => {
    return set(() => ({ contentType }))
  },
})

export interface ContentTypeState {
  contentType: ContentType
  setContentType: (contentType: ContentType) => void
}
