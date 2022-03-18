declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    replaceContent: {
      replaceContent: (content: string) => ReturnType
    }
  }
}

export {}
