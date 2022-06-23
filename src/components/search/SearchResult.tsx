import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

import { inboxDrawerOpenedAtom, searchDrawerAtom } from 'atoms/togglable'
import Drawer from 'components/ui/Drawer'
import { getContentType } from 'hooks/useContentType'
import { type SearchResultData } from 'libs/db/file'
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
            <div className="w-full truncate">{result.type === 'INBOX' ? 'Inbox' : result.name}</div>
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
