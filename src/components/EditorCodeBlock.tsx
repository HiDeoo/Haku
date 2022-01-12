import { type CodeBlockLowlightOptions } from '@tiptap/extension-code-block-lowlight'
import { type NodeView, type Extension, NodeViewContent, NodeViewWrapper } from '@tiptap/react'

const EditorCodeBlock: React.FC<EditorCodeBlockProps> = ({ extension, updateAttributes }) => {
  // TODO(HiDeoo)
  function test(event: any) {
    console.log('event.target.value ', event.target.value)
    updateAttributes({ language: event.target.value })
  }

  return (
    <NodeViewWrapper className="code-block">
      <select contentEditable={false} className="text-black" onChange={test}>
        <option value="null">auto</option>
        <option disabled>—</option>
        {extension.options.lowlight.listLanguages().map((lang: string, index: number) => (
          <option key={index} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

export default EditorCodeBlock

interface EditorCodeBlockProps {
  extension: Extension<CodeBlockLowlightOptions>
  updateAttributes: NodeView<typeof EditorCodeBlock>['updateAttributes']
}
