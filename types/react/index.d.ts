import 'react'

declare module 'react' {
  interface CSSProperties {
    '--editor-text-color'?: string
  }

  interface TextareaHTMLAttributes {
    enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
  }
}
