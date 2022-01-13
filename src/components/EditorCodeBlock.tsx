import { type NodeViewProps, NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { useEffect, useState } from 'react'

import Select from 'components/Select'
import { getLanguageName } from 'libs/lowlight'

export const CODE_BLOCK_DEFAULT_LANGUAGE = 'plaintext'

const EditorCodeBlock: React.FC<NodeViewProps> = ({ editor, extension, node, updateAttributes }) => {
  const [tabIndex, setTabIndex] = useState<-1 | undefined>(-1)

  const languages = extension.options.lowlight.listLanguages()

  function onChangeLanguage(language: string) {
    updateAttributes({ language })
  }

  useEffect(() => {
    function onSelectionUpdate() {
      setTabIndex(editor?.isActive('codeBlock') ? undefined : -1)
    }

    editor.on('selectionUpdate', onSelectionUpdate)

    return () => {
      editor.off('selectionUpdate', onSelectionUpdate)
    }
  }, [editor])

  return (
    <NodeViewWrapper className="code-block relative">
      <Select
        items={languages}
        tabIndex={tabIndex}
        onChange={onChangeLanguage}
        itemToString={getLanguageName}
        className="absolute top-1 right-1"
        menuClassName="rounded text-xs bg-zinc-500"
        triggerPressedClassName="bg-zinc-300/50 hover:bg-zinc-300/50"
        defaultItem={node.attrs.language ?? CODE_BLOCK_DEFAULT_LANGUAGE}
        triggerClassName="shadow-none bg-zinc-500/50 hover:bg-zinc-400/50 px-2 py-1 text-xs rounded min-w-0 w-28"
      />
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

export default EditorCodeBlock
