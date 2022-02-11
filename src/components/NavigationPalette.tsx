import dynamic from 'next/dynamic'
import { useState } from 'react'

import { type PaletteProps } from 'components/Palette'
import useFiles from 'hooks/useFiles'
import { type FileData } from 'libs/db/file'

const Palette = dynamic<PaletteProps<FileData>>(import('components/Palette'))

const NavigationPalette: React.FC = () => {
  const [opened, setOpened] = useState(false)

  const { data, isLoading } = useFiles(opened)

  function itemToString(item: FileData | null): string {
    return item?.name ?? ''
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
        onOpenChange={setOpened}
        itemToString={itemToString}
        placeholder="Search notes & todos by name"
      />
    </div>
  )
}

export default NavigationPalette
