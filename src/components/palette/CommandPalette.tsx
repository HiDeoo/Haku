import { useUpdateAtom } from 'jotai/utils'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import {
  RiBookletLine,
  RiFileAddLine,
  RiFolderAddLine,
  RiKeyboardFill,
  RiLogoutCircleRLine,
  RiTodoLine,
} from 'react-icons/ri'

import { setContentModalOpenedAtom, setFolderModalOpenedAtom, setShortcutModalOpenedAtom } from 'atoms/modal'
import { type PaletteProps } from 'components/palette/Palette'
import { type IconProps } from 'components/ui/Icon'
import useContentType, { ContentType, getContentType } from 'hooks/useContentType'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'
import { logout } from 'libs/auth'

const Palette = dynamic<PaletteProps<Command>>(import('components/palette/Palette'))

const CommandPalette: React.FC = () => {
  const { push } = useRouter()

  const [opened, setOpened] = useState(false)

  const { cType, type } = useContentType()
  const isBrowsingNotes = type === ContentType.NOTE
  const altContentType = getContentType(isBrowsingNotes ? ContentType.TODO : ContentType.NOTE)
  const altIcon = isBrowsingNotes ? RiTodoLine : RiBookletLine

  const setContentModalOpened = useUpdateAtom(setContentModalOpenedAtom)
  const setFolderModalOpened = useUpdateAtom(setFolderModalOpenedAtom)
  const setShortcutModalOpened = useUpdateAtom(setShortcutModalOpenedAtom)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          group: 'Command',
          keybinding: 'Meta+Shift+P',
          label: 'Show all Commands',
          onKeyDown: (event) => {
            event.preventDefault()

            setOpened(true)
          },
        },
      ],
      []
    )
  )

  const commands = useMemo<Command[]>(
    () => [
      {
        name: `Create New ${cType}`,
        icon: RiFileAddLine,
        action: () => {
          setContentModalOpened(true)
        },
      },
      {
        name: 'Create New Folder',
        icon: RiFolderAddLine,
        action: () => {
          setFolderModalOpened(true)
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
        name: 'Display Keyboard Shortcuts',
        icon: RiKeyboardFill,
        action: () => {
          setShortcutModalOpened(true)
        },
      },
      {
        name: 'Logout',
        icon: RiLogoutCircleRLine,
        action: () => {
          logout()
        },
      },
    ],
    [altContentType, altIcon, cType, push, setContentModalOpened, setFolderModalOpened, setShortcutModalOpened]
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
      itemToIcon={itemToIcon}
      onOpenChange={setOpened}
      itemToString={itemToString}
      placeholder="Filter commands by name"
    />
  )
}

export default CommandPalette

interface Command {
  action: () => void
  icon: IconProps['icon']
  name: string
}
