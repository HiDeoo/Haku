import { Editor } from '@tiptap/react'
import { useState } from 'react'
import {
  RiArrowDropRightFill,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBold,
  RiCodeBoxLine,
  RiCodeLine,
  RiDoubleQuotesR,
  RiFormatClear,
  RiH1,
  RiH2,
  RiH3,
  RiH4,
  RiH5,
  RiH6,
  RiHeading,
  RiItalic,
  RiLink,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiSeparator,
  RiStrikethrough,
} from 'react-icons/ri'

import Inspector from 'components/Inspector'
import EditorLinkModal from 'components/EditorLinkModal'
import Flex from 'components/Flex'
import Icon from 'components/Icon'
import { type EditorState } from 'components/Note'
import useContentMutation from 'hooks/useContentMutation'
import { type NoteData } from 'libs/db/note'
import clst from 'styles/clst'

const NoteInspector: React.FC<NoteInspectorProps> = ({ disabled, editor, editorState, noteId, onMutation }) => {
  const [linkModalOpened, setLinkModalOpened] = useState(false)

  const { isLoading, mutate } = useContentMutation()

  const inspectorDisabled = disabled || isLoading

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

  function save() {
    if (!editor || !noteId) {
      return
    }

    editor.setEditable(false)

    const html = editor.getHTML()
    const text = editor.getText()

    mutate({ action: 'update', id: noteId, html, text }, { onSettled: onSettledMutation })
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

  function onSettledMutation(_: unknown, error: unknown) {
    editor?.setEditable(true)
    editor?.commands.focus()

    onMutation(error)
  }

  const syncText = editorState.lastSync ? `Synced at ${editorState.lastSync.toLocaleTimeString()}` : 'Sync issue'
  const syncClasses = clst('grow text-xs italic', {
    hidden: (!editorState.error && !editorState.lastSync) || isLoading,
    'text-zinc-500': editorState.lastSync,
    'text-red-500 font-semibold': editorState.error,
  })

  return (
    <>
      <Inspector disabled={inspectorDisabled}>
        <Inspector.Section className="gap-y-[0.3125rem]">
          <Inspector.Button onPress={save} primary loading={isLoading} disabled={editorState.pristine}>
            Save
          </Inspector.Button>
          <div className={syncClasses}>{syncText}</div>
          <div className="h-0 basis-full" />
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
            tooltip="Toggle Link"
            disabled={isCodeBlock}
            toggled={editor?.isActive('link')}
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
          <Inspector.IconButton
            icon={RiSeparator}
            disabled={isCodeBlock}
            tooltip="Insert Separator"
            onPress={addHorizontalRule}
          />
          <Inspector.Toggle
            icon={RiCodeBoxLine}
            onToggle={toggleCodeBlock}
            tooltip="Toggle Code Block"
            toggled={editor?.isActive('codeBlock')}
          />
        </Inspector.Section>
        {editorState.toc && editorState.toc.length > 0 ? (
          <Inspector.Section
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
      <EditorLinkModal opened={linkModalOpened} onOpenChange={setLinkModalOpened} title="Link" editor={editor} />
    </>
  )
}

export default NoteInspector

const TocEntry: React.FC<TocEntryProps> = ({ editor, entry }) => {
  function onClick() {
    editor?.chain().setTextSelection(entry.pos).focus().run()
  }

  const linkClasses = clst(
    'cursor-pointer hover:text-blue-500 outline-none rounded-sm truncate',
    'focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-zinc-900 focus-visible:ring-offset-2'
  )

  return (
    <Flex
      alignItems="center"
      className="w-full text-blue-100/90"
      style={{ paddingLeft: `calc(0.625rem * (${entry.level - 1}))` }}
    >
      <Icon icon={RiArrowDropRightFill} className="mr-0.5 mt-px shrink-0" />
      <a onClick={onClick} href={`#${entry.id}`} className={linkClasses}>
        {entry.name}
      </a>
    </Flex>
  )
}

interface NoteInspectorProps {
  disabled?: boolean
  editor: Editor | null
  editorState: EditorState
  noteId?: NoteData['id']
  onMutation: (error?: unknown) => void
}

interface TocEntryProps {
  editor: Editor | null
  entry: NonNullable<EditorState['toc']>[number]
}
