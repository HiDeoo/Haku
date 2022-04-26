import { type Editor } from '@tiptap/core'
import { Node } from '@tiptap/react'
import cuid from 'cuid'
import { type Node as Doc, Fragment, type Schema, Slice } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { Step, type Mappable, StepResult } from 'prosemirror-transform'

import { IMAGE_MAX_SIZE_IN_MEGABYTES, IMAGE_SUPPORTED_TYPES } from 'constants/image'
import { getClient } from 'libs/api/client'
import { type ImageData } from 'libs/cloudinary'
import { getA11yImageAttributes, getA11yImageParams, type A11yImageParams } from 'libs/image'
import { getBytesFromMegaBytes } from 'libs/math'

const tiptapNodeName = 'cloudinary-image'

export function CloudinaryTiptapNode(options: CloudinaryTiptapNodeOptions) {
  return Node.create({
    name: tiptapNodeName,
    addAttributes() {
      return {
        data: {
          default: null,
        },
        id: {
          default: null,
        },
        pending: {
          default: false,
        },
        pendingName: {
          default: null,
        },
      }
    },
    addCommands() {
      return {
        uploadImages:
          (files: (File | DataTransferItem)[]) =>
          ({ editor }) =>
            uploadImagesToEditor(editor, files, options),
      }
    },
    addProseMirrorPlugins() {
      return [cloudinaryProseMirrorPlugin(this.editor, options)]
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

          const { alt, base64Placeholder, height, src, srcSet, width } = getA11yImageParams(element)
          const responsive: ImageData['responsive'] = {}

          for (const srcSetElement of srcSet?.split(', ') ?? []) {
            const [src, width] = srcSetElement.split(' ')

            if (!src || !width) {
              continue
            }

            responsive[parseInt(width.substring(-1), 10)] = src
          }

          return { data: { height, name: alt, original: src, placeholder: base64Placeholder, responsive, width } }
        },
      },
    ],
    renderHTML({ HTMLAttributes }) {
      if (HTMLAttributes.pending) {
        return ['div', { class: 'italic text-blue-200' }, `Uploading ${HTMLAttributes.pendingName}…`]
      }

      const srcSetElements = Object.entries(HTMLAttributes.data.responsive ?? {}).map(
        ([width, url]) => `${url} ${width}w`
      )

      return [
        'img',
        getA11yImageAttributes({
          alt: HTMLAttributes.data.name,
          base64Placeholder: HTMLAttributes.data.placeholder,
          height: HTMLAttributes.data.height,
          src: HTMLAttributes.data.original,
          srcSet: srcSetElements.join(', '),
          width: HTMLAttributes.data.width,
        }),
      ]
    },
  })
}

function cloudinaryProseMirrorPlugin(editor: Editor, options: CloudinaryTiptapNodeOptions) {
  return new Plugin({
    props: {
      handleDoubleClick(_view, _pos, event) {
        if (!(event.target instanceof HTMLImageElement)) {
          return false
        }

        const src = event.target.getAttribute('src')

        if (!src) {
          return false
        }

        options.onImageDoubleClick?.(getA11yImageParams(event.target))

        return true
      },
      handleDrop(_view, event) {
        if (!(event instanceof DragEvent) || !event.dataTransfer || event.dataTransfer.files.length === 0) {
          return false
        }

        const pos = editor.view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos

        if (!pos) {
          return false
        }

        event.preventDefault()

        return uploadImagesToEditor(editor, Array.from(event.dataTransfer.files), options, pos)
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
  options: CloudinaryTiptapNodeOptions,
  pos?: number
): boolean {
  // We do not care about events that contains HTML, e.g. pasting from Word or the editor itself.
  if (files.some((item) => item.type === 'text/html')) {
    return false
  }

  if (!files.every((item) => IMAGE_SUPPORTED_TYPES.includes(item.type))) {
    const formatter = new Intl.ListFormat('en', { style: 'short', type: 'conjunction' })

    options.onUploadError?.(
      new CloudinaryError(
        'Invalid image file type.',
        `The supported formats are ${formatter.format(
          IMAGE_SUPPORTED_TYPES.map((format) => format.replace('image/', ''))
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

  const isEmptyTextNode = typeof editor.state.doc.nodeAt(editor.state.selection.from - 1)?.text?.length === 'undefined'

  for (let index = files.length; index >= 0; index--) {
    const item = files[index]
    const image = item instanceof DataTransferItem ? item.getAsFile() : item

    if (!image) {
      continue
    }

    if (image.size > getBytesFromMegaBytes(IMAGE_MAX_SIZE_IN_MEGABYTES)) {
      options.onUploadError?.(
        new CloudinaryError('Image file too big.', `The maximum file size is ${IMAGE_MAX_SIZE_IN_MEGABYTES}MB.`)
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
      pos
        ? editor.view.state.tr.replaceWith(pos, pos, node)
        : isEmptyTextNode // If the cursor is on an empty text node, we insert the image at the cursor position.
        ? editor.view.state.tr.replaceWith(editor.state.selection.from - 1, editor.state.selection.from - 1, node)
        : editor.view.state.tr.replaceSelectionWith(node)
    )

    uploadQueue.add(id)

    uploadImageToEditor(editor, options, uploadQueue, image, id)
  }

  return true
}

async function uploadImageToEditor(
  editor: Editor,
  options: CloudinaryTiptapNodeOptions,
  uploadQueue: UploadQueue,
  image: File,
  id: string
) {
  try {
    if (!options.referenceId) {
      return
    }

    const data = await upload(image, options.referenceId)

    const position = getCloudinaryNodePositionWithId(editor, id)

    if (position) {
      editor.view.dispatch(
        editor.view.state.tr.step(new SetAttrsStep(position, { data, pending: false })).setMeta('addToHistory', false)
      )
    }

    uploadQueue.delete(id)
  } catch (error) {
    const position = getCloudinaryNodePositionWithId(editor, id)

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

function getCloudinaryNodePositionWithId(editor: Editor, id: string): number | undefined {
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

async function upload(
  image: File,
  referenceId: NonNullable<CloudinaryTiptapNodeOptions['referenceId']>
): Promise<ImageData> {
  const body = new FormData()
  body.append('file', image)
  body.append('referenceId', referenceId)

  return (await getClient()).post('images', { body }).json<ImageData>()
}

export class CloudinaryError extends Error {
  constructor(public message: string, public details?: string) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// https://discuss.prosemirror.net/t/preventing-image-placeholder-replacement-from-being-undone/1394/2
export class SetAttrsStep extends Step {
  constructor(private pos: number, private attrs: NodeAttributes) {
    super()
  }

  apply(doc: Doc) {
    const node = doc.nodeAt(this.pos)

    if (!node) {
      return StepResult.fail('No node at given position.')
    }

    const attrs = {
      ...(node.attrs ?? {}),
      ...(this.attrs ?? {}),
    }

    const newNode = node.type.create(attrs, Fragment.empty, node.marks)
    const slice = new Slice(Fragment.from(newNode), 0, node.isLeaf ? 0 : 1)

    return StepResult.fromReplace(doc, this.pos, this.pos + 1, slice)
  }

  invert(doc: Doc) {
    return new SetAttrsStep(this.pos, doc.nodeAt(this.pos)?.attrs ?? {})
  }

  map(mapping: Mappable) {
    const result = mapping.mapResult(this.pos, 1)

    return result.deleted ? null : new SetAttrsStep(result.pos, this.attrs)
  }

  toJSON(): SerializedSetAttrsStep {
    return { stepType: 'setAttrs', pos: this.pos, attrs: this.attrs }
  }

  static fromJSON(_schema: Schema, json: SerializedSetAttrsStep) {
    if (typeof json.pos !== 'number' || typeof json.attrs !== 'object') {
      throw new RangeError('Invalid input for SetAttrsStep.fromJSON().')
    }

    return new SetAttrsStep(json.pos, json.attrs)
  }
}

Step.jsonID('setAttrs', SetAttrsStep)

export interface CloudinaryTiptapNodeOptions {
  referenceId?: string
  onImageDoubleClick?: (params: A11yImageParams) => void
  onUploadError?: (error: CloudinaryError) => void
}

type UploadQueue = Set<string>

type NodeAttributes = Parameters<NonNullable<Editor['view']['state']['tr']['setNodeMarkup']>>[2]

interface SerializedSetAttrsStep {
  attrs: NodeAttributes
  pos?: number
  stepType: 'setAttrs'
}
