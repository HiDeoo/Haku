import { useSetAtom } from 'jotai/react'
import { useRouter } from 'next/router'
import { forwardRef } from 'react'
import IconBookletLine from '~icons/ri/booklet-line'
import IconInboxFill from '~icons/ri/inbox-fill'
import IconTodoLine from '~icons/ri/todo-line'

import { setInboxDrawerOpenedAtom, setSearchDrawerOpenedAtom } from 'atoms/togglable'
import { Drawer } from 'components/ui/Drawer'
import { Icon } from 'components/ui/Icon'
import { SearchableContentType } from 'constants/contentType'
import { getContentType } from 'hooks/useContentType'
import { type SearchResultData } from 'libs/db/file'
import { capitalize } from 'libs/string'
import { clst } from 'styles/clst'

const excerptClasses = clst(
  'w-full truncate text-sm italic text-zinc-400 group-hover:text-zinc-200',
  '[&>strong]:text-blue-400 [&>strong]:font-semibold group-hover:[&>strong]:text-blue-200'
)

export const SearchResult = forwardRef<HTMLDivElement, SearchResultProps>(({ result, ...props }, forwardedRef) => {
  const { push } = useRouter()

  const setSearchDrawerOpened = useSetAtom(setSearchDrawerOpenedAtom)
  const setInboxDrawerOpened = useSetAtom(setInboxDrawerOpenedAtom)

  const isInboxSearchResult = result.type === SearchableContentType.INBOX

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
    if (isInboxSearchResult) {
      setInboxDrawerOpened(true)
    } else {
      setSearchDrawerOpened(false)

      const { urlPath } = getContentType(result.type)

      push(`${urlPath}/${result.id}/${result.slug}`)
    }
  }

  const name = isInboxSearchResult ? 'Inbox' : result.name
  const icon = isInboxSearchResult
    ? IconInboxFill
    : result.type === SearchableContentType.NOTE
    ? IconBookletLine
    : IconTodoLine
  const iconLabel = capitalize(result.type)

  return (
    <Drawer.List.Item className="p-0 hover:bg-blue-600 hover:text-zinc-100">
      {(itemProps) => {
        const { className, ...linkProps } = itemProps
        const linkCkasses = clst(className, 'group flex flex-col px-3 py-2 items-start gap-1')

        return (
          <div
            {...props}
            tabIndex={0}
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

interface SearchResultProps {
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>
  result: SearchResultData
}
