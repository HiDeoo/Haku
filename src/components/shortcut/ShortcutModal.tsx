import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useMemo } from 'react'

import { setShortcutModalOpenedAtom, shortcutModalAtom } from 'atoms/modal'
import ShortcutList from 'components/shortcut/ShortcutList'
import Modal from 'components/ui/Modal'
import useGlobalShortcuts from 'hooks/useGlobalShortcuts'

const ShortcutModal: React.FC = () => {
  const opened = useAtomValue(shortcutModalAtom)
  const setOpened = useUpdateAtom(setShortcutModalOpenedAtom)

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

export default ShortcutModal
