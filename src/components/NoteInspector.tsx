import { Editor } from '@tiptap/react'
import {
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBold,
  RiCodeLine,
  RiDoubleQuotesR,
  RiH1,
  RiH2,
  RiH3,
  RiH4,
  RiH5,
  RiH6,
  RiHeading,
  RiItalic,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiSeparator,
  RiStrikethrough,
} from 'react-icons/ri'

import Inspector from 'components/Inspector'

const NoteInspector: React.FC<NoteInspectorProps> = ({ editor }) => {
  const isH1 = editor?.isActive('heading', { level: 1 })
  const isH2 = editor?.isActive('heading', { level: 2 })
  const isH3 = editor?.isActive('heading', { level: 3 })
  const isH4 = editor?.isActive('heading', { level: 4 })
  const isH5 = editor?.isActive('heading', { level: 5 })
  const isH6 = editor?.isActive('heading', { level: 6 })

  const isHeading = isH1 || isH2 || isH3 || isH4 || isH5 || isH6
  const headingMenuIcon = isH1 ? RiH1 : isH2 ? RiH2 : isH3 ? RiH3 : isH4 ? RiH4 : isH5 ? RiH5 : isH6 ? RiH6 : RiHeading

  function addHorizontalRule() {
    editor?.chain().focus().setHorizontalRule().run()
  }

  function redo() {
    editor?.chain().focus().redo().run()
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

  function toggleHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
    editor?.chain().focus().toggleHeading({ level }).run()
  }

  function toggleHighlight() {
    editor?.chain().focus().toggleHighlight().run()
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

  function toggleStrike() {
    editor?.chain().focus().toggleStrike().run()
  }

  function undo() {
    editor?.chain().focus().undo().run()
  }

  return (
    <Inspector>
      <Inspector.Section>
        <Inspector.IconButton tooltip="Undo" onPress={undo} icon={RiArrowGoBackLine} disabled={!editor?.can().undo()} />
        <Inspector.IconButton
          tooltip="Redo"
          onPress={redo}
          icon={RiArrowGoForwardLine}
          disabled={!editor?.can().redo()}
        />
      </Inspector.Section>
      <Inspector.Section title="Text">
        <Inspector.IconMenu icon={headingMenuIcon} tooltip="Toggle Heading" toggled={isHeading}>
          <Inspector.IconMenuItem icon={RiH1} onClick={() => toggleHeading(1)} />
          <Inspector.IconMenuItem icon={RiH2} onClick={() => toggleHeading(2)} />
          <Inspector.IconMenuItem icon={RiH3} onClick={() => toggleHeading(3)} />
          <Inspector.IconMenuItem icon={RiH4} onClick={() => toggleHeading(4)} />
          <Inspector.IconMenuItem icon={RiH5} onClick={() => toggleHeading(5)} />
          <Inspector.IconMenuItem icon={RiH6} onClick={() => toggleHeading(6)} />
        </Inspector.IconMenu>
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
          icon={RiStrikethrough}
          onToggle={toggleStrike}
          tooltip="Toggle Strike"
          toggled={editor?.isActive('strike')}
        />
        <Inspector.Toggle
          icon={RiMarkPenLine}
          onToggle={toggleHighlight}
          tooltip="Toggle Highlight"
          toggled={editor?.isActive('highlight')}
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
