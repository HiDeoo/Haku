import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { forwardRef } from 'react'
import { RiBookletLine, RiInboxFill, RiTodoLine } from 'react-icons/ri'

import { setInboxDrawerOpenedAtom, setSearchDrawerOpenedAtom } from 'atoms/togglable'
import Drawer from 'components/ui/Drawer'
import Icon from 'components/ui/Icon'
import { ContentType, getContentType } from 'hooks/useContentType'
import { type SearchResultData } from 'libs/db/file'
import { capitalize } from 'libs/string'
import clst from 'styles/clst'

const excerptClasses = clst(
  'w-full truncate text-sm italic text-zinc-400 group-hover:text-zinc-200',
  '[&>strong]:text-blue-400 [&>strong]:font-semibold group-hover:[&>strong]:text-blue-200'
)

const SearchResult = forwardRef<HTMLDivElement, SearchResultProps>(({ result, ...props }, forwardedRef) => {
  const { push } = useRouter()

  const setSearchDrawerOpened = useSetAtom(setSearchDrawerOpenedAtom)
  const setInboxDrawerOpened = useSetAtom(setInboxDrawerOpenedAtom)

  function handleClick() {
    openResult()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()

      openResult()
    } else {
      props.onKeyDown?.(event)
    }
  }

  function openResult() {
    if (result.type === 'INBOX') {
      setInboxDrawerOpened(true)
    } else {
      setSearchDrawerOpened(false)

      const { urlPath } = getContentType(result.type)

      push(`${urlPath}/${result.id}/${result.slug}`)
    }
  }

  const name = result.type === 'INBOX' ? 'Inbox' : result.name
  const icon = result.type === 'INBOX' ? RiInboxFill : result.type === ContentType.NOTE ? RiBookletLine : RiTodoLine
  const iconLabel = capitalize(result.type)

  return (
    <Drawer.List.Item className="p-0 hover:bg-blue-600 hover:text-zinc-100">
      {(itemProps) => {
        const { className, ...linkProps } = itemProps
        const linkCkasses = clst(className, 'group flex flex-col px-3 py-2 items-start gap-1')

        return (
          <div
            {...props}
            role="button"
            {...linkProps}
            ref={forwardedRef}
            onClick={handleClick}
            className={linkCkasses}
            onKeyDown={handleKeyDown}
          >
            <div className="flex w-full items-center gap-1.5">
              <Icon icon={icon} label={iconLabel} className="shrink-0 opacity-70" />
              <div className="truncate">{name}</div>
            </div>
            {result.excerpt && (
              <div dangerouslySetInnerHTML={{ __html: result.excerpt }} className={excerptClasses}></div>
            )}
          </div>
        )
      }}
    </Drawer.List.Item>
  )
})

SearchResult.displayName = 'SearchResult'

export default SearchResult

interface SearchResultProps {
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
  result: SearchResultData
}
