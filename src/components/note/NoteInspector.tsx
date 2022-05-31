import { type Editor } from '@tiptap/react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  RiArrowDropRightFill,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBold,
  RiCodeBoxLine,
  RiCodeLine,
  RiDoubleQuotesR,
  RiEditLine,
  RiFormatClear,
  RiH1,
  RiH2,
  RiH3,
  RiH4,
  RiH5,
  RiH6,
  RiHeading,
  RiImageAddLine,
  RiItalic,
  RiLink,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiSeparator,
  RiStrikethrough,
} from 'react-icons/ri'

import { noteInspectorCollapsedAtom, sidebarCollapsedAtom, toggleNoteInspectorCollapsedAtom } from 'atoms/collapsible'
import EditorSyntaxModal from 'components/editor/EditorSyntaxModal'
import FileButton from 'components/form/FileButton'
import IconButton from 'components/form/IconButton'
import { type NoteEditorState } from 'components/note/Note'
import Flex from 'components/ui/Flex'
import FloatingButton from 'components/ui/FloatingButton'
import Icon from 'components/ui/Icon'
import Inspector from 'components/ui/Inspector'
import { IMAGE_SUPPORTED_TYPES } from 'constants/image'
import { isNotEmpty } from 'libs/array'
import clst from 'styles/clst'

const NoteInspector: React.FC<NoteInspectorProps> = ({ disabled, editor, editorState, setLinkModalOpened }) => {
  const collapsed = useAtomValue(noteInspectorCollapsedAtom)
  const toggleCollapsed = useSetAtom(toggleNoteInspectorCollapsedAtom)

  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)

  const isCodeBlock = editor?.isActive('codeBlock')

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

  function clearFormat() {
    editor?.chain().focus().clearNodes().unsetAllMarks().run()
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

  function toggleCodeBlock() {
    editor?.chain().focus().toggleCodeBlock().run()
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

  function toggleLink() {
    setLinkModalOpened((prevLinkModalOpened) => !prevLinkModalOpened)
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

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      return
    }

    try {
      editor
        ?.chain()
        .focus()
        .uploadImages([...event.target.files])
        .run()
    } catch {
      // Ignore potential errors that will be handled by the editor plugin.
    }
  }

  return (
    <>
      <Inspector
        disabled={disabled}
        collapsed={collapsed}
        controls={
          <>
            <IconButton
              onPress={toggleCollapsed}
              icon={collapsed ? RiMenuFoldLine : RiMenuUnfoldLine}
              tooltip={`${collapsed ? 'Expand' : 'Collapse'} Inspector`}
              key={`note-inspector-${collapsed ? 'expand' : 'collapse'}-button`}
            />
          </>
        }
      >
        <Inspector.Section>
          <Inspector.IconButton
            tooltip="Undo"
            onPress={undo}
            icon={RiArrowGoBackLine}
            disabled={!editor?.can().undo()}
          />
          <Inspector.IconButton
            tooltip="Redo"
            onPress={redo}
            icon={RiArrowGoForwardLine}
            disabled={!editor?.can().redo()}
          />
          <Inspector.IconButton tooltip="Clear Format" onPress={clearFormat} icon={RiFormatClear} />
          <EditorSyntaxModal />
        </Inspector.Section>
        <Inspector.Section title="Text">
          <Inspector.IconMenu
            toggled={isHeading}
            icon={headingMenuIcon}
            disabled={isCodeBlock}
            tooltip="Toggle Heading"
          >
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
            disabled={isCodeBlock}
            toggled={editor?.isActive('bold')}
          />
          <Inspector.Toggle
            icon={RiItalic}
            disabled={isCodeBlock}
            onToggle={toggleItalic}
            tooltip="Toggle Italic"
            toggled={editor?.isActive('italic')}
          />
          <Inspector.Toggle
            icon={RiCodeLine}
            onToggle={toggleCode}
            tooltip="Toggle Code"
            disabled={isCodeBlock}
            toggled={editor?.isActive('code')}
          />
          <Inspector.Toggle
            icon={RiStrikethrough}
            disabled={isCodeBlock}
            onToggle={toggleStrike}
            tooltip="Toggle Strike"
            toggled={editor?.isActive('strike')}
          />
          <Inspector.Toggle
            icon={RiMarkPenLine}
            disabled={isCodeBlock}
            onToggle={toggleHighlight}
            tooltip="Toggle Highlight"
            toggled={editor?.isActive('highlight')}
          />
          <Inspector.Toggle
            icon={RiLink}
            onToggle={toggleLink}
            disabled={isCodeBlock}
            toggled={editor?.isActive('link')}
            tooltip={`${editor?.isActive('link') ? 'Edit' : 'Toggle'} Link`}
          />
          <Inspector.Toggle
            icon={RiDoubleQuotesR}
            onToggle={toggleQuote}
            tooltip="Toggle Quote"
            disabled={isCodeBlock}
            toggled={editor?.isActive('blockquote')}
          />
          <Inspector.Toggle
            icon={RiListUnordered}
            disabled={isCodeBlock}
            onToggle={toggleBulletList}
            tooltip="Toggle Bullet List"
            toggled={editor?.isActive('bulletList')}
          />
          <Inspector.Toggle
            icon={RiListOrdered}
            disabled={isCodeBlock}
            onToggle={toggleOrderedList}
            tooltip="Toggle Ordered List"
            toggled={editor?.isActive('orderedList')}
          />
        </Inspector.Section>
        <Inspector.Section title="Content">
          <Inspector.Toggle
            icon={RiCodeBoxLine}
            onToggle={toggleCodeBlock}
            tooltip="Toggle Code Block"
            toggled={editor?.isActive('codeBlock')}
          />
          <FileButton
            multiple
            onChange={handleImageChange}
            accept={IMAGE_SUPPORTED_TYPES}
            trigger={<Inspector.IconButton tooltip="Upload Images" icon={RiImageAddLine} />}
          />
          <Inspector.IconButton
            icon={RiSeparator}
            disabled={isCodeBlock}
            tooltip="Insert Separator"
            onPress={addHorizontalRule}
          />
        </Inspector.Section>
        {!collapsed && isNotEmpty(editorState.toc) ? (
          <Inspector.Section
            role="tree"
            title="Table of contents"
            titleClassName="pt-2 pb-1.5 px-3 mb-0"
            sectionClassName="shrink p-0 min-h-[150px]"
            className="flex-col flex-nowrap gap-1.5 overflow-y-auto px-3 pt-1 pb-3"
          >
            {editorState.toc.map((entry) => (
              <TocEntry key={entry.id} entry={entry} editor={editor} />
            ))}
          </Inspector.Section>
        ) : null}
      </Inspector>
      <FloatingButton
        icon={RiEditLine}
        className="right-2"
        onPress={toggleCollapsed}
        tooltip="Expand Inspector"
        visible={collapsed && sidebarCollapsed}
      />
    </>
  )
}

export default NoteInspector

const TocEntry: React.FC<TocEntryProps> = ({ editor, entry }) => {
  function handleClick() {
    editor?.chain().setTextSelection(entry.pos).focus().run()
  }

  const linkClasses = clst(
    'cursor-pointer hover:text-blue-500 outline-none rounded-sm truncate',
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-900 focus-visible:ring-offset-2'
  )

  return (
    <Flex
      role="treeitem"
      alignItems="center"
      className="w-full text-blue-100/90"
      style={{ paddingLeft: `calc(0.625rem * (${entry.level - 1}))` }}
    >
      <Icon icon={RiArrowDropRightFill} className="mr-0.5 mt-px shrink-0" />
      <a onClick={handleClick} href={`#${entry.id}`} className={linkClasses}>
        {entry.name}
      </a>
    </Flex>
  )
}

interface NoteInspectorProps {
  disabled?: boolean
  editor: Editor | null
  editorState: NoteEditorState
  setLinkModalOpened: React.Dispatch<React.SetStateAction<boolean>>
}

interface TocEntryProps {
  editor: Editor | null
  entry: NonNullable<NoteEditorState['toc']>[number]
}
