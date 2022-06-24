export enum ContentType {
  NOTE = 'NOTE',
  TODO = 'TODO',
}

enum SearchableType {
  INBOX = 'INBOX',
}

export type SearchableContentType = ContentType | SearchableType
export const SearchableContentType = { ...ContentType, ...SearchableType }
