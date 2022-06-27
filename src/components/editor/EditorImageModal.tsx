import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { editorImageModalAtom } from 'atoms/togglable'
import { Modal } from 'components/ui/Modal'
import { getA11yImageReactAttributes } from 'libs/image'

export const EditorImageModal: React.FC = () => {
  const [{ opened, srcSet, ...image }, setModal] = useAtom(editorImageModalAtom)

  const handleOpenChange = useCallback(() => {
    setModal({ opened: false })
  }, [setModal])

  const { alt, ...props } = getA11yImageReactAttributes({ ...image, lazy: false })

  return (
    <Modal
      opened={opened}
      title={image.alt ?? 'Image'}
      onOpenChange={handleOpenChange}
      className="m-auto w-full overflow-scroll p-0"
      contentClassName="xs:min-w-[unset] xs:max-w-[unset] xs:w-[80vw] h-[100vh] xs:h-[80vh] bg-checkboard flex flex-col"
    >
      <img className="m-auto block max-h-[unset] max-w-[unset] object-none" alt={alt} {...props} />
    </Modal>
  )
}
