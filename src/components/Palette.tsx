import { Content, Overlay, Portal, Root } from '@radix-ui/react-dialog'

import { MODAL_CONTENT_CLASSES, MODAL_OVERLAY_CLASSES } from 'components/Modal'
import PalettePicker from 'components/PalettePicker'
import clst from 'styles/clst'

const Palette = <TItem,>(props: PaletteProps<TItem>) => {
  const overlayClasses = clst(MODAL_OVERLAY_CLASSES, 'pt-0')

  const contentClasses = clst(
    MODAL_CONTENT_CLASSES,
    'flex flex-col my-0 max-h-[500px] animate-palette-content overflow-y-hidden rounded-t-none'
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
  itemToString: (item: TItem | null) => string
  onOpenChange: (opened: boolean) => void
  onPick: (item: TItem | null | undefined) => void
  opened?: boolean
  placeholder: string
}
