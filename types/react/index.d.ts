import 'react'

declare module 'react' {
  interface CSSProperties {
    '--editor-text-color'?: string
    '--editor-link-color'?: string
  }

  interface TextareaHTMLAttributes {
    enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
  }
}
