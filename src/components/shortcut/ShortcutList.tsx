import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useAtomValue } from 'jotai'
import { Fragment, useMemo } from 'react'

import { globalShortcutsAtom, localShortcutsAtom } from 'atoms/shortcuts'
import { Flex } from 'components/ui/Flex'
import { groupByKey } from 'libs/array'
import { type DescribedShortcut, getKeyAriaLabel, prettyPrintKey, isDescribedShortcut } from 'libs/shortcut'
import { clst } from 'styles/clst'

export const ShortcutList: React.FC = () => {
  const globalShortcuts = useAtomValue(globalShortcutsAtom)
  const localShortcuts = useAtomValue(localShortcutsAtom)

  const allShortcuts = useMemo(
    () =>
      groupByKey(
        [
          ...Object.values(globalShortcuts).filter(isDescribedShortcut),
          ...Object.values(localShortcuts).filter(isDescribedShortcut),
        ],
        'group'
      ),
    [globalShortcuts, localShortcuts]
  )

  return (
    <Flex direction="col" className="-m-4 gap-2.5 py-3">
      {Object.entries(allShortcuts).map(([group, groupShortcuts]) => {
        return <ShortcutGroup key={group} group={group} shortcuts={groupShortcuts} />
      })}
    </Flex>
  )
}

const ShortcutGroup: React.FC<ShortcutGroupProps> = ({ group, shortcuts }) => {
  return (
    <div>
      <div className="mb-2.5 px-4">
        <h2 className="border-b border-zinc-700 pb-0.5 text-lg font-semibold">{group}</h2>
      </div>
      {shortcuts.map((shortcut) => {
        return (
          <Flex
            justifyContent="between"
            key={shortcut.keybinding}
            className="group py-1 px-4 last:mb-0 hover:bg-zinc-700"
          >
            <div className="truncate">{shortcut.label}</div>
            <ShortcutKeybinding keybinding={shortcut.parsedKeybinding} />
          </Flex>
        )
      })}
    </div>
  )
}

const ShortcutKeybinding: React.FC<ShortcutKeybindingProps> = ({ keybinding }) => {
  const keys = [...keybinding[0], keybinding[1]]

  return (
    <Flex className="gap-1">
      {keys.map((key) => {
        const prettyPrintedKey = prettyPrintKey(key)

        const kbdClasses = clst(
          'block rounded bg-zinc-600 px-1.5 text-xs leading-[unset] shadow shadow-zinc-900 min-w-[1.4rem] text-center',
          'group-hover:bg-zinc-500',
          prettyPrintedKey.length === 1 && !/[\d.?A-z]/i.test(prettyPrintedKey) && 'text-base'
        )

        return (
          <Fragment key={key}>
            <kbd aria-hidden className={kbdClasses}>
              {prettyPrintedKey}
            </kbd>
            <VisuallyHidden>{getKeyAriaLabel(key)}</VisuallyHidden>
          </Fragment>
        )
      })}
    </Flex>
  )
}

interface ShortcutGroupProps {
  group: DescribedShortcut['group']
  shortcuts: DescribedShortcut[]
}

interface ShortcutKeybindingProps {
  keybinding: DescribedShortcut['parsedKeybinding']
}
