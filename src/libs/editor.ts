import { Extension, findChildren, Node, type Editor } from '@tiptap/core'
import cuid from 'cuid'
import { type LanguageFn } from 'highlight.js'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import go from 'highlight.js/lib/languages/go'
import ini from 'highlight.js/lib/languages/ini'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import pgsql from 'highlight.js/lib/languages/pgsql'
import plaintext from 'highlight.js/lib/languages/plaintext'
import scss from 'highlight.js/lib/languages/scss'
import shell from 'highlight.js/lib/languages/shell'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import { lowlight } from 'lowlight/lib/core'

import { isNotEmpty } from 'libs/array'

export { CloudinaryTiptapNode as Cloudinary } from 'libs/cloudinaryTiptapNode'

const languages: Languages = {
  bash: { fn: bash, name: 'Bash' },
  css: { fn: css, name: 'CSS' },
  diff: { fn: diff, name: 'Diff' },
  dockerfile: { fn: dockerfile, name: 'Dockerfile' },
  go: { fn: go, name: 'Go' },
  html: { fn: xml, name: 'HTML' },
  javascript: { fn: javascript, name: 'JavaScript' },
  json: { fn: json, name: 'JSON' },
  markdown: { fn: markdown, name: 'Markdown' },
  plaintext: { fn: plaintext, name: 'Plain Text' },
  pgsql: { fn: pgsql, name: 'PL/pgSQL' },
  scss: { fn: scss, name: 'SCSS' },
  shell: { fn: shell, name: 'Shell' },
  toml: { fn: ini, name: 'TOML' },
  typescript: { fn: typescript, name: 'TypeScript' },
  xml: { fn: xml, name: 'XML' },
  yaml: { fn: yaml, name: 'YAML' },
  zsh: { fn: bash, name: 'Zsh' },
}

const languageAliases: LanguageAliases = {
  console: 'shell',
  docker: 'dockerfile',
  golang: 'go',
  ini: 'toml',
  js: 'javascript',
  jsx: 'javascript',
  md: 'markdown',
  patch: 'diff',
  postgres: 'pgsql',
  postgresql: 'pgsql',
  sh: 'bash',
  text: 'plaintext',
  ts: 'typescript',
  tsx: 'typescript',
  txt: 'plaintext',
  yml: 'yaml',
}

export function getLowlight() {
  if (isNotEmpty(lowlight.listLanguages())) {
    return lowlight
  }

  for (const id in languages) {
    const language = languages[id]

    if (language) {
      lowlight.registerLanguage(id, languages[id]?.fn)
    }
  }

  const registedLanguages = lowlight.listLanguages()

  for (const id in languageAliases) {
    const alias = languageAliases[id]

    if (alias) {
      lowlight.registerAlias(alias, id)
    }
  }

  // By default, `lowlight.listLanguages()` does not return registered aliases so we need to monkey-patch it to do so.
  lowlight.listLanguages = () => {
    return [...registedLanguages, ...Object.keys(languageAliases)]
  }

  lowlight.listLanguagesWithoutAliases = () => {
    return registedLanguages
  }

  return lowlight
}

export function getLanguageName(id: string | null) {
  if (!id) {
    return 'Unknown'
  }

  const alias = languageAliases[id]

  if (alias) {
    const aliasee = languages[alias]?.name

    if (aliasee) {
      return aliasee
    }
  }

  return languages[id]?.name ?? 'Unknown'
}

export function getToc(editor: Editor) {
  const toc: ToC = []

  // https://github.com/ueberdosis/tiptap/issues/2836
  const transaction = editor.state.tr as unknown as Parameters<typeof editor['view']['dispatch']>[0]

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      if (!node.attrs['id']) {
        transaction.setNodeMarkup(pos, undefined, { ...node.attrs, id: cuid() })
      }

      const id: unknown = node.attrs['id']
      const level: unknown = node.attrs['level']

      if (typeof id === 'string' && typeof level === 'number') {
        toc.push({ id, level, name: node.textContent, pos })
      }
    }
  })

  transaction.setMeta('preventUpdate', true)
  transaction.setMeta('addToHistory', false)

  editor.view.dispatch(transaction)

  return toc
}

export function focusNodeWithId(editor: Editor, id: string) {
  const domNode = document.querySelector(id)

  if (!domNode) {
    return
  }

  const [node] = findChildren(editor.state.doc, (node) => node.attrs['id'] === domNode.id)

  if (!node) {
    return
  }

  editor.chain().setTextSelection(node.pos).focus().run()

  domNode.scrollIntoView()
}

export const HeadingWithId = Node.create({
  name: 'HeadingWithId',
  addGlobalAttributes() {
    return [
      {
        types: ['heading'],
        attributes: {
          id: {
            default: null,
          },
        },
      },
    ]
  },
})

export const ReplaceContent = Extension.create({
  name: 'replaceContent',
  addCommands() {
    return {
      replaceContent:
        (content: string) =>
        ({ commands, dispatch, tr }) => {
          commands.setContent(content)

          if (dispatch) {
            tr.setMeta('addToHistory', false)
          }

          return true
        },
    }
  },
})

export const ShiftEnter = Extension.create<{ callback: () => void }>({
  name: 'shiftEnterExtension',
  addKeyboardShortcuts() {
    return {
      'Shift-Enter': () => {
        this.options.callback()

        return true
      },
    }
  },
})

export type ToC = { id: string; level: number; name: string; pos: number }[]

type Languages = Record<string, { fn: LanguageFn; name: string }>
type LanguageAliases = Record<string, keyof Languages>
