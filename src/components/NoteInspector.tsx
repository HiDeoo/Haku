import { Editor } from '@tiptap/react'
import {
  RiBold,
  RiDoubleQuotesR,
  RiCodeLine,
  RiItalic,
  RiListOrdered,
  RiListUnordered,
  RiSeparator,
} from 'react-icons/ri'

import Inspector from 'components/Inspector'

const NoteInspector: React.FC<NoteInspectorProps> = ({ editor }) => {
  function addHorizontalRule() {
    editor?.chain().focus().setHorizontalRule().run()
  }

  function toggleBold() {
    editor?.chain().focus().toggleBold().run()
  }

  function toggleBulletList() {
    editor?.chain().focus().toggleBulletList().run()
  }

  function toggleCode() {
    editor?.chain().focus().toggleCode().run()
  }

  function toggleItalic() {
    editor?.chain().focus().toggleItalic().run()
  }

  function toggleOrderedList() {
    editor?.chain().focus().toggleOrderedList().run()
  }

  function toggleQuote() {
    editor?.chain().focus().toggleBlockquote().run()
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
        <Inspector.Toggle
          icon={RiItalic}
          onToggle={toggleItalic}
          tooltip="Toggle Italic"
          toggled={editor?.isActive('italic')}
        />
        <Inspector.Toggle
          icon={RiCodeLine}
          onToggle={toggleCode}
          tooltip="Toggle Code"
          toggled={editor?.isActive('code')}
        />
        <Inspector.Toggle
          icon={RiDoubleQuotesR}
          onToggle={toggleQuote}
          tooltip="Toggle Quote"
          toggled={editor?.isActive('blockquote')}
        />
        <Inspector.Toggle
          icon={RiListUnordered}
          onToggle={toggleBulletList}
          tooltip="Toggle Bullet List"
          toggled={editor?.isActive('bulletList')}
        />
        <Inspector.Toggle
          icon={RiListOrdered}
          onToggle={toggleOrderedList}
          tooltip="Toggle Ordered List"
          toggled={editor?.isActive('orderedList')}
        />
      </Inspector.Section>
      <Inspector.Section title="Content">
        <Inspector.IconButton icon={RiSeparator} onPress={addHorizontalRule} tooltip="Insert Separator" />
      </Inspector.Section>
    </Inspector>
  )
}

export default NoteInspector

interface NoteInspectorProps {
  editor: Editor | null
}
