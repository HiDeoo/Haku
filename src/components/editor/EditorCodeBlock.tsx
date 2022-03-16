import { type NodeViewProps, NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { useEffect, useState } from 'react'

import Select from 'components/form/Select'
import { CODE_BLOCK_DEFAULT_LANGUAGE } from 'constants/editor'
import { getLanguageName } from 'libs/editor'

const triggerClases = 'shadow-none bg-zinc-700 hover:bg-zinc-600 px-2 py-1 text-xs rounded min-w-0 w-28 rounded-b-none'

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
        className="absolute bottom-full right-0"
        triggerPressedClassName="bg-zinc-500 hover:bg-zinc-400"
        defaultItem={node.attrs.language ?? CODE_BLOCK_DEFAULT_LANGUAGE}
        menuClassName="rounded text-xs bg-zinc-600 -mt-0.5 rounded-t-none"
        triggerClassName={triggerClases}
      />
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

export default EditorCodeBlock
