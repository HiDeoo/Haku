import { useAtomValue, useSetAtom } from 'jotai/react'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useRef } from 'react'
import { RiSearchLine } from 'react-icons/ri'

import { searchDrawerAtom, setSearchDrawerOpenedAtom } from 'atoms/togglable'
import { IconButton } from 'components/form/IconButton'
import { type SearchProps } from 'components/search/Search'
import { Drawer } from 'components/ui/Drawer'
import { useGlobalShortcuts } from 'hooks/useGlobalShortcuts'

const Search = dynamic<SearchProps>(import('components/search/Search').then((module) => module.Search))

export const SearchDrawer = () => {
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

            requestAnimationFrame(() => {
              queryInput.current?.select()
            })
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
