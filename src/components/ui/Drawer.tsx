import { Close, Content, Overlay, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog'
import { forwardRef } from 'react'
import { RiCloseLine } from 'react-icons/ri'

import Form, { type FormProps } from 'components/form/Form'
import IconButton from 'components/form/IconButton'
import Flex from 'components/ui/Flex'
import List, { type ListComponent } from 'components/ui/List'
import { LIST_SHIMMER_CLASSES } from 'constants/shimmer'
import useFocusRestoration from 'hooks/useFocusRestoration'
import clst from 'styles/clst'

const contentClasses = clst(
  'animate-drawer-content flex flex-col md:w-[700px] w-full bg-zinc-800 h-full',
  'outline-none md:shadow-[1px_0_3px_0_theme(colors.black/75%),1px_0_2px_-1px_theme(colors.black/75%)]'
)

const overlayClasses = 'animate-modal-overlay fixed inset-0 z-40 bg-zinc-900/80'

const headerClasses = clst(
  'border-b border-black/10 bg-zinc-900 py-2 pl-3 pr-2 font-bold',
  'supports-max:pl-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-left)))]'
)

const listClasses = clst(
  'grow overflow-y-auto border-t border-b border-zinc-900 p-3',
  'supports-max:pl-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-left)))]',
  'supports-max:pb-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-bottom)))]'
)

const Drawer: DrawerComponent = ({ children, className, onOpenChange, opened, title, trigger }) => {
  useFocusRestoration(opened)

  const childrenClasses = clst('grow overflow-y-auto', className)

  return (
    <Root open={opened} onOpenChange={onOpenChange}>
      {trigger ? <Trigger asChild>{trigger}</Trigger> : null}
      <Portal>
        <Overlay className={overlayClasses}>
          <Content className={contentClasses} onCloseAutoFocus={handleCloseAutoFocus}>
            <Flex as="header" alignItems="center" justifyContent="between" className={headerClasses}>
              <Title>{title}</Title>
              <Close asChild>
                <IconButton tooltip="Close" icon={RiCloseLine} className="rounded-full p-1" />
              </Close>
            </Flex>
            <div className={childrenClasses}>{children}</div>
          </Content>
        </Overlay>
      </Portal>
    </Root>
  )
}

export default Drawer

const DrawerForm: React.FC<DrawerFormProps> = ({ children, ...props }) => {
  const formClasses = clst(
    'z-10 bg-zinc-900/10 p-3 shadow-[0px_1px_2px_0px_theme(colors.black/50%)]',
    'supports-max:pl-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-left)))]'
  )

  return (
    <Form {...props} className={formClasses}>
      <div className="flex gap-2.5">{children}</div>
    </Form>
  )
}

Drawer.Form = DrawerForm

const DrawerNis: React.FC<DrawerNisProps> = ({ text }) => {
  return (
    <Flex
      fullWidth
      fullHeight
      direction="col"
      alignItems="center"
      className="mt-6 p-3 supports-max:pl-[calc(theme(spacing.3)+max(0px,env(safe-area-inset-left)))]"
    >
      <span>{text}</span>
    </Flex>
  )
}

Drawer.Nis = DrawerNis

const DrawerList = forwardRef((props, forwardedRef) => {
  return <List {...props} shimmerClassNames={LIST_SHIMMER_CLASSES} className={listClasses} ref={forwardedRef} />
}) as ListComponent

DrawerList.displayName = 'DrawerList'

DrawerList.Button = List.Button

const DrawerListItem: ListComponent['Item'] = (props) => {
  return <List.Item className="py-2 pr-2" {...props} />
}

DrawerList.Item = DrawerListItem

Drawer.List = DrawerList

function handleCloseAutoFocus(event: Event) {
  event.preventDefault()
}

type DrawerComponent = React.FC<DrawerProps> & {
  Form: typeof DrawerForm
  List: typeof DrawerList
  Nis: typeof DrawerNis
}

interface DrawerProps {
  children: React.ReactNode
  className?: string
  onOpenChange: (opened: boolean) => void
  opened: boolean
  title: string
  trigger?: React.ReactNode
}

type DrawerFormProps = Omit<FormProps, 'className'>

interface DrawerNisProps {
  text: string
}
