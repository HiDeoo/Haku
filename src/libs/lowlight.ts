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

const languages: Languages = {
  bash: { fn: bash },
  css: { fn: css },
  diff: { fn: diff },
  dockerfile: { fn: dockerfile },
  go: { fn: go },
  html: { fn: xml },
  javascript: { fn: javascript },
  json: { fn: json },
  markdown: { fn: markdown },
  plaintext: { fn: plaintext },
  pgsql: { fn: pgsql },
  scss: { fn: scss },
  shell: { fn: shell },
  toml: { fn: ini },
  typescript: { fn: typescript },
  xml: { fn: xml },
  yaml: { fn: yaml },
  zsh: { fn: bash },
}

for (const id in languages) {
  const language = languages[id]

  if (language) {
    lowlight.registerLanguage(id, languages[id]?.fn)
  }
}

export { lowlight }

type Languages = Record<string, { fn: LanguageFn }>
