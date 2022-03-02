import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo, useRef, useState } from 'react'
import { RiBookletLine, RiTodoLine } from 'react-icons/ri'

import { type PaletteProps } from 'components/palette/Palette'
import { ContentType } from 'constants/contentType'
import { SEARCH_QUERY_MIN_LENGTH } from 'constants/search'
import { getContentType } from 'hooks/useContentType'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import useSearch from 'hooks/useSearch'
import { type SearchResultData } from 'libs/db/file'

const Palette = dynamic<PaletteProps<SearchResultData>>(import('components/palette/Palette'))

const SearchPalette: React.FC = () => {
  const { push } = useRouter()

  const paletteTextInputRef = useRef<HTMLInputElement | null>(null)

  const [opened, setOpened] = useState(false)
  const [query, setQuery] = useState<string | undefined>('')
  const debouncedQuery = useDebouncedValue(query, 300)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSearch(opened, debouncedQuery)

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

            if (paletteTextInputRef.current && query && query.length > 0) {
              paletteTextInputRef.current.select()
            }
          },
        },
      ],
      [query]
    )
  )

  function itemToString(item: SearchResultData | null) {
    return item?.name ?? ''
  }

  function itemToIcon(item: SearchResultData | null) {
    if (!item) {
      return null
    }

    return item.type === ContentType.NOTE ? RiBookletLine : RiTodoLine
  }

  function itemDetailsToString(item: SearchResultData | null) {
    return item?.excerpt ?? ''
  }

  function onPick(item: SearchResultData | null | undefined) {
    if (!item) {
      return
    }

    const { urlPath } = getContentType(item.type)

    push(`${urlPath}/${item.id}`)
  }

  return (
    <Palette
      fuzzy={false}
      opened={opened}
      onPick={onPick}
      initialQuery={query}
      isLoading={isLoading}
      itemToIcon={itemToIcon}
      onOpenChange={setOpened}
      onQueryChange={setQuery}
      loadMore={fetchNextPage}
      itemToString={itemToString}
      items={data?.pages.flat() ?? []}
      forwardedRef={paletteTextInputRef}
      isLoadingMore={isFetchingNextPage}
      minQueryLength={SEARCH_QUERY_MIN_LENGTH}
      itemDetailsToString={itemDetailsToString}
      infinite={hasNextPage && !isFetchingNextPage}
      placeholder={`Search (min. ${SEARCH_QUERY_MIN_LENGTH} characters)`}
    />
  )
}

export default SearchPalette
