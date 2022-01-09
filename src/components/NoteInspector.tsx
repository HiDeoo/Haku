import { Editor } from '@tiptap/react'
import { RiBold } from 'react-icons/ri'

import Inspector from 'components/Inspector'

const NoteInspector: React.FC<NoteInspectorProps> = ({ editor }) => {
  function toggleBold() {
    editor?.chain().focus().toggleBold().run()
  }

  return (
    <Inspector>
      <Inspector.Section title="Text">
        <Inspector.Toggle
          icon={RiBold}
          onToggle={toggleBold}
          tooltip="Toggle Bold"
          toggled={editor?.isActive('bold')}
        />
      </Inspector.Section>
    </Inspector>
  )
}

export default NoteInspector

interface NoteInspectorProps {
  editor: Editor | null
}
