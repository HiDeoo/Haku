import { type Editor } from '@tiptap/react'
import { useAtomValue, useSetAtom } from 'jotai/react'
import IconArrowDropRightFill from '~icons/ri/arrow-drop-right-fill'
import IconArrowGoBackLine from '~icons/ri/arrow-go-back-line'
import IconArrowGoForwardLine from '~icons/ri/arrow-go-forward-line'
import IconBold from '~icons/ri/bold'
import IconCodeBoxLine from '~icons/ri/code-box-line'
import IconCodeLine from '~icons/ri/code-line'
import IconDoubleQuotesR from '~icons/ri/double-quotes-r'
import IconEditLine from '~icons/ri/edit-line'
import IconFormatClear from '~icons/ri/format-clear'
import IconH1 from '~icons/ri/h-1'
import IconH2 from '~icons/ri/h-2'
import IconH3 from '~icons/ri/h-3'
import IconH4 from '~icons/ri/h-4'
import IconH5 from '~icons/ri/h-5'
import IconH6 from '~icons/ri/h-6'
import IconHeading from '~icons/ri/heading'
import IconImageAddLine from '~icons/ri/image-add-line'
import IconItalic from '~icons/ri/italic'
import IconLink from '~icons/ri/link'
import IconListOrdered from '~icons/ri/list-ordered'
import IconListUnordered from '~icons/ri/list-unordered'
import IconMarkPenLine from '~icons/ri/mark-pen-line'
import IconMenuFoldLine from '~icons/ri/menu-fold-line'
import IconMenuUnfoldLine from '~icons/ri/menu-unfold-line'
import IconSeparator from '~icons/ri/separator'
import IconStrikethrough from '~icons/ri/strikethrough'

import { noteInspectorCollapsedAtom, sidebarCollapsedAtom, toggleNoteInspectorCollapsedAtom } from 'atoms/collapsible'
import { EditorSyntaxModal } from 'components/editor/EditorSyntaxModal'
import { FileButton } from 'components/form/FileButton'
import { IconButton } from 'components/form/IconButton'
import { type NoteEditorState } from 'components/note/Note'
import { Flex } from 'components/ui/Flex'
import { FloatingButton } from 'components/ui/FloatingButton'
import { Icon } from 'components/ui/Icon'
import { Inspector } from 'components/ui/Inspector'
import { IMAGE_SUPPORTED_TYPES } from 'constants/image'
import { isNotEmpty } from 'libs/array'
import { clst } from 'styles/clst'

export const NoteInspector = ({ disabled, editor, editorState, setLinkModalOpened }: NoteInspectorProps) => {
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

  const isHeading = isH1 ?? isH2 ?? isH3 ?? isH4 ?? isH5 ?? isH6
  const headingMenuIcon = isH1
    ? IconH1
    : isH2
    ? IconH2
    : isH3
    ? IconH3
    : isH4
    ? IconH4
    : isH5
    ? IconH5
    : isH6
    ? IconH6
    : IconHeading

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
              icon={collapsed ? IconMenuFoldLine : IconMenuUnfoldLine}
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
            icon={IconArrowGoBackLine}
            disabled={!editor?.can().undo()}
          />
          <Inspector.IconButton
            tooltip="Redo"
            onPress={redo}
            icon={IconArrowGoForwardLine}
            disabled={!editor?.can().redo()}
          />
          <Inspector.IconButton tooltip="Clear Format" onPress={clearFormat} icon={IconFormatClear} />
          <EditorSyntaxModal />
        </Inspector.Section>
        <Inspector.Section title="Text">
          <Inspector.IconMenu
            toggled={isHeading}
            icon={headingMenuIcon}
            disabled={isCodeBlock}
            tooltip="Toggle Heading"
          >
            <Inspector.IconMenuItem icon={IconH1} onClick={() => toggleHeading(1)} />
            <Inspector.IconMenuItem icon={IconH2} onClick={() => toggleHeading(2)} />
            <Inspector.IconMenuItem icon={IconH3} onClick={() => toggleHeading(3)} />
            <Inspector.IconMenuItem icon={IconH4} onClick={() => toggleHeading(4)} />
            <Inspector.IconMenuItem icon={IconH5} onClick={() => toggleHeading(5)} />
            <Inspector.IconMenuItem icon={IconH6} onClick={() => toggleHeading(6)} />
          </Inspector.IconMenu>
          <Inspector.Toggle
            icon={IconBold}
            onToggle={toggleBold}
            tooltip="Toggle Bold"
            disabled={isCodeBlock}
            toggled={editor?.isActive('bold')}
          />
          <Inspector.Toggle
            icon={IconItalic}
            disabled={isCodeBlock}
            onToggle={toggleItalic}
            tooltip="Toggle Italic"
            toggled={editor?.isActive('italic')}
          />
          <Inspector.Toggle
            icon={IconCodeLine}
            onToggle={toggleCode}
            tooltip="Toggle Code"
            disabled={isCodeBlock}
            toggled={editor?.isActive('code')}
          />
          <Inspector.Toggle
            icon={IconStrikethrough}
            disabled={isCodeBlock}
            onToggle={toggleStrike}
            tooltip="Toggle Strike"
            toggled={editor?.isActive('strike')}
          />
          <Inspector.Toggle
            icon={IconMarkPenLine}
            disabled={isCodeBlock}
            onToggle={toggleHighlight}
            tooltip="Toggle Highlight"
            toggled={editor?.isActive('highlight')}
          />
          <Inspector.Toggle
            icon={IconLink}
            onToggle={toggleLink}
            disabled={isCodeBlock}
            toggled={editor?.isActive('link')}
            tooltip={`${editor?.isActive('link') ? 'Edit' : 'Toggle'} Link`}
          />
          <Inspector.Toggle
            icon={IconDoubleQuotesR}
            onToggle={toggleQuote}
            tooltip="Toggle Quote"
            disabled={isCodeBlock}
            toggled={editor?.isActive('blockquote')}
          />
          <Inspector.Toggle
            icon={IconListUnordered}
            disabled={isCodeBlock}
            onToggle={toggleBulletList}
            tooltip="Toggle Bullet List"
            toggled={editor?.isActive('bulletList')}
          />
          <Inspector.Toggle
            icon={IconListOrdered}
            disabled={isCodeBlock}
            onToggle={toggleOrderedList}
            tooltip="Toggle Ordered List"
            toggled={editor?.isActive('orderedList')}
          />
        </Inspector.Section>
        <Inspector.Section title="Content">
          <Inspector.Toggle
            icon={IconCodeBoxLine}
            onToggle={toggleCodeBlock}
            tooltip="Toggle Code Block"
            toggled={editor?.isActive('codeBlock')}
          />
          <FileButton
            multiple
            onChange={handleImageChange}
            accept={IMAGE_SUPPORTED_TYPES}
            trigger={<Inspector.IconButton tooltip="Upload Images" icon={IconImageAddLine} />}
          />
          <Inspector.IconButton
            icon={IconSeparator}
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
        icon={IconEditLine}
        className="right-2"
        onPress={toggleCollapsed}
        tooltip="Expand Inspector"
        visible={collapsed && sidebarCollapsed}
      />
    </>
  )
}

const TocEntry = ({ editor, entry }: TocEntryProps) => {
  function handleClick() {
    editor?.chain().setTextSelection(entry.pos).focus().run()
  }

  const linkClasses = clst(
    'cursor-pointer text-zinc-300 hover:text-blue-500 outline-none rounded-sm truncate',
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-900 focus-visible:ring-offset-2'
  )

  return (
    <Flex
      role="treeitem"
      className="w-full"
      alignItems="center"
      style={{ paddingLeft: `calc(0.625rem * (${entry.level - 1}))` }}
    >
      <Icon icon={IconArrowDropRightFill} className="mr-0.5 mt-px shrink-0" />
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
