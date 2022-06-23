import { useAtomValue, useSetAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useRef } from 'react'
import { RiSearchLine } from 'react-icons/ri'

import { searchDrawerAtom, setSearchDrawerOpenedAtom } from 'atoms/togglable'
import IconButton from 'components/form/IconButton'
import Drawer from 'components/ui/Drawer'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'

const Search = dynamic(import('components/search/Search'))

const SearchDrawer: React.FC = () => {
  const queryInput = useRef<HTMLInputElement>(null)

  const { opened } = useAtomValue(searchDrawerAtom)
  const setDrawerOpened = useSetAtom(setSearchDrawerOpenedAtom)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Miscellaneous',
          keybinding: 'Meta+Shift+F',
          label: 'Search in Notes and Todos',
          onKeyDown: (event) => {
            event.preventDefault()

            setDrawerOpened(true)

            queryInput.current?.focus()
          },
        },
      ],
      [setDrawerOpened]
    )
  )

  const handleOpenChange = useCallback(() => {
    setDrawerOpened(!opened)
  }, [opened, setDrawerOpened])

  return (
    <Drawer
      title="Search"
      opened={opened}
      onOpenChange={handleOpenChange}
      className="flex flex-col overflow-hidden"
      trigger={<IconButton icon={RiSearchLine} tooltip="Search" />}
    >
      <Search queryInputRef={queryInput} />
    </Drawer>
  )
}

export default SearchDrawer
