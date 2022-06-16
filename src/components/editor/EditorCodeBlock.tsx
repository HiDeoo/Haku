import { type NodeViewProps, NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { useEffect, useRef } from 'react'

import ClipboardCopyButton from 'components/form/ClipboardCopyButton'
import Select from 'components/form/Select'
import { CODE_BLOCK_DEFAULT_LANGUAGE } from 'constants/editor'
import { getLanguageName } from 'libs/editor'

const triggerClases =
  'shadow-none bg-zinc-700 hover:bg-zinc-600 px-2 py-1 text-xs rounded min-w-0 w-28 rounded-b-none z-10'

const EditorCodeBlock: React.FC<NodeViewProps> = ({ editor, extension, node, updateAttributes }) => {
  const wrapper = useRef<HTMLDivElement>()
  const languageSelect = useRef<HTMLButtonElement>(null)
  const copySelect = useRef<HTMLButtonElement>(null)

  const languages = extension.options.lowlight.listLanguages()

  function handleLanguageChange(language: string) {
    updateAttributes({ language })
  }

  useEffect(() => {
    function handleKeyDown(event: Event) {
      if (
        event instanceof KeyboardEvent &&
        event.key === 'Tab' &&
        !event.shiftKey &&
        editor.isActive('codeBlock') &&
        node.eq(editor.state.selection.$head.parent)
      ) {
        event.preventDefault()

        languageSelect.current?.focus()
      }
    }

    editor.view.dom.addEventListener('keydown', handleKeyDown)

    return () => {
      editor.view.dom.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, node])

  function handleSelectKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault()

      copySelect.current?.focus()
    }
  }

  return (
    <NodeViewWrapper className="code-block relative" ref={wrapper}>
      <Select
        ref={languageSelect}
        tabIndex={-1}
        items={languages}
        itemToString={getLanguageName}
        onChange={handleLanguageChange}
        triggerClassName={triggerClases}
        onButtonKeyDown={handleSelectKeyDown}
        className="absolute bottom-full right-0"
        triggerPressedClassName="bg-zinc-500 hover:bg-zinc-500"
        defaultItem={node.attrs.language ?? CODE_BLOCK_DEFAULT_LANGUAGE}
        menuClassName="rounded text-xs bg-zinc-600 -mt-0.5 rounded-t-none"
      />
      <ClipboardCopyButton
        tabIndex={-1}
        ref={copySelect}
        content={node.textContent}
        className="absolute bottom-0 right-0 rounded-tr-none rounded-bl-none hover:bg-zinc-600 hover:text-white"
      />
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

export default EditorCodeBlock
