import { useAtom, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import {
  RiBookletLine,
  RiFileAddLine,
  RiFolderAddLine,
  RiInboxFill,
  RiKeyboardFill,
  RiLink,
  RiLogoutCircleRLine,
  RiMenu2Line,
  RiSearchLine,
  RiTodoLine,
} from 'react-icons/ri'

import { toggleSidebarCollapsedAtom } from 'atoms/collapsible'
import { commandPaletteOpenedAtom, navigationPaletteOpenedAtom, searchPaletteOpenedAtom } from 'atoms/palette'
import {
  setContentModalOpenedAtom,
  setFolderModalOpenedAtom,
  setInboxDrawerOpenedAtom,
  setShortcutModalOpenedAtom,
} from 'atoms/togglable'
import Palette, { type PaletteItem } from 'components/palette/Palette'
import { type IconProps } from 'components/ui/Icon'
import useContentType, { ContentType, getContentType } from 'hooks/useContentType'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { logout } from 'libs/auth'

const CommandPalette: React.FC = () => {
  const { offline } = useNetworkStatus()

  const { push } = useRouter()

  const [opened, setOpened] = useAtom(commandPaletteOpenedAtom)

  const setNavigationPaletteOpened = useSetAtom(navigationPaletteOpenedAtom)
  const setSearchPaletteOpened = useSetAtom(searchPaletteOpenedAtom)

  const { cType, type } = useContentType()
  const isBrowsingNotes = type === ContentType.NOTE
  const altContentType = getContentType(isBrowsingNotes ? ContentType.TODO : ContentType.NOTE)
  const altIcon = isBrowsingNotes ? RiTodoLine : RiBookletLine

  const setContentModalOpened = useSetAtom(setContentModalOpenedAtom)
  const setFolderModalOpened = useSetAtom(setFolderModalOpenedAtom)
  const setShortcutModalOpened = useSetAtom(setShortcutModalOpenedAtom)

  const setInboxDrawerOpened = useSetAtom(setInboxDrawerOpenedAtom)

  const toggleSidebarCollapsed = useSetAtom(toggleSidebarCollapsedAtom)

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
        name: 'Open Inbox',
        icon: RiInboxFill,
        action: () => {
          setInboxDrawerOpened(true)
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
      setInboxDrawerOpened,
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

  function handlePick(item: Command | null | undefined) {
    item?.action()
  }

  return (
    <Palette
      opened={opened}
      items={commands}
      enterKeyHint="done"
      onPick={handlePick}
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
