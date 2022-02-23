import { Content, Overlay, Portal, Root } from '@radix-ui/react-dialog'

import PalettePicker from 'components/palette/PalettePicker'
import { type IconProps } from 'components/ui/Icon'
import { MODAL_CONTENT_CLASSES, MODAL_OVERLAY_CLASSES } from 'components/ui/Modal'
import clst from 'styles/clst'

const Palette = <TItem,>(props: PaletteProps<TItem>) => {
  const overlayClasses = clst(MODAL_OVERLAY_CLASSES, 'pt-0')

  const contentClasses = clst(
    MODAL_CONTENT_CLASSES,
    'flex flex-col my-0 max-h-[500px] w-[400px] animate-palette-content overflow-y-hidden rounded-t-none'
  )

  return (
    <Root open={props.opened} onOpenChange={props.onOpenChange}>
      <Portal>
        <Overlay className={overlayClasses}>
          <Content className={contentClasses}>
            <PalettePicker {...props} />
          </Content>
        </Overlay>
      </Portal>
    </Root>
  )
}

export default Palette

export interface PaletteProps<TItem> {
  isLoading?: boolean
  items: TItem[]
  itemToIcon?: (item: TItem | null) => IconProps['icon'] | null
  itemToString: (item: TItem | null) => string
  onOpenChange: (opened: boolean) => void
  onPick: (item: TItem | null | undefined) => void
  opened?: boolean
  placeholder: string
}
