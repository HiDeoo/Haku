export enum ContentType {
  NOTE = 'NOTE',
  TODO = 'TODO',
}

enum SearchableType {
  INBOX = 'INBOX',
}

export type SearchableContentType = ContentType | SearchableType
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentionally redeclaring to mimic an enum.
export const SearchableContentType = { ...ContentType, ...SearchableType }
