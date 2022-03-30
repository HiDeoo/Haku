import { Node } from '@tiptap/react'
import cuid from 'cuid'
import { Plugin } from 'prosemirror-state'

const tiptapNodeName = 'imagekit-image'

export const ImageKitTiptapNode = Node.create({
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
    return [imageKitProseMirrorPlugin()]
  },
  group() {
    return 'block'
  },
  renderHTML({ HTMLAttributes }) {
    if (HTMLAttributes.pending) {
      // TODO(HiDeoo) Show the file name
      // TODO(HiDeoo) Custom style during upload
      return ['div', {}, 'Uploading…']
    }

    return ['div', {}, HTMLAttributes.src]
  },
})

function imageKitProseMirrorPlugin() {
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

        for (let index = items.length; index >= 0; index--) {
          const image = items[index]?.getAsFile()

          if (!image) {
            continue
          }

          const id = cuid()
          const node = view.state.schema.nodes[tiptapNodeName].create({ id, pending: true })

          view.dispatch(view.state.tr.replaceWith(position, position, node))

          uploadImageToEditorView(view, image, id)
        }

        return true
      },
    },
  })
}

async function uploadImageToEditorView(view: EditorView, image: File, id: string) {
  try {
    const src = await upload(image)

    const position = getImageKitNodePositionWithId(view, id)

    if (position) {
      const transaction = view.state.tr.setMeta('addToHistory', false)

      view.dispatch(transaction.setNodeMarkup(position, undefined, { pending: false, src }))
    }
  } catch (error) {
    const position = getImageKitNodePositionWithId(view, id)

    if (position) {
      const transaction = view.state.tr.setMeta('addToHistory', false)

      view.dispatch(transaction.delete(position, position + 1))
    }

    // TODO(HiDeoo) Show a toast
    console.log('🚨 [editor.ts:285] error', error)
  }
}

function getImageKitNodePositionWithId(view: EditorView, id: string): number | undefined {
  let position: number | undefined

  view.state.doc.descendants((node, pos) => {
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
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve('https://picsum.photos/200/300')
      // reject(new Error('plop'))
    }, 1000)
  })
}

type EditorView = Parameters<NonNullable<Plugin['props']['handlePaste']>>[0]
