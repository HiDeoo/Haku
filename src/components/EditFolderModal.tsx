import Modal, { type ControlledModalProps } from 'components/Modal'
import { FolderData } from 'libs/db/folder'

const EditFolderModal: React.FC<Props> = ({ folder, opened, setOpened }) => {
  const isLoading = false

  return (
    <Modal opened={opened} title="Edit Folder" setOpened={setOpened} disabled={isLoading}>
      {folder?.name}
    </Modal>
  )
}

export default EditFolderModal

interface Props extends ControlledModalProps {
  folder?: FolderData
}
