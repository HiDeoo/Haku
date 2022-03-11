import { type NoteEditorState } from 'components/note/Note'
import Navbar from 'components/ui/Navbar'
import SyncReport from 'components/ui/SyncReport'

const NoteNavbar: React.FC<NoteNavbarProps> = ({ disabled, editorState, isSaving, save }) => {
  return (
    <Navbar disabled={disabled}>
      <Navbar.Spacer />
      <SyncReport isLoading={isSaving} error={editorState.error} lastSync={editorState.lastSync} />
      <Navbar.Button primary onPress={save} loading={isSaving} disabled={editorState.pristine}>
        Save
      </Navbar.Button>
    </Navbar>
  )
}

export default NoteNavbar

interface NoteNavbarProps {
  disabled?: boolean
  editorState: NoteEditorState
  isSaving: boolean
  save: () => void
}
