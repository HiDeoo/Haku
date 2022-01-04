import Modal, { type ControlledModalProps } from 'components/Modal'
import { FolderData } from 'libs/db/folder'

const EditFolderModal: React.FC<EditFolderModalProps> = ({ folder, opened, setOpened }) => {
  const isLoading = false

  return (
    <Modal opened={opened} title="Edit Folder" setOpened={setOpened} disabled={isLoading}>
      {folder?.name}
    </Modal>
  )
}

export default EditFolderModal

interface EditFolderModalProps extends ControlledModalProps {
  folder?: FolderData
}
