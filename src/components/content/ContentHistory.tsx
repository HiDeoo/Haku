import Link from 'next/link'
import { RiArrowRightSLine } from 'react-icons/ri'

import Flex from 'components/ui/Flex'
import Icon from 'components/ui/Icon'
import Shimmer from 'components/ui/Shimmer'
import { ContentType } from 'constants/contentType'
import { HISTORY_RESULT_LIMIT_PER_TYPE } from 'constants/history'
import { HISTORY_SHIMMER_CLASSES } from 'constants/shimmer'
import useContentHistoryQuery from 'hooks/useContentHistoryQuery'
import { getContentType } from 'hooks/useContentType'
import { isNonEmptyArray } from 'libs/array'
import { HistoryData } from 'libs/db/history'
import clst from 'styles/clst'

const ContentHistory: React.FC<ContentHistoryProps> = ({ focusedType }) => {
  const { data, isLoading } = useContentHistoryQuery()

  const isNoteFocusedType = focusedType === ContentType.NOTE
  const alternateType = isNoteFocusedType ? ContentType.TODO : ContentType.NOTE

  if (!isLoading && !isNonEmptyArray(data?.notes) && !isNonEmptyArray(data?.todos)) {
    return null
  }

  return (
    <Flex direction="col" alignItems="center" className="gap-6 p-6 xs:gap-12 xs:pt-12 xs:pb-8">
      <ContentHistorySection
        type={focusedType}
        isLoading={isLoading}
        entries={(isNoteFocusedType ? data?.notes : data?.todos) ?? []}
      />
      <ContentHistorySection
        type={alternateType}
        isLoading={isLoading}
        entries={(isNoteFocusedType ? data?.todos : data?.notes) ?? []}
      />
    </Flex>
  )
}

export default ContentHistory

const ContentHistorySection: React.FC<ContentHistorySectionProps> = ({ entries, isLoading, type }) => {
  if (!isLoading && !isNonEmptyArray(entries)) {
    return null
  }

  const { cType, urlPath } = getContentType(type)

  const entryClasses = clst(
    'flex items-center gap-3 px-3 py-3 bg-zinc-700/40',
    'border border-zinc-900 border-b-0 last:border-b first:rounded-t-lg last:rounded-b-lg',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset'
  )
  const shimmerClasses = clst(entryClasses, 'min-h-[2.8125rem] block')
  const linkClasses = clst(entryClasses, 'hover:bg-blue-600 hover:text-blue-50')

  return (
    <div className="w-full md:w-96">
      <h1 className="mb-1.5 ml-0.5 text-lg">Recent {cType}s</h1>
      <div>
        {isLoading
          ? Array.from({ length: HISTORY_RESULT_LIMIT_PER_TYPE }).map((_, index) => (
              <Shimmer key={`shimmer-${index}`} className={shimmerClasses}>
                <Shimmer.Line className={HISTORY_SHIMMER_CLASSES[index]} />
              </Shimmer>
            ))
          : entries.map((entry) => (
              <Link key={entry.id} href={`${urlPath}/${entry.id}/${entry.slug}`} prefetch={false}>
                <a className={linkClasses}>
                  <span className="grow truncate">{entry.name}</span>
                  <Icon icon={RiArrowRightSLine} className="block shrink-0 opacity-75" aria-hidden />
                </a>
              </Link>
            ))}
      </div>
    </div>
  )
}

interface ContentHistoryProps {
  focusedType: ContentType
}

interface ContentHistorySectionProps {
  entries: HistoryData['notes'] | HistoryData['todos']
  isLoading: boolean
  type: ContentType
}
