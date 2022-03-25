import { useAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { RiBookletLine, RiTodoLine } from 'react-icons/ri'

import { navigationPaletteOpenedAtom } from 'atoms/palette'
import { type PaletteItem, type PaletteProps } from 'components/palette/Palette'
import { ContentType, getContentType } from 'hooks/useContentType'
import useFilesQuery from 'hooks/useFilesQuery'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import { type FileData } from 'libs/db/file'

const Palette = dynamic<PaletteProps<Navigation>>(import('components/palette/Palette'))

const NavigationPalette: React.FC = () => {
  const { push } = useRouter()

  const [opened, setOpened] = useAtom(navigationPaletteOpenedAtom)

  const { data, isLoading } = useFilesQuery(opened)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Miscellaneous',
          keybinding: 'Meta+P',
          label: 'Go to Note or Todo',
          onKeyDown: (event) => {
            event.preventDefault()

            setOpened(true)
          },
        },
      ],
      [setOpened]
    )
  )

  function itemToString(item: FileData | null) {
    return item?.name ?? ''
  }

  function itemToIcon(item: FileData | null) {
    if (!item) {
      return null
    }

    return item.type === ContentType.NOTE ? RiBookletLine : RiTodoLine
  }

  function onPick(item: FileData | null | undefined) {
    if (!item) {
      return
    }

    const { urlPath } = getContentType(item.type)

    push(`${urlPath}/${item.id}/${item.slug}`)
  }

  return (
    <Palette
      opened={opened}
      onPick={onPick}
      enterKeyHint="go"
      items={data ?? []}
      isLoading={isLoading}
      itemToIcon={itemToIcon}
      onOpenChange={setOpened}
      itemToString={itemToString}
      placeholder="Search notes & todos by name"
    />
  )
}

export default NavigationPalette

type Navigation = FileData & PaletteItem
