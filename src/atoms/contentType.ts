import { atomWithStorage } from 'jotai/utils'

export enum ContentType {
  NOTE = 'NOTE',
  TODO = 'TODO',
}

export const contentTypeAtom = atomWithStorage<ContentType>('haku.contentType', ContentType.NOTE)
