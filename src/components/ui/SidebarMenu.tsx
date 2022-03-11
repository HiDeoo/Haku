import { Arrow, Content, Item, Root, Trigger } from '@radix-ui/react-dropdown-menu'
import { useAtomValue, useResetAtom, useUpdateAtom } from 'jotai/utils'
import { forwardRef } from 'react'
import {
  RiInstallLine,
  RiKeyboardFill,
  RiLogoutCircleRLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiMore2Fill,
} from 'react-icons/ri'

import { setShortcutModalOpenedAtom } from 'atoms/modal'
import { deferrefPromptEventAtom } from 'atoms/pwa'
import { sidebarCollapsedAtom, toggleSidebarCollapsedAtom } from 'atoms/sidebar'
import ContentModal from 'components/content/ContentModal'
import ContentTypeSwitch from 'components/content/ContentTypeSwitch'
import FolderModal from 'components/folder/FolderModal'
import Button, { type ButtonPropsWithOnClickHandler } from 'components/form/Button'
import IconButton from 'components/form/IconButton'
import SearchPalette from 'components/palette/SearchPalette'
import ShortcutModal from 'components/shortcut/ShortcutModal'
import Flex from 'components/ui/Flex'
import Icon, { type IconProps } from 'components/ui/Icon'
import { logout } from 'libs/auth'
import clst from 'styles/clst'

const SidebarMenu: React.FC = () => {
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const toggleSidebarCollapsed = useUpdateAtom(toggleSidebarCollapsedAtom)

  const deferrefPromptEvent = useAtomValue(deferrefPromptEventAtom)
  const resetDeferrefPromptEvent = useResetAtom(deferrefPromptEventAtom)

  const setShortcutModalOpened = useUpdateAtom(setShortcutModalOpenedAtom)

  function onClickKeyboardShortcuts() {
    setShortcutModalOpened(true)
  }

  function onClickInstallApp() {
    deferrefPromptEvent?.prompt()

    resetDeferrefPromptEvent()
  }

  const menuClasses = clst(
    'z-10 py-2',
    sidebarCollapsed ? 'px-2 h-full gap-1' : 'px-4 border-t border-zinc-600/40 shadow-[0_-1px_1px_0_rgba(0_0_0/1)]'
  )

  return (
    <Flex justifyContent="center" direction={sidebarCollapsed ? 'col' : 'row'} className={menuClasses}>
      <ContentTypeSwitch />
      <div className="grow" />
      <ContentModal />
      <FolderModal />
      <ShortcutModal />
      <SearchPalette />
      <IconButton
        onPress={toggleSidebarCollapsed}
        icon={sidebarCollapsed ? RiMenuUnfoldLine : RiMenuFoldLine}
        tooltip={`${sidebarCollapsed ? 'Expand' : 'Collapse'} Menu`}
        key={`sidebar-menu-${sidebarCollapsed ? 'expand' : 'collapse'}-button`}
      />
      <Root>
        <Trigger asChild>
          <IconButton icon={RiMore2Fill} tooltip="More" className="last-of-type:mr-0.5" />
        </Trigger>
        <Content side="top" className="animate-tooltip text-[0.84rem] leading-[1.2rem]" loop>
          <Arrow className="fill-zinc-700" width={16} height={8} />
          <Flex direction="col" className="rounded-md bg-zinc-700 p-1.5 shadow shadow-black/75">
            <Item asChild>
              <SidebarMenuItem label="Logout" icon={RiLogoutCircleRLine} onClick={logout} />
            </Item>
            <Item asChild>
              <SidebarMenuItem label="Keyboard Shortcuts" icon={RiKeyboardFill} onClick={onClickKeyboardShortcuts} />
            </Item>
            {deferrefPromptEvent ? (
              <Item asChild>
                <SidebarMenuItem label="Install App" icon={RiInstallLine} onClick={onClickInstallApp} />
              </Item>
            ) : null}
          </Flex>
        </Content>
      </Root>
    </Flex>
  )
}

export default SidebarMenu

const sidebarMenuItemClasses = clst(
  'mx-0 flex items-center justify-start gap-2.5 bg-zinc-700 text-left shadow-none px-2 py-1 rounded font-medium',
  'hover:bg-blue-600 hover:text-blue-50',
  'focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-blue-600'
)

const SidebarMenuItem = forwardRef<HTMLButtonElement, React.PropsWithChildren<SidebarMenuItemProps>>(
  ({ icon, label, ...props }, forwaredRef) => {
    return (
      <Button
        {...props}
        ref={forwaredRef}
        className={sidebarMenuItemClasses}
        pressedClassName="bg-blue-500 hover:bg-blue-500"
      >
        <Icon icon={icon} label={label} />
        {label}
      </Button>
    )
  }
)

SidebarMenuItem.displayName = 'SidebarMenuItem'

interface SidebarMenuItemProps extends Required<Pick<ButtonPropsWithOnClickHandler, 'onClick'>> {
  icon: IconProps['icon']
  label: string
}
