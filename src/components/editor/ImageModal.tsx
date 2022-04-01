import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { imageModalAtom } from 'atoms/modal'
import Modal from 'components/ui/Modal'

const ImageModal: React.FC = () => {
  const [modal, setModal] = useAtom(imageModalAtom)

  const onOpenChange = useCallback(() => {
    setModal({ name: undefined, opened: false, url: undefined })
  }, [setModal])

  return (
    <Modal
      opened={modal.opened}
      onOpenChange={onOpenChange}
      title={modal.name ?? 'Image'}
      className="m-auto w-full overflow-scroll p-0"
      contentClassName="xs:min-w-[unset] xs:max-w-[unset] xs:w-[80vw] h-[100vh] xs:h-[80vh] bg-checkboard flex flex-col"
    >
      {/* // FIXME(HiDeoo) */}
      {/* eslint-disable-next-line jsx-a11y/alt-text,@next/next/no-img-element  */}
      <img className="m-auto block max-h-[unset] max-w-[unset] object-none" src={modal.url} />
    </Modal>
  )
}

export default ImageModal
