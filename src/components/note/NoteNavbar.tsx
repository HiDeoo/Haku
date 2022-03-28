import { type NoteEditorState } from 'components/note/Note'
import CacheStatus from 'components/ui/CacheStatus'
import Navbar from 'components/ui/Navbar'
import NetworkStatus from 'components/ui/NetworkStatus'
import SyncReport from 'components/ui/SyncReport'
import { useNetworkStatus } from 'hooks/useNetworkStatus'
import { type NoteMetadata } from 'libs/db/note'

const NoteNavbar: React.FC<NoteNavbarProps> = ({ disabled, editorState, isSaving, noteName, save }) => {
  const { offline } = useNetworkStatus()

  return (
    <Navbar disabled={disabled} title={noteName}>
      <Navbar.Spacer />
      <SyncReport isLoading={isSaving} error={editorState.error} lastSync={editorState.lastSync} />
      <NetworkStatus />
      <CacheStatus />
      <Navbar.Button
        primary
        onPress={save}
        loading={isSaving}
        disabled={offline || editorState.pristine}
        pinged={!editorState.pristine && !isSaving}
      >
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
  noteName?: NoteMetadata['name']
  save: () => void
}
