import 'react'

declare module 'react' {
  interface CSSProperties {
    '--editor-text-color'?: string
  }

  // https://changelog.com/posts/the-react-reactnode-type-is-a-black-hole
  export type StrictReactFragment =
    | {
        key?: string | number | null
        ref?: null
        props?: {
          children?: StrictReactNode
        }
      }
    | ReactNodeArray
  export type StrictReactNode = ReactChild | StrictReactFragment | ReactPortal | boolean | null | undefined
}
