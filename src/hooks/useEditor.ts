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
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, type DependencyList } from 'react'
import { RiErrorWarningLine } from 'react-icons/ri'

import { imageModalAtom } from 'atoms/modal'
import EditorCodeBlock from 'components/editor/EditorCodeBlock'
import { CODE_BLOCK_DEFAULT_LANGUAGE } from 'constants/editor'
import useToast from 'hooks/useToast'
import { CloudinaryError, type CloudinaryTiptapNodeOptions } from 'libs/cloudinaryTiptapNode'
import { getLowlight, Cloudinary } from 'libs/editor'
import { type A11yImageParams } from 'libs/image'
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

const starterKitDefaultOptions: Partial<StarterKitOptions> = {
  codeBlock: false,
  strike: false,
  dropcursor: {
    color: 'var(--editor-caret-color)',
  },
}

export function useEditor(options: UseEditorOptions, deps?: DependencyList): Editor | null {
  const { addToast } = useToast()
  const setImageModal = useUpdateAtom(imageModalAtom)

  const { className, contentId, extensions, setLinkModalOpened, spellcheck, starterKitOptions, ...editorOptions } =
    options

  const editorClasses = clst(styles.editor, className)

  const onImageDoubleClick = useCallback(
    (params: A11yImageParams) => {
      setImageModal({ ...params, opened: true })
    },
    [setImageModal]
  )

  const onUploadError = useCallback(
    (error: CloudinaryError) => {
      addToast({
        details: error.details,
        icon: RiErrorWarningLine,
        text: error.message,
        type: 'foreground',
      })
    },
    [addToast]
  )

  const editor = useTipTap(
    {
      ...editorOptions,
      editorProps: { attributes: { class: editorClasses, spellcheck: spellcheck ?? 'false' } },
      extensions: getExtensions(
        starterKitOptions,
        { onImageDoubleClick, onUploadError, referenceId: contentId },
        extensions,
        setLinkModalOpened
      ),
    },
    deps
  )

  return editor
}

function getExtensions(
  starterKitOptions = starterKitDefaultOptions,
  cloudinaryOptions: CloudinaryTiptapNodeOptions = {},
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
    Cloudinary(cloudinaryOptions),
    ...extensions,
  ]
}

function addCodeBlockLowlightNodeView() {
  return ReactNodeViewRenderer(EditorCodeBlock)
}

interface UseEditorOptions extends Partial<Omit<EditorOptions, 'editorProps'>> {
  className?: string
  contentId?: string
  setLinkModalOpened?: React.Dispatch<React.SetStateAction<boolean>>
  spellcheck?: string
  starterKitOptions?: StarterKitOptions
}
