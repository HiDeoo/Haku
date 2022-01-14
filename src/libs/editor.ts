import { Node, type Editor } from '@tiptap/react'
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
import slug from 'url-slug'

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

export function getLowlight() {
  if (lowlight.listLanguages().length !== 0) {
    return lowlight
  }

  for (const id in languages) {
    const language = languages[id]

    if (language) {
      lowlight.registerLanguage(id, languages[id]?.fn)
    }
  }

  return lowlight
}

export function getLanguageName(id: string | null) {
  if (!id) {
    return ''
  }

  return languages[id]?.name ?? id
}

export function getToc(editor: Editor) {
  const toc: ToC = []

  const transaction = editor.state.tr

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const id = slug(`${node.textContent}-${pos}`)

      if (node.attrs.id !== id) {
        transaction.setNodeMarkup(pos, undefined, { ...node.attrs, id })
      }

      toc.push({ id, level: node.attrs.level, name: node.textContent, pos })
    }
  })

  transaction.setMeta('preventUpdate', true)
  transaction.setMeta('addToHistory', false)

  editor.view.dispatch(transaction)

  return toc
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

export type ToC = { id: string; level: number; name: string; pos: number }[]

type Languages = Record<string, { fn: LanguageFn; name: string }>