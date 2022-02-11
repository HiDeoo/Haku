import dynamic from 'next/dynamic'
import { useState } from 'react'
import { RiBookletLine, RiTodoLine } from 'react-icons/ri'

import { type PaletteProps } from 'components/Palette'
import useFiles from 'hooks/useFiles'
import { type FileData } from 'libs/db/file'
import { ContentType } from 'atoms/contentType'

const Palette = dynamic<PaletteProps<FileData>>(import('components/Palette'))

const NavigationPalette: React.FC = () => {
  const [opened, setOpened] = useState(true)

  const { data, isLoading } = useFiles(opened)

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
    console.log('item ', item)
  }

  return (
    <div>
      <button onClick={() => setOpened(true)}>Test</button>

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
    </div>
  )
}

export default NavigationPalette
