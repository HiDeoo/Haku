import { type Editor } from '@tiptap/core'
import { Node } from '@tiptap/react'
import cuid from 'cuid'
import { Plugin } from 'prosemirror-state'

const tiptapNodeName = 'imagekit-image'

export function ImageKitTiptapNode(options: ImageKitTiptapNodeOptions) {
  return Node.create({
    name: tiptapNodeName,
    addAttributes() {
      return {
        id: {
          default: null,
        },
        pending: {
          default: false,
        },
        src: {
          default: null,
        },
      }
    },
    addProseMirrorPlugins() {
      return [imageKitProseMirrorPlugin(this.editor, options)]
    },
    group() {
      return 'block'
    },
    parseHTML: () => [
      {
        tag: 'img[src]',
        getAttrs(element) {
          if (!(element instanceof HTMLImageElement)) {
            return false
          }

          return {
            src: element.getAttribute('src'),
          }
        },
      },
    ],
    renderHTML({ HTMLAttributes }) {
      if (HTMLAttributes.pending) {
        // TODO(HiDeoo) Show the file name
        // TODO(HiDeoo) Custom style during upload
        return ['div', {}, 'Uploading…']
      }

      return ['img', { src: HTMLAttributes.src }]
    },
  })
}

function imageKitProseMirrorPlugin(editor: Editor, options: ImageKitTiptapNodeOptions) {
  return new Plugin({
    props: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || [])

        if (!items.every((item) => item.type.startsWith('image/'))) {
          return false
        }

        const position = view.state.selection.from

        if (!view.state.tr.selection.empty) {
          view.dispatch(view.state.tr.deleteSelection())
        }

        let uploadStarted = false
        const uploadQueue: UploadQueue = new Set()

        for (let index = items.length; index >= 0; index--) {
          const image = items[index]?.getAsFile()

          if (!image) {
            continue
          }

          if (!uploadStarted) {
            uploadStarted = true

            editor.setEditable(false)
          }

          const id = cuid()
          const node = view.state.schema.nodes[tiptapNodeName].create({ id, pending: true })

          view.dispatch(view.state.tr.replaceWith(position, position, node))

          uploadQueue.add(id)

          uploadImageToEditor(editor, options, uploadQueue, image, id)
        }

        return true
      },
    },
  })
}

async function uploadImageToEditor(
  editor: Editor,
  options: ImageKitTiptapNodeOptions,
  uploadQueue: UploadQueue,
  image: File,
  id: string
) {
  try {
    const src = await upload(image)

    const position = getImageKitNodePositionWithId(editor, id)

    if (position) {
      const transaction = editor.view.state.tr.setMeta('addToHistory', false)

      editor.view.dispatch(transaction.setNodeMarkup(position, undefined, { pending: false, src }))
    }

    uploadQueue.delete(id)
  } catch (error) {
    const position = getImageKitNodePositionWithId(editor, id)

    if (position) {
      const transaction = editor.view.state.tr.setMeta('addToHistory', false)

      editor.view.dispatch(transaction.delete(position, position + 1))
    }

    uploadQueue.delete(id)

    if (uploadQueue.size === 0) {
      options.onUploadError?.()
    }
  } finally {
    if (uploadQueue.size === 0) {
      editor.setEditable(true)
      editor.commands.focus()
    }
  }
}

function getImageKitNodePositionWithId(editor: Editor, id: string): number | undefined {
  let position: number | undefined

  editor.view.state.doc.descendants((node, pos) => {
    if (node.type.name === tiptapNodeName && node.attrs.id === id) {
      position = pos

      return false
    }

    return true
  })

  return position
}

// FIXME(HiDeoo)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function upload(_image: File) {
  // FIXME(HiDeoo)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      // resolve('/images/icons/512.png')
      reject(new Error('plop'))
    }, 5000)
  })
}

export interface ImageKitTiptapNodeOptions {
  onUploadError?: () => void
}

type UploadQueue = Set<string>
