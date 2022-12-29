import { Arrow, Content, Item, Portal, Root, Trigger } from '@radix-ui/react-dropdown-menu'
import { useAtomValue, useSetAtom } from 'jotai/react'
import { useResetAtom } from 'jotai/react/utils'
import { useRouter } from 'next/router'
import { forwardRef } from 'react'
import { BsFillLayersFill } from 'react-icons/bs'
import {
  RiBugLine,
  RiInboxArchiveLine,
  RiInstallLine,
  RiKeyboardFill,
  RiLogoutCircleRLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiMore2Fill,
} from 'react-icons/ri'

import { sidebarCollapsedAtom, toggleSidebarCollapsedAtom } from 'atoms/collapsible'
import { deferrefPromptEventAtom } from 'atoms/pwa'
import { shortcutModalOpenedAtom } from 'atoms/togglable'
import { ContentModal } from 'components/content/ContentModal'
import { ContentTypeSwitch } from 'components/content/ContentTypeSwitch'
import { FolderModal } from 'components/folder/FolderModal'
import { Button, type ButtonPropsWithOnClickHandler } from 'components/form/Button'
import { IconButton } from 'components/form/IconButton'
import { InboxDrawer } from 'components/inbox/InboxDrawer'
import { SearchDrawer } from 'components/search/SearchDrawer'
import { ShortcutModal } from 'components/shortcut/ShortcutModal'
import { Flex } from 'components/ui/Flex'
import { Icon, type IconProps } from 'components/ui/Icon'
import { logout } from 'libs/auth'
import { openGitHubIssuePage } from 'libs/github'
import { isApplePlatform } from 'libs/html'
import { clst } from 'styles/clst'

export const SidebarMenu = () => {
  const { push } = useRouter()

  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const toggleSidebarCollapsed = useSetAtom(toggleSidebarCollapsedAtom)

  const deferrefPromptEvent = useAtomValue(deferrefPromptEventAtom)
  const resetDeferrefPromptEvent = useResetAtom(deferrefPromptEventAtom)

  const setShortcutModalOpened = useSetAtom(shortcutModalOpenedAtom)

  function handleKeyboardShortcutsClick() {
    setShortcutModalOpened(true)
  }

  function handleInstallAppClick() {
    deferrefPromptEvent?.prompt()

    resetDeferrefPromptEvent()
  }

  function handleImportDataClick() {
    push('/import')
  }

  const menuClasses = clst(
    'z-10 py-2 pb-[calc(theme(spacing.2)+max(0px,env(safe-area-inset-bottom)))]',
    sidebarCollapsed
      ? 'px-2 pl-[calc(theme(spacing.2)+max(0px,env(safe-area-inset-left)))] h-full gap-1'
      : [
          'px-2.5 pl-[calc(theme(spacing[2.5])+max(0px,env(safe-area-inset-left)))]',
          'border-t border-zinc-600/40 shadow-[0_-1px_1px_0_theme(colors.black)]',
        ]
  )

  return (
    <Flex justifyContent="center" direction={sidebarCollapsed ? 'col' : 'row'} className={menuClasses}>
      <ContentTypeSwitch />
      {sidebarCollapsed ? <div className="grow" /> : null}
      <InboxDrawer />
      <ContentModal />
      <FolderModal />
      <ShortcutModal />
      <SearchDrawer />
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
        <Portal>
          <Content
            loop
            side={sidebarCollapsed ? 'right' : 'top'}
            className="animate-tooltip z-40 text-[0.84rem] leading-[1.2rem]"
          >
            <Arrow className="fill-zinc-700" width={16} height={8} />
            <Flex direction="col" className="rounded-md bg-zinc-700 p-1.5 shadow shadow-black/75">
              <Item asChild>
                <SidebarMenuItem label="Logout" icon={RiLogoutCircleRLine} onClick={logout} />
              </Item>
              <Item asChild>
                <SidebarMenuItem label="Report Bug" icon={RiBugLine} onClick={openGitHubIssuePage} />
              </Item>
              <Item asChild>
                <SidebarMenuItem label="Import Data" icon={RiInboxArchiveLine} onClick={handleImportDataClick} />
              </Item>
              <Item asChild>
                <SidebarMenuItem
                  label="Keyboard Shortcuts"
                  icon={RiKeyboardFill}
                  onClick={handleKeyboardShortcutsClick}
                />
              </Item>
              {isApplePlatform ? (
                <Item asChild>
                  <SidebarMenuItem
                    label="Get Apple Shortcut"
                    icon={BsFillLayersFill}
                    onClick={handleSidebarMenuInstallShortcutClick}
                  />
                </Item>
              ) : null}
              {deferrefPromptEvent ? (
                <Item asChild>
                  <SidebarMenuItem label="Install App" icon={RiInstallLine} onClick={handleInstallAppClick} />
                </Item>
              ) : null}
            </Flex>
          </Content>
        </Portal>
      </Root>
    </Flex>
  )
}

function handleSidebarMenuInstallShortcutClick() {
  window.open(process.env.NEXT_PUBLIC_INBOX_APPLE_SHORTCUT_LINK)
}

const sidebarMenuItemClasses = clst(
  'mx-0 flex items-center justify-start gap-2.5 bg-zinc-700 text-left shadow-none px-2 py-1 rounded font-medium',
  'hover:bg-blue-600 hover:text-zinc-100',
  'data-[highlighted]:ring-0 data-[highlighted]:ring-offset-0 data-[highlighted]:bg-blue-600'
)

const SidebarMenuItem = forwardRef<HTMLButtonElement, SidebarMenuItemProps>(
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
