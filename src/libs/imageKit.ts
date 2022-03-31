import { type Editor } from '@tiptap/core'
import { Node } from '@tiptap/react'
import cuid from 'cuid'
import { Plugin } from 'prosemirror-state'

const tiptapNodeName = 'imagekit-image'

const supportedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']

const maxImageSizeInMegabytes = 5

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
        pendingName: {
          default: null,
        },
        src: {
          default: null,
        },
      }
    },
    addProseMirrorPlugins() {
      return [imageKitProseMirrorPlugin(this.editor, options)]
    },
    draggable: true,
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
        return ['div', { class: 'italic text-blue-200' }, `Uploading ${HTMLAttributes.pendingName}…`]
      }

      return ['img', { src: HTMLAttributes.src }]
    },
  })
}

function imageKitProseMirrorPlugin(editor: Editor, options: ImageKitTiptapNodeOptions) {
  return new Plugin({
    props: {
      handleDrop(_view, event) {
        if (!(event instanceof DragEvent) || !event.dataTransfer || event.dataTransfer.files.length === 0) {
          return false
        }

        const position = editor.view.posAtCoords({ left: event.clientX, top: event.clientY })

        if (!position) {
          return false
        }

        event.preventDefault()

        return uploadImagesToEditor(editor, Array.from(event.dataTransfer.files), options, position)
      },
      handlePaste(_view, event) {
        if (!event.clipboardData || event.clipboardData.files.length === 0) {
          return false
        }

        event.preventDefault()

        return uploadImagesToEditor(editor, Array.from(event.clipboardData.items), options)
      },
    },
  })
}

function uploadImagesToEditor(
  editor: Editor,
  files: (File | DataTransferItem)[],
  options: ImageKitTiptapNodeOptions,
  position?: Position
): boolean {
  // We do not care about events that contains HTML, e.g. pasting from Word or the editor itself.
  if (files.some((item) => item.type === 'text/html')) {
    return false
  }

  if (!files.every((item) => supportedImageTypes.includes(item.type))) {
    const formatter = new Intl.ListFormat('en', { style: 'short', type: 'conjunction' })

    options.onUploadError?.(
      new ImageKitError(
        'Invalid image file type.',
        `The supported formats are ${formatter.format(
          supportedImageTypes.map((format) => format.replace('image/', ''))
        )}.`
      )
    )

    return false
  }

  if (!editor.view.state.tr.selection.empty) {
    editor.view.dispatch(editor.view.state.tr.deleteSelection())
  }

  let uploadStarted = false
  const uploadQueue: UploadQueue = new Set()

  for (let index = files.length; index >= 0; index--) {
    const item = files[index]
    const image = item instanceof DataTransferItem ? item.getAsFile() : item

    if (!image) {
      continue
    }

    if (image.size > maxImageSizeInMegabytes * 1024 * 1024) {
      options.onUploadError?.(
        new ImageKitError('Image file too big.', `The maximum file size is ${maxImageSizeInMegabytes}MB.`)
      )

      continue
    }

    if (!uploadStarted) {
      uploadStarted = true

      editor.setEditable(false)
    }

    const id = cuid()
    const node = editor.view.state.schema.nodes[tiptapNodeName].create({ id, pending: true, pendingName: image.name })

    editor.view.dispatch(
      position
        ? editor.view.state.tr.replaceWith(position.pos, position.pos, node)
        : editor.view.state.tr.replaceSelectionWith(node)
    )

    uploadQueue.add(id)

    uploadImageToEditor(editor, options, uploadQueue, image, id)
  }

  return true
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

    options.onUploadError?.(new Error('Failed to upload an image.'))
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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('/images/icons/512.png')
      // reject(new Error('plop'))
    }, 2000)
  })
}

export class ImageKitError extends Error {
  constructor(public message: string, public details?: string) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export interface ImageKitTiptapNodeOptions {
  onUploadError?: (error: ImageKitError) => void
}

type UploadQueue = Set<string>

type Position = NonNullable<ReturnType<Editor['view']['posAtCoords']>>
