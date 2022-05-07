import 'react'

declare module 'react' {
  interface CSSProperties {
    '--editor-text-color'?: string
  }

  type FCWithChildren = FC<{ children: React.ReactNode }>
}
