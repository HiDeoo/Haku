import { useAtom } from 'jotai/react'
import { useMemo } from 'react'

import { shortcutModalOpenedAtom } from 'atoms/togglable'
import { ShortcutList } from 'components/shortcut/ShortcutList'
import { Modal } from 'components/ui/Modal'
import { useGlobalShortcuts } from 'hooks/useGlobalShortcuts'

export const ShortcutModal = () => {
  const [opened, setOpened] = useAtom(shortcutModalOpenedAtom)

  useGlobalShortcuts(
    useMemo(
      () => [
        {
          allowInTextInput: false,
          group: 'Miscellaneous',
          keybinding: 'Shift+?',
          label: 'Display Keyboard Shortcuts',
          onKeyDown: () => {
            setOpened(true)
          },
        },
      ],
      [setOpened]
    )
  )

  return (
    <Modal opened={opened} onOpenChange={setOpened} title="Keyboard Shortcuts">
      <ShortcutList />
    </Modal>
  )
}
