import { type CodeBlockLowlightOptions } from '@tiptap/extension-code-block-lowlight'
import { type NodeView, type Extension, NodeViewContent, NodeViewWrapper } from '@tiptap/react'

import Select from 'components/Select'

export const CODE_BLOCK_DEFAULT_LANGUAGE = 'plaintext'

const EditorCodeBlock: React.FC<EditorCodeBlockProps> = ({ extension, node, updateAttributes }) => {
  const languages = extension.options.lowlight.listLanguages()

  function onChangeLanguage(language: string) {
    updateAttributes({ language })
  }

  return (
    <NodeViewWrapper className="code-block relative">
      <Select
        items={languages}
        onChange={onChangeLanguage}
        menuClassName="rounded text-xs"
        itemToString={getLanguageLabel}
        className="absolute top-1 right-1"
        triggerPressedClassName="bg-zinc-300 hover:bg-zinc-300"
        defaultItem={node.attrs.language ?? CODE_BLOCK_DEFAULT_LANGUAGE}
        triggerClassName="shadow-none bg-zinc-500 hover:bg-zinc-400 px-2 py-1 text-xs rounded min-w-0 w-28"
      />
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

export default EditorCodeBlock

// TODO(HiDeoo)
function getLanguageLabel(language?: string | null) {
  return language ?? CODE_BLOCK_DEFAULT_LANGUAGE
}

interface EditorCodeBlockProps {
  extension: Extension<CodeBlockLowlightOptions>
  node: NodeView<typeof EditorCodeBlock>['node']
  updateAttributes: NodeView<typeof EditorCodeBlock>['updateAttributes']
}
