import { atomWithStorage } from 'jotai/vanilla/utils'

import { ContentType } from 'constants/contentType'

export const contentTypeAtom = atomWithStorage<ContentType>('haku.contentType', ContentType.NOTE)
