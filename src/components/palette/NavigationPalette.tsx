import { useAtom, useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { RiBookletLine, RiTodoLine } from 'react-icons/ri'

import { fileHistoryAtom } from 'atoms/fileHistory'
import { navigationPaletteOpenedAtom } from 'atoms/togglable'
import Palette, { type PaletteItem } from 'components/palette/Palette'
import { ContentType, getContentType } from 'hooks/useContentType'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import { unshiftFromIndex } from 'libs/array'
import { type FilesData, type FileData } from 'libs/db/file'
import { trpc } from 'libs/trpc'

const NavigationPalette: React.FC = () => {
  const { push } = useRouter()

  const [opened, setOpened] = useAtom(navigationPaletteOpenedAtom)

  const { data, isLoading } = trpc.useQuery(['file.list'], { enabled: opened })

  const fileHistory = useAtomValue(fileHistoryAtom)

  const files: FilesData = useMemo(() => {
    if (!data) {
      return []
    }

    let orderedData = [...data]

    for (const [i, id] of [...fileHistory].reverse().entries()) {
      const index = orderedData.findIndex((file) => file.id === id)

      if (i !== fileHistory.length - 1) {
        orderedData = unshiftFromIndex(orderedData, index)
      }
    }

    return orderedData
  }, [data, fileHistory])

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

  function handlePick(item: FileData | null | undefined) {
    if (!item) {
      return
    }

    const { urlPath } = getContentType(item.type)

    push(`${urlPath}/${item.id}/${item.slug}`)
  }

  return (
    <Palette<Navigation>
      items={files}
      opened={opened}
      enterKeyHint="go"
      onPick={handlePick}
      isLoading={isLoading}
      itemToIcon={itemToIcon}
      onOpenChange={setOpened}
      title="Navigation Palette"
      itemToString={itemToString}
      placeholder="Search notes & todos by name"
    />
  )
}

export default NavigationPalette

function itemToString(item: FileData | null) {
  return item?.name ?? ''
}

function itemToIcon(item: FileData | null) {
  if (!item) {
    return null
  }

  return item.type === ContentType.NOTE ? RiBookletLine : RiTodoLine
}

type Navigation = FileData & PaletteItem
