import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { RiBookletLine, RiTodoLine } from 'react-icons/ri'

import { ContentType } from 'atoms/contentType'
import { type PaletteProps } from 'components/Palette'
import { getContentType } from 'hooks/useContentType'
import useFiles from 'hooks/useFiles'
import useShortcuts from 'hooks/useShortcuts'
import { type FileData } from 'libs/db/file'

const Palette = dynamic<PaletteProps<FileData>>(import('components/Palette'))

const NavigationPalette: React.FC = () => {
  const { push } = useRouter()

  const [opened, setOpened] = useState(false)

  const { data, isLoading } = useFiles(opened)

  useShortcuts(
    useMemo(
      () => [
        {
          keybinding: 'Meta+P',
          label: 'Go to File…',
          onKeyDown: (event) => {
            event.preventDefault()

            setOpened(true)
          },
        },
      ],
      []
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

    push(`${urlPath}/${item.id}`)
  }

  return (
    <Palette
      opened={opened}
      onPick={onPick}
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
