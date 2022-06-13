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
import { useSetAtom } from 'jotai'
import { useCallback, type DependencyList } from 'react'
import { RiErrorWarningLine } from 'react-icons/ri'

import { editorImageModalAtom } from 'atoms/togglable'
import EditorCodeBlock from 'components/editor/EditorCodeBlock'
import { CODE_BLOCK_DEFAULT_LANGUAGE } from 'constants/editor'
import useToast from 'hooks/useToast'
import { CloudinaryError, type CloudinaryTiptapNodeOptions } from 'libs/cloudinaryTiptapNode'
import { getLowlight, Cloudinary } from 'libs/editor'
import { type A11yImageParams } from 'libs/image'
import { trpc } from 'libs/trpc'
import clst from 'styles/clst'
import styles from 'styles/Editor.module.css'

export { EditorContent, type EditorEvents } from '@tiptap/react'

const defaultExtensions: Extensions = [
  Highlight,
  Strike,
  Link,
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(EditorCodeBlock)
    },
  }).configure({
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
  const setEditorImageModal = useSetAtom(editorImageModalAtom)

  const { mutateAsync } = trpc.useMutation(['image.add'])

  const { className, contentId, extensions, setLinkModalOpened, spellcheck, starterKitOptions, ...editorOptions } =
    options

  const editorClasses = clst(styles.editor, className)

  const handleImageDoubleClick = useCallback(
    (params: A11yImageParams) => {
      setEditorImageModal({ ...params, opened: true })
    },
    [setEditorImageModal]
  )

  const handleUploadError = useCallback(
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
        {
          onImageDoubleClick: handleImageDoubleClick,
          onUploadError: handleUploadError,
          referenceId: contentId,
          upload: mutateAsync,
        },
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
  cloudinaryOptions: CloudinaryTiptapNodeOptions,
  extensions: Extensions = [],
  setLinkModalOpened?: React.Dispatch<React.SetStateAction<boolean>>
): Extensions {
  return [
    StarterKit.configure(starterKitOptions),
    ...defaultExtensions.map((extension) => {
      if (extension.name === 'link') {
        return extension.extend({
          addKeyboardShortcuts() {
            return {
              'Mod-k': () => {
                if (!setLinkModalOpened) {
                  return false
                }

                setLinkModalOpened((prevLinkModalOpened) => !prevLinkModalOpened)

                return true
              },
              'Alt-Enter': () => {
                const { $from } = this.editor.view.state.selection

                const linkMark = this.editor.view.state.schema.marks.link.isInSet($from.marks())

                if (!linkMark?.attrs?.href) {
                  return false
                }

                window.open(linkMark.attrs.href)

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

interface UseEditorOptions extends Partial<Omit<EditorOptions, 'editorProps'>> {
  className?: string
  contentId?: string
  setLinkModalOpened?: React.Dispatch<React.SetStateAction<boolean>>
  spellcheck?: string
  starterKitOptions?: StarterKitOptions
}
