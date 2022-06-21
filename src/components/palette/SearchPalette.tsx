import { useAtom, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useMemo, useRef, useState } from 'react'
import { RiBookletLine, RiInboxFill, RiSearchLine, RiTodoLine } from 'react-icons/ri'

import { searchPaletteOpenedAtom } from 'atoms/togglable'
import { inboxDrawerOpenedAtom } from 'atoms/togglable'
import IconButton from 'components/form/IconButton'
import Palette, { type PaletteItem } from 'components/palette/Palette'
import { ContentType } from 'constants/contentType'
import { SEARCH_QUERY_MIN_LENGTH } from 'constants/search'
import { getContentType } from 'hooks/useContentType'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import useSearchQuery from 'hooks/useSearchQuery'
import { type SearchResultData } from 'libs/db/file'

const SearchPalette: React.FC = () => {
  const { push } = useRouter()

  const paletteTextInput = useRef<HTMLInputElement>(null)

  const [opened, setOpened] = useAtom(searchPaletteOpenedAtom)
  const [query, setQuery] = useState<string | undefined>('')
  const debouncedQuery = useDebouncedValue(query, 300)

  const { data, fetchNextPage, fetchStatus, hasNextPage, isFetchingNextPage } = useSearchQuery(opened, debouncedQuery)

  const setInboxDrawerOpened = useSetAtom(inboxDrawerOpenedAtom)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Miscellaneous',
          keybinding: 'Meta+Shift+F',
          label: 'Search in Notes and Todos',
          onKeyDown: (event) => {
            event.preventDefault()

            setOpened(true)

            if (paletteTextInput.current && query && query.length > 0) {
              paletteTextInput.current.select()
            }
          },
        },
      ],
      [setOpened, query]
    )
  )

  function handleTriggerPress() {
    setOpened(true)
  }

  function handleOpenChange(opened: boolean) {
    setOpened(opened)
  }

  function handlePick(item: SearchResultData | null | undefined) {
    if (!item) {
      return
    }

    if (item.type === 'INBOX') {
      setInboxDrawerOpened(true)
    } else {
      const { urlPath } = getContentType(item.type)

      push(`${urlPath}/${item.id}/${item.slug}`)
    }
  }

  return (
    <>
      <IconButton icon={RiSearchLine} tooltip="Search" onPress={handleTriggerPress} />
      <Palette<SearchResult>
        role="search"
        fuzzy={false}
        opened={opened}
        enterKeyHint="go"
        onPick={handlePick}
        initialQuery={query}
        title="Search Palette"
        itemToIcon={itemToIcon}
        onQueryChange={setQuery}
        loadMore={fetchNextPage}
        itemToString={itemToString}
        onOpenChange={handleOpenChange}
        forwardedRef={paletteTextInput}
        items={data?.pages.flat() ?? []}
        isLoadingMore={isFetchingNextPage}
        isLoading={fetchStatus === 'fetching'}
        minQueryLength={SEARCH_QUERY_MIN_LENGTH}
        itemDetailsToString={itemDetailsToString}
        infinite={hasNextPage && !isFetchingNextPage}
        placeholder={`Search (min. ${SEARCH_QUERY_MIN_LENGTH} characters)`}
      />
    </>
  )
}

export default SearchPalette

function itemToString(item: SearchResultData | null) {
  return (item?.type === 'INBOX' ? 'Inbox' : item?.name) ?? ''
}

function itemToIcon(item: SearchResultData | null) {
  if (!item) {
    return null
  }

  return item.type === 'INBOX' ? RiInboxFill : item.type === ContentType.NOTE ? RiBookletLine : RiTodoLine
}

function itemDetailsToString(item: SearchResultData | null) {
  return item?.excerpt ?? ''
}

type SearchResult = SearchResultData & PaletteItem
