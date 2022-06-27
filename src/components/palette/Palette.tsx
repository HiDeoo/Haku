import { Content, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog'
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { PalettePicker } from 'components/palette/PalettePicker'
import { type IconProps } from 'components/ui/Icon'
import { MODAL_CONTENT_CLASSES, MODAL_OVERLAY_CLASSES } from 'components/ui/Modal'
import { useFocusRestoration } from 'hooks/useFocusRestoration'
import { clst } from 'styles/clst'

export const Palette = <TItem extends PaletteItem>({ title, ...props }: PaletteProps<TItem>) => {
  useFocusRestoration(props.opened)

  const overlayClasses = clst(MODAL_OVERLAY_CLASSES, 'pt-0 md:pt-0')

  const contentClasses = clst(
    MODAL_CONTENT_CLASSES,
    'flex flex-col my-0 xs:my-0 max-h-[500px] xs:w-[400px] animate-palette-content overflow-y-hidden rounded-t-none'
  )

  return (
    <Root open={props.opened} onOpenChange={props.onOpenChange}>
      <Portal>
        <Overlay className={overlayClasses}>
          <Content className={contentClasses}>
            <VisuallyHidden>
              <Title>{title}</Title>
            </VisuallyHidden>
            <PalettePicker {...props} />
          </Content>
        </Overlay>
      </Portal>
    </Root>
  )
}

export interface PaletteProps<TItem extends PaletteItem> {
  enterKeyHint?: React.InputHTMLAttributes<HTMLInputElement>['enterKeyHint']
  isLoading?: boolean
  items: TItem[]
  itemToIcon?: (item: TItem | null) => IconProps['icon'] | null
  itemToString: (item: TItem | null) => string
  onOpenChange: (opened: boolean) => void
  onPick: (item: TItem | null | undefined) => void
  opened?: boolean
  placeholder: string
  title: string
}

export interface PaletteItem {
  disabled?: boolean
}
