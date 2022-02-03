import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Strike from '@tiptap/extension-strike'
import {
  type Editor,
  type EditorOptions,
  type Extensions,
  useEditor as useTipTap,
  ReactNodeViewRenderer,
} from '@tiptap/react'
import StarterKit, { type StarterKitOptions } from '@tiptap/starter-kit'
import { type DependencyList } from 'react'

import EditorCodeBlock, { CODE_BLOCK_DEFAULT_LANGUAGE } from 'components/EditorCodeBlock'
import { getLowlight } from 'libs/editor'
import clst from 'styles/clst'
import styles from 'styles/Editor.module.css'

export { EditorContent, type EditorEvents } from '@tiptap/react'

const defaultExtensions: Extensions = [
  Highlight,
  Strike,
  Link,
  CodeBlockLowlight.extend({ addNodeView: addCodeBlockLowlightNodeView }).configure({
    defaultLanguage: CODE_BLOCK_DEFAULT_LANGUAGE,
    lowlight: getLowlight(),
  }),
]

export function useEditor(options: UseEditorOptions, deps?: DependencyList): Editor | null {
  const { className, extensions, spellcheck, starterKitOptions, ...editorOptions } = options

  const editorClasses = clst(className, styles.editor)

  const editor = useTipTap(
    {
      ...editorOptions,
      editorProps: { attributes: { class: editorClasses, spellcheck: spellcheck ?? 'false' } },
      extensions: getExtensions(starterKitOptions, extensions),
    },
    deps
  )

  return editor
}

function getExtensions(
  starterKitOptions: Partial<StarterKitOptions> = { codeBlock: false, strike: false },
  extensions: Extensions = []
): Extensions {
  return [StarterKit.configure(starterKitOptions), ...defaultExtensions, ...extensions]
}

function addCodeBlockLowlightNodeView() {
  return ReactNodeViewRenderer(EditorCodeBlock)
}

interface UseEditorOptions extends Partial<Omit<EditorOptions, 'editorProps'>> {
  className?: string
  spellcheck?: string
  starterKitOptions?: StarterKitOptions
}
