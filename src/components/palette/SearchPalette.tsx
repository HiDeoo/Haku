import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { RiBookletLine, RiTodoLine } from 'react-icons/ri'

import { type PaletteProps } from 'components/palette/Palette'
import { ContentType } from 'constants/contentType'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import useSearch from 'hooks/useSearch'
import { type SearchResultData } from 'libs/db/file'

const Palette = dynamic<PaletteProps<SearchResultData>>(import('components/palette/Palette'))

const SearchPalette: React.FC = () => {
  const [opened, setOpened] = useState(false)
  const [query, setQuery] = useState<string | undefined>('')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSearch(opened, query)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Miscellaneous',
          keybinding: 'Meta+Shift+F',
          label: 'Search',
          onKeyDown: (event) => {
            event.preventDefault()

            setOpened(true)
          },
        },
      ],
      []
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

  function onPick(item: SearchResultData | null | undefined) {
    console.log('item ', item)
  }

  return (
    <Palette
      opened={opened}
      onPick={onPick}
      initialQuery={query}
      placeholder="Search"
      isLoading={isLoading}
      itemToIcon={itemToIcon}
      onOpenChange={setOpened}
      onQueryChange={setQuery}
      loadMore={fetchNextPage}
      itemToString={itemToString}
      items={data?.pages.flat() ?? []}
      infinite={hasNextPage && !isFetchingNextPage}
    />
  )
}

export default SearchPalette
