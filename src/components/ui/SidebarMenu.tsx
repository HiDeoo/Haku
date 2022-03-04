import { Arrow, Content, Item, Root, Trigger } from '@radix-ui/react-dropdown-menu'
import { useUpdateAtom } from 'jotai/utils'
import { forwardRef } from 'react'
import { RiKeyboardFill, RiLogoutCircleRLine, RiMore2Fill } from 'react-icons/ri'

import { setShortcutModalOpenedAtom } from 'atoms/modal'
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
  const setShortcutModalOpened = useUpdateAtom(setShortcutModalOpenedAtom)

  function onClickKeyboardShortcuts() {
    setShortcutModalOpened(true)
  }

  return (
    <Flex
      justifyContent="center"
      className="z-10 border-t border-zinc-600/40 px-4 py-2 shadow-[0_-1px_1px_0_rgba(0,0,0,1)]"
    >
      <ContentTypeSwitch />
      <ContentModal />
      <FolderModal />
      <ShortcutModal />
      <SearchPalette />
      <Root>
        <Trigger asChild>
          <IconButton icon={RiMore2Fill} tooltip="More" />
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
