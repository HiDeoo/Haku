import { useAtom, useSetAtom } from 'jotai/react'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import IconBookletLine from '~icons/ri/booklet-line'
import IconFileAddLine from '~icons/ri/file-add-line'
import IconFolderAddLine from '~icons/ri/folder-add-line'
import IconInboxFill from '~icons/ri/inbox-fill'
import IconKeyboardFill from '~icons/ri/keyboard-fill'
import IconLink from '~icons/ri/link'
import IconLogoutCircleRLine from '~icons/ri/logout-circle-r-line'
import IconMenu2Line from '~icons/ri/menu-2-line'
import IconSearchLine from '~icons/ri/search-line'
import IconTodoLine from '~icons/ri/todo-line'

import { toggleSidebarCollapsedAtom } from 'atoms/collapsible'
import {
  commandPaletteOpenedAtom,
  navigationPaletteOpenedAtom,
  setContentModalOpenedAtom,
  setFolderModalOpenedAtom,
  setInboxDrawerOpenedAtom,
  setSearchDrawerOpenedAtom,
  shortcutModalOpenedAtom,
} from 'atoms/togglable'
import { Palette, type PaletteItem } from 'components/palette/Palette'
import { type IconProps } from 'components/ui/Icon'
import { ContentType, getContentType, useContentType } from 'hooks/useContentType'
import { useGlobalShortcuts } from 'hooks/useGlobalShortcuts'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { logout } from 'libs/auth'

export const CommandPalette = () => {
  const { offline } = useNetworkStatus()

  const { push } = useRouter()

  const [opened, setOpened] = useAtom(commandPaletteOpenedAtom)

  const setNavigationPaletteOpened = useSetAtom(navigationPaletteOpenedAtom)
  const setSearchDrawerOpened = useSetAtom(setSearchDrawerOpenedAtom)

  const { cType, type } = useContentType()
  const isBrowsingNotes = type === ContentType.NOTE
  const altContentType = getContentType(isBrowsingNotes ? ContentType.TODO : ContentType.NOTE)
  const altIcon = isBrowsingNotes ? IconTodoLine : IconBookletLine

  const setContentModalOpened = useSetAtom(setContentModalOpenedAtom)
  const setFolderModalOpened = useSetAtom(setFolderModalOpenedAtom)
  const setShortcutModalOpened = useSetAtom(shortcutModalOpenedAtom)

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
        icon: IconFileAddLine,
        disabled: offline,
        action: () => {
          setContentModalOpened(true)
        },
      },
      {
        name: 'Create New Folder',
        icon: IconFolderAddLine,
        disabled: offline,
        action: () => {
          setFolderModalOpened(true)
        },
      },
      {
        name: 'Search in Notes and Todos',
        icon: IconSearchLine,
        action: () => {
          setSearchDrawerOpened(true)
        },
      },
      {
        name: 'Go to Note or Todo',
        icon: IconLink,
        action: () => {
          // When switching to the navigation palette, we need to wait for the command palette to be closed and the
          // previous focus to have been restored otherwise the navigation palette will be opened and immediately
          // unfocused due to the delayed command palette focus restoration.
          setTimeout(() => {
            setNavigationPaletteOpened(true)
          }, 10)
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
        icon: IconInboxFill,
        action: () => {
          setInboxDrawerOpened(true)
        },
      },
      {
        name: `Collapse / Expand Menu`,
        icon: IconMenu2Line,
        action: toggleSidebarCollapsed,
      },
      {
        name: 'Display Keyboard Shortcuts',
        icon: IconKeyboardFill,
        action: () => {
          setShortcutModalOpened(true)
        },
      },
      {
        name: 'Logout',
        icon: IconLogoutCircleRLine,
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
      setSearchDrawerOpened,
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

interface Command extends PaletteItem {
  action: () => void
  icon: IconProps['icon']
  name: string
}
