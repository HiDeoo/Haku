import { useState } from 'react'
import { RiQuestionMark } from 'react-icons/ri'

import { Inspector } from 'components/ui/Inspector'
import { Modal } from 'components/ui/Modal'
import { Table } from 'components/ui/Table'
import { clst } from 'styles/clst'
import styles from 'styles/Editor.module.css'

export const EditorSyntaxModal: React.FC = () => {
  const [opened, setOpened] = useState(false)

  return (
    <Modal
      opened={opened}
      className="pb-1"
      title="Syntax Help"
      onOpenChange={setOpened}
      trigger={<Inspector.IconButton tooltip="Syntax Help" icon={RiQuestionMark} />}
      contentClassName="xs:min-w-[unset] xs:max-w-[unset] xs:w-[60vw] xs:max-w-4xl"
    >
      <EditorSyntaxSection title="Headings">
        Headings can be created using one to six <EditorSyntaxCode code="#" /> symbols before the heading text. The size
        of the heading is determined by the number of <EditorSyntaxCode code="#" /> symbols.
        <EditorSyntaxCode
          type="block"
          code={`# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`}
        />
        <EditorSyntaxOutput type="block">
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6 className="!mb-0">Heading 6</h6>
        </EditorSyntaxOutput>
      </EditorSyntaxSection>
      <EditorSyntaxSection title="Styles">
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Style</Table.Cell>
              <Table.Cell>Syntax</Table.Cell>
              <Table.Cell>Example</Table.Cell>
              <Table.Cell>Output</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Bold</Table.Cell>
              <Table.Cell>
                <EditorSyntaxCode code="**" /> or <EditorSyntaxCode code="__" />
              </Table.Cell>
              <Table.Cell>
                <EditorSyntaxCode code="**bold text**" />
              </Table.Cell>
              <Table.Cell>
                <EditorSyntaxOutput>
                  <strong>bold text</strong>
                </EditorSyntaxOutput>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Italic</Table.Cell>
              <Table.Cell>
                <EditorSyntaxCode code="*" /> or <EditorSyntaxCode code="_" />
              </Table.Cell>
              <Table.Cell>
                <EditorSyntaxCode code="*italic text*" />
              </Table.Cell>
              <Table.Cell>
                <EditorSyntaxOutput>
                  <em>italic text</em>
                </EditorSyntaxOutput>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell className="break-all">Strikethrough</Table.Cell>
              <Table.Cell>
                <EditorSyntaxCode code="~~" />
              </Table.Cell>
              <Table.Cell className="break-all">
                <EditorSyntaxCode code="~~strikethrough text~~" />
              </Table.Cell>
              <Table.Cell className="break-all">
                <EditorSyntaxOutput>
                  <s>strikethrough text</s>
                </EditorSyntaxOutput>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Highlight</Table.Cell>
              <Table.Cell>
                <EditorSyntaxCode code="==" />
              </Table.Cell>
              <Table.Cell>
                <EditorSyntaxCode code="==highlight text==" />
              </Table.Cell>
              <Table.Cell>
                <EditorSyntaxOutput>
                  <mark>highlight text</mark>
                </EditorSyntaxOutput>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </EditorSyntaxSection>
      <EditorSyntaxSection title="Links">
        Just paste a URL to automatically create a link. If you have text selected, the selection is transformed into a
        link.
        <EditorSyntaxOutput type="block">
          <a href="https://github.com/HiDeoo/Haku" target="_blank" rel="noreferrer">
            Haku
          </a>
        </EditorSyntaxOutput>
      </EditorSyntaxSection>
      <EditorSyntaxSection title="Images">
        Just paste or drag an image to automatically upload it. The image will be automatically resized appropriately
        but you can double-click on it to open the original image.
        <EditorSyntaxOutput type="block">
          <img src="/images/icons/favicon.svg" className="h-20 w-20" alt="Haku application icon" />
        </EditorSyntaxOutput>
      </EditorSyntaxSection>
      <EditorSyntaxSection title="Code">
        You can wrap code in a sentence with single backticks.
        <EditorSyntaxCode type="block" code="Use `command` to do the thing." />
        <EditorSyntaxOutput type="block">
          Use <code>command</code> to do the thing.
        </EditorSyntaxOutput>
        To create a fenced code block, use triple backticks <EditorSyntaxCode code="```" />. You can also specify an
        optional language identifier to a distinct code block to enable syntax highlighting, e.g.,{' '}
        <EditorSyntaxCode code="```ts" />.
        <EditorSyntaxOutput type="block">
          Use the following code to do the thing:
          <pre className="!mt-3">
            <code>
              <span className="hljs-keyword">if</span> (<span className="hljs-string">{`'a'`}</span>
              {` === `}
              <span className="hljs-string">{`'b'`}</span>) {'{'}
              <br />
              <span className="hljs-keyword">{'  '}throw </span>
              <span className="hljs-keyword">new </span>
              <span className="hljs-title class_">Error</span>(<span className="hljs-string">{`'invalid'`}</span>
              );
              <br />
              {'}'}
            </code>
          </pre>
        </EditorSyntaxOutput>
      </EditorSyntaxSection>
      <EditorSyntaxSection title="Lists">
        To start an unordered list, precede each line with a <EditorSyntaxCode code="-" /> or{' '}
        <EditorSyntaxCode code="#" /> symbol.
        <EditorSyntaxCode
          type="block"
          code={`- item 1
- item 2`}
        />
        <EditorSyntaxOutput type="block">
          <ul>
            <li>item 1</li>
            <li>item 2</li>
          </ul>
        </EditorSyntaxOutput>
        For an ordered list, use a number followed by a dot.
        <EditorSyntaxCode
          type="block"
          code={`1. item 1
2. item 2`}
        />
        <EditorSyntaxOutput type="block">
          <ol>
            <li>item 1</li>
            <li>item 2</li>
          </ol>
        </EditorSyntaxOutput>
        Adding a new line while in a list will automatically create a new list item. Indenting a list item will create a
        nested list.
        <EditorSyntaxCode
          type="block"
          code={`- item 1
- item 2
    - item 2.1
        1. item 2.1.1`}
        />
        <EditorSyntaxOutput type="block">
          <ul>
            <li>item 1</li>
            <li>
              item 2
              <ul>
                <li>
                  item 2.1
                  <ol>
                    <li>item 2.1.1</li>
                  </ol>
                </li>
              </ul>
            </li>
          </ul>
        </EditorSyntaxOutput>
      </EditorSyntaxSection>
      <EditorSyntaxSection title="Quotes">
        Use the <EditorSyntaxCode code=">" /> symbol to quote text.
        <EditorSyntaxCode type="block" code="> I said an amazing joke." />
        <EditorSyntaxOutput type="block">
          <blockquote>I said an amazing joke.</blockquote>
        </EditorSyntaxOutput>
        To highlight a quote, use bold text on the first line:
        <EditorSyntaxCode type="block" code="> **Note**" />
        <EditorSyntaxOutput type="block">
          <blockquote>
            <p>
              <strong>Note</strong>
            </p>
            This is an important note.
          </blockquote>
        </EditorSyntaxOutput>
      </EditorSyntaxSection>
    </Modal>
  )
}

const EditorSyntaxSection: React.FC<EditorSyntaxSectionProps> = ({ children, title }) => {
  return (
    <>
      <h3 className="mt-5 mb-3 text-lg font-semibold first:mt-0">{title}</h3>
      <div>{children}</div>
    </>
  )
}

const EditorSyntaxCode: React.FC<EditorSyntaxCodeProps> = ({ code, type = 'inline' }) => {
  const isInline = type === 'inline'

  const codeClasses = clst('rounded font-sans whitespace-pre-wrap', isInline && 'bg-zinc-600/75 px-[0.2rem] py-px')

  const highlight = <code className={codeClasses}>{code}</code>

  return isInline ? highlight : <pre className="mt-4 rounded bg-zinc-700/50 px-2 py-1.5">{highlight}</pre>
}

const EditorSyntaxOutput: React.FC<EditorSyntaxOutputProps> = ({ children, type = 'inline' }) => {
  const outputClasses = clst(
    styles.editor,
    type === 'inline'
      ? 'inline-block px-[0.2rem] py-px'
      : 'rounded bg-zinc-700/50 my-4 px-2 py-1.5 [&>blockquote>p]:mt-0'
  )

  return <div className={outputClasses}>{children}</div>
}

interface EditorSyntaxSectionProps {
  children: React.ReactNode
  title: string
}

interface EditorSyntaxCodeProps {
  code: string
  type?: 'inline' | 'block'
}

interface EditorSyntaxOutputProps {
  children: React.ReactNode
  type?: 'inline' | 'block'
}
