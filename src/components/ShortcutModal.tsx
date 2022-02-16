import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useMemo } from 'react'
import { RiKeyboardFill } from 'react-icons/ri'

import { setShortcutModalOpenedAtom, shortcutModalAtom } from 'atoms/modal'
import IconButton from 'components/IconButton'
import Modal from 'components/Modal'
import ShortcutList from 'components/ShortcutList'
import useShortcuts from 'hooks/useShortcuts'

const ShortcutModal: React.FC = () => {
  const opened = useAtomValue(shortcutModalAtom)
  const setOpened = useUpdateAtom(setShortcutModalOpenedAtom)

  useShortcuts(
    useMemo(
      () => [
        {
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
    <Modal
      opened={opened}
      onOpenChange={setOpened}
      title="Keyboard Shortcuts"
      trigger={<IconButton icon={RiKeyboardFill} tooltip="Keyboard Shortcuts" />}
    >
      <ShortcutList />
    </Modal>
  )
}

export default ShortcutModal
