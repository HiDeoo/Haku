import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import {
  RiBookletLine,
  RiFileAddLine,
  RiFolderAddLine,
  RiKeyboardFill,
  RiLink,
  RiLogoutCircleRLine,
  RiMenu2Line,
  RiSearchLine,
  RiTodoLine,
} from 'react-icons/ri'

import { toggleSidebarCollapsedAtom } from 'atoms/collapsible'
import { setContentModalOpenedAtom, setFolderModalOpenedAtom, setShortcutModalOpenedAtom } from 'atoms/modal'
import { commandPaletteOpenedAtom, navigationPaletteOpenedAtom, searchPaletteOpenedAtom } from 'atoms/palette'
import { type PaletteItem, type PaletteProps } from 'components/palette/Palette'
import { type IconProps } from 'components/ui/Icon'
import useContentType, { ContentType, getContentType } from 'hooks/useContentType'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { logout } from 'libs/auth'

const Palette = dynamic<PaletteProps<Command>>(import('components/palette/Palette'))

const CommandPalette: React.FC = () => {
  const { offline } = useNetworkStatus()

  const { push } = useRouter()

  const [opened, setOpened] = useAtom(commandPaletteOpenedAtom)

  const setNavigationPaletteOpened = useUpdateAtom(navigationPaletteOpenedAtom)
  const setSearchPaletteOpened = useUpdateAtom(searchPaletteOpenedAtom)

  const { cType, type } = useContentType()
  const isBrowsingNotes = type === ContentType.NOTE
  const altContentType = getContentType(isBrowsingNotes ? ContentType.TODO : ContentType.NOTE)
  const altIcon = isBrowsingNotes ? RiTodoLine : RiBookletLine

  const setContentModalOpened = useUpdateAtom(setContentModalOpenedAtom)
  const setFolderModalOpened = useUpdateAtom(setFolderModalOpenedAtom)
  const setShortcutModalOpened = useUpdateAtom(setShortcutModalOpenedAtom)

  const toggleSidebarCollapsed = useUpdateAtom(toggleSidebarCollapsedAtom)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Miscellaneous',
          keybinding: 'Meta+Shift+P',
          label: 'Show all Commands',
          onKeyDown: (event) => {
            event.preventDefault()

            setOpened(true)
          },
        },
      ],
      [setOpened]
    )
  )

  const commands = useMemo<Command[]>(
    () => [
      {
        name: `Create New ${cType}`,
        icon: RiFileAddLine,
        disabled: offline,
        action: () => {
          setContentModalOpened(true)
        },
      },
      {
        name: 'Create New Folder',
        icon: RiFolderAddLine,
        disabled: offline,
        action: () => {
          setFolderModalOpened(true)
        },
      },
      {
        name: 'Search in Notes and Todos',
        icon: RiSearchLine,
        action: () => {
          setSearchPaletteOpened(true)
        },
      },
      {
        name: 'Go to Note or Todo',
        icon: RiLink,
        action: () => {
          setNavigationPaletteOpened(true)
        },
      },
      {
        name: `Switch to ${altContentType.cType}s`,
        icon: altIcon,
        action: () => {
          push(altContentType.urlPath)
        },
      },
      {
        name: `Collapse / Expand Menu`,
        icon: RiMenu2Line,
        action: toggleSidebarCollapsed,
      },
      {
        name: 'Display Keyboard Shortcuts',
        icon: RiKeyboardFill,
        action: () => {
          setShortcutModalOpened(true)
        },
      },
      {
        name: 'Logout',
        icon: RiLogoutCircleRLine,
        disabled: offline,
        action: () => {
          logout()
        },
      },
    ],
    [
      altContentType,
      altIcon,
      cType,
      offline,
      push,
      setContentModalOpened,
      setFolderModalOpened,
      setNavigationPaletteOpened,
      setSearchPaletteOpened,
      setShortcutModalOpened,
      toggleSidebarCollapsed,
    ]
  )

  function itemToString(item: Command | null) {
    return item?.name ?? ''
  }

  function itemToIcon(item: Command | null) {
    if (!item) {
      return null
    }

    return item.icon
  }

  function onPick(item: Command | null | undefined) {
    item?.action()
  }

  return (
    <Palette
      opened={opened}
      onPick={onPick}
      items={commands}
      enterKeyHint="done"
      title="Command Palette"
      itemToIcon={itemToIcon}
      onOpenChange={setOpened}
      itemToString={itemToString}
      placeholder="Filter commands by name"
    />
  )
}

export default CommandPalette

interface Command extends PaletteItem {
  action: () => void
  icon: IconProps['icon']
  name: string
}
