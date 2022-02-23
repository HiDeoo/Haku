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

import EditorCodeBlock from 'components/editor/EditorCodeBlock'
import { CODE_BLOCK_DEFAULT_LANGUAGE } from 'constants/editor'
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
  const { className, extensions, setLinkModalOpened, spellcheck, starterKitOptions, ...editorOptions } = options

  const editorClasses = clst(styles.editor, className)

  const editor = useTipTap(
    {
      ...editorOptions,
      editorProps: { attributes: { class: editorClasses, spellcheck: spellcheck ?? 'false' } },
      extensions: getExtensions(starterKitOptions, extensions, setLinkModalOpened),
    },
    deps
  )

  return editor
}

function getExtensions(
  starterKitOptions: Partial<StarterKitOptions> = { codeBlock: false, strike: false },
  extensions: Extensions = [],
  setLinkModalOpened?: React.Dispatch<React.SetStateAction<boolean>>
): Extensions {
  return [
    StarterKit.configure(starterKitOptions),
    ...defaultExtensions.map((extension) => {
      if (extension.name === 'link' && setLinkModalOpened) {
        return extension.extend({
          addKeyboardShortcuts() {
            return {
              'Mod-k': () => {
                setLinkModalOpened((prevLinkModalOpened) => !prevLinkModalOpened)

                return true
              },
            }
          },
        })
      }

      return extension
    }),
    ...extensions,
  ]
}

function addCodeBlockLowlightNodeView() {
  return ReactNodeViewRenderer(EditorCodeBlock)
}

interface UseEditorOptions extends Partial<Omit<EditorOptions, 'editorProps'>> {
  className?: string
  setLinkModalOpened?: React.Dispatch<React.SetStateAction<boolean>>
  spellcheck?: string
  starterKitOptions?: StarterKitOptions
}
