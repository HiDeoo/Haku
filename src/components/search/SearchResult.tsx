import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { RiBookletLine, RiInboxFill, RiTodoLine } from 'react-icons/ri'

import { inboxDrawerOpenedAtom, searchDrawerAtom } from 'atoms/togglable'
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

const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  const { push } = useRouter()

  const setSearchDrawer = useSetAtom(searchDrawerAtom)
  const setInboxDrawerOpened = useSetAtom(inboxDrawerOpenedAtom)

  function handleClick() {
    openResult()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      openResult()
    }
  }

  function openResult() {
    setSearchDrawer((prevDrawer) => ({ ...prevDrawer, opened: false }))

    if (result.type === 'INBOX') {
      setInboxDrawerOpened(true)
    } else {
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
        const { className, ...props } = itemProps
        const linkCkasses = clst(className, 'group flex flex-col px-3 py-2 items-start gap-1')

        return (
          <div
            {...props}
            tabIndex={0}
            role="button"
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
}

export default SearchResult

interface SearchResultProps {
  result: SearchResultData
}
