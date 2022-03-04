import { useAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo, useRef, useState } from 'react'
import { RiBookletLine, RiSearchLine, RiTodoLine } from 'react-icons/ri'

import { searchPaletteOpenedAtom } from 'atoms/palette'
import IconButton from 'components/form/IconButton'
import { type PaletteProps } from 'components/palette/Palette'
import { ContentType } from 'constants/contentType'
import { SEARCH_QUERY_MIN_LENGTH } from 'constants/search'
import { getContentType } from 'hooks/useContentType'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import useSearchQuery from 'hooks/useSearchQuery'
import { type SearchResultData } from 'libs/db/file'

const Palette = dynamic<PaletteProps<SearchResultData>>(import('components/palette/Palette'))

const SearchPalette: React.FC = () => {
  const { push } = useRouter()

  const trigger = useRef<HTMLButtonElement | null>(null)
  const paletteTextInput = useRef<HTMLInputElement | null>(null)

  const triggerUsed = useRef(false)

  const [opened, setOpened] = useAtom(searchPaletteOpenedAtom)
  const [query, setQuery] = useState<string | undefined>('')
  const debouncedQuery = useDebouncedValue(query, 300)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSearchQuery(opened, debouncedQuery)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Miscellaneous',
          keybinding: 'Meta+Shift+F',
          label: 'Search in Notes and Todos',
          onKeyDown: (event) => {
            event.preventDefault()

            triggerUsed.current = false

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

  function onPressTrigger() {
    triggerUsed.current = true

    setOpened(true)
  }

  function onOpenChange(opened: boolean) {
    setOpened(opened)

    if (!opened && triggerUsed.current) {
      requestAnimationFrame(() => {
        trigger.current?.focus()
      })
    }
  }

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

    push(`${urlPath}/${item.id}/${item.slug}`)
  }

  return (
    <>
      <IconButton icon={RiSearchLine} tooltip="Search" onPress={onPressTrigger} ref={trigger} />
      <Palette
        fuzzy={false}
        opened={opened}
        onPick={onPick}
        initialQuery={query}
        isLoading={isLoading}
        itemToIcon={itemToIcon}
        onQueryChange={setQuery}
        loadMore={fetchNextPage}
        onOpenChange={onOpenChange}
        itemToString={itemToString}
        items={data?.pages.flat() ?? []}
        forwardedRef={paletteTextInput}
        isLoadingMore={isFetchingNextPage}
        minQueryLength={SEARCH_QUERY_MIN_LENGTH}
        itemDetailsToString={itemDetailsToString}
        infinite={hasNextPage && !isFetchingNextPage}
        placeholder={`Search (min. ${SEARCH_QUERY_MIN_LENGTH} characters)`}
      />
    </>
  )
}

export default SearchPalette
