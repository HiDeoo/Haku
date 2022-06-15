import { useAtomValue } from 'jotai'
import Link from 'next/link'
import { RiArrowRightSLine } from 'react-icons/ri'

import { sidebarCollapsedAtom } from 'atoms/collapsible'
import Icon from 'components/ui/Icon'
import List from 'components/ui/List'
import { ContentType } from 'constants/contentType'
import { LIST_SHIMMER_CLASSES } from 'constants/shimmer'
import { getContentType } from 'hooks/useContentType'
import { isEmpty } from 'libs/array'
import { HistoryData } from 'libs/db/history'
import { isNetworkError } from 'libs/trpc'
import { trpc } from 'libs/trpc'
import clst from 'styles/clst'

const ContentHistory: React.FC<ContentHistoryProps> = ({ focusedType }) => {
  const { data, isLoading } = trpc.useQuery(['history'], { useErrorBoundary: isNetworkError })

  const isNoteFocusedType = focusedType === ContentType.NOTE
  const alternateType = isNoteFocusedType ? ContentType.TODO : ContentType.NOTE

  if (!isLoading && isEmpty(data?.notes) && isEmpty(data?.todos)) {
    return null
  }

  return (
    <>
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
    </>
  )
}

export default ContentHistory

const ContentHistorySection: React.FC<ContentHistorySectionProps> = ({ entries, isLoading, type }) => {
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)

  if (!isLoading && isEmpty(entries)) {
    return null
  }

  const { cType, urlPath } = getContentType(type)

  const iconClasses = clst('block shrink-0 opacity-75', !sidebarCollapsed && 'hidden xs:block')

  return (
    <div className="w-full md:w-96">
      <List isLoading={isLoading} title={`Recent ${cType}s`} shimmerClassNames={LIST_SHIMMER_CLASSES}>
        {entries.map((entry) => (
          <List.Item key={entry.id}>
            {(itemProps) => {
              const { className, ...props } = itemProps
              const linkCkasses = clst(className, 'hover:bg-blue-600 hover:text-zinc-100')

              return (
                <Link href={`${urlPath}/${entry.id}/${entry.slug}`} prefetch={false}>
                  <a {...props} className={linkCkasses}>
                    <span className="grow truncate">{entry.name}</span>
                    <Icon icon={RiArrowRightSLine} className={iconClasses} aria-hidden />
                  </a>
                </Link>
              )
            }}
          </List.Item>
        ))}
      </List>
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
