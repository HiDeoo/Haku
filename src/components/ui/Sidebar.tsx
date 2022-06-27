import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { RiMenu2Line } from 'react-icons/ri'

import { noteInspectorCollapsedAtom, sidebarCollapsedAtom, toggleSidebarCollapsedAtom } from 'atoms/collapsible'
import { ContentTree } from 'components/content/ContentTree'
import { CommandPalette } from 'components/palette/CommandPalette'
import { NavigationPalette } from 'components/palette/NavigationPalette'
import Flex from 'components/ui/Flex'
import { FloatingButton } from 'components/ui/FloatingButton'
import { SidebarMenu } from 'components/ui/SidebarMenu'
import { useGlobalShortcuts } from 'hooks/useGlobalShortcuts'
import { clst } from 'styles/clst'

const skipLinksClasses = clst(
  'absolute -top-full left-0 z-[70] rounded-br-lg bg-blue-600 px-3.5 py-2.5 outline-none hover:underline',
  'focus:top-0 focus:border-r-2 focus:border-b-2 focus:border-blue-300'
)

export const Sidebar: React.FC<SidebarProps> = () => {
  const { pathname } = useRouter()
  const isOnNotePage = pathname.startsWith('/notes/')

  const collapsed = useAtomValue(sidebarCollapsedAtom)
  const toggleCollapsed = useSetAtom(toggleSidebarCollapsedAtom)

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
    collapsed
      ? [
          'w-0 md:w-12 md:supports-max:w-[calc(theme(spacing.12)+max(0px,env(safe-area-inset-left)))]',
          'opacity-0 md:opacity-100 overflow-hidden md:flex',
        ]
      : 'w-[17rem] supports-max:w-[calc(17rem+max(0px,env(safe-area-inset-left)))]'
  )

  return (
    <>
      <NavigationPalette />
      <CommandPalette />
      <a className={skipLinksClasses} href="#main">
        Skip to content
      </a>
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

export type SidebarProps = Record<string, never>
