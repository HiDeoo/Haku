import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { RiMenu2Line } from 'react-icons/ri'

import { noteInspectorCollapsedAtom, sidebarCollapsedAtom, toggleSidebarCollapsedAtom } from 'atoms/collapsible'
import ContentTree from 'components/content/ContentTree'
import CommandPalette from 'components/palette/CommandPalette'
import NavigationPalette from 'components/palette/NavigationPalette'
import Flex from 'components/ui/Flex'
import FloatingButton from 'components/ui/FloatingButton'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import clst from 'styles/clst'

const SidebarMenu = dynamic(import('components/ui/SidebarMenu'))

const Sidebar: React.FC = () => {
  const router = useRouter()
  const isOnNotePage = router.pathname.startsWith('/notes/')

  const collapsed = useAtomValue(sidebarCollapsedAtom)
  const toggleCollapsed = useUpdateAtom(toggleSidebarCollapsedAtom)

  const noteInspectorCollapsed = useAtomValue(noteInspectorCollapsedAtom)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Miscellaneous',
          keybinding: 'Meta+J',
          label: `Collapse / Expand Menu`,
          onKeyDown: (event) => {
            event.preventDefault()

            toggleCollapsed()
          },
        },
      ],
      [toggleCollapsed]
    )
  )

  const sidebarClasses = clst(
    'bg-zinc-900 pwa:input-hover:border-t pwa:input-hover:border-zinc-700',
    'motion-safe:transition-[width] motion-safe:duration-150 motion-safe:ease-in-out',
    collapsed ? 'w-0 opacity-0 md:opacity-100 overflow-hidden md:w-12 md:flex' : 'w-[17rem]'
  )

  return (
    <>
      <NavigationPalette />
      <CommandPalette />
      <Flex direction="col" className={sidebarClasses}>
        <ContentTree />
        <SidebarMenu />
      </Flex>
      <FloatingButton
        icon={RiMenu2Line}
        className="left-2"
        tooltip="Expand Menu"
        onPress={toggleCollapsed}
        visible={(!isOnNotePage && collapsed) || (isOnNotePage && collapsed && noteInspectorCollapsed)}
      />
    </>
  )
}

export default Sidebar
