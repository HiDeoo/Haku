import { useAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useCallback } from 'react'
import { RiSearchLine } from 'react-icons/ri'

import { searchDrawerAtom } from 'atoms/togglable'
import IconButton from 'components/form/IconButton'
import Drawer from 'components/ui/Drawer'

const Search = dynamic(import('components/search/Search'))

const SearchDrawer: React.FC = () => {
  const [{ opened }, setDrawer] = useAtom(searchDrawerAtom)

  // TODO(HiDeoo) Shortcut
  // TODO(HiDeoo) Shortcut - if already opened, focus the search input

  const handleOpenChange = useCallback(() => {
    setDrawer((prevDrawer) => ({ ...prevDrawer, opened: !prevDrawer.opened }))
  }, [setDrawer])

  return (
    <Drawer
      title="Search"
      opened={opened}
      onOpenChange={handleOpenChange}
      className="flex flex-col overflow-hidden"
      trigger={<IconButton icon={RiSearchLine} tooltip="Search" />}
    >
      <Search />
    </Drawer>
  )
}

export default SearchDrawer
