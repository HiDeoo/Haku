import { atomWithStorage } from 'jotai/utils'

import { ContentType } from 'constants/contentType'

export const contentTypeAtom = atomWithStorage<ContentType>('haku.contentType', ContentType.NOTE)
