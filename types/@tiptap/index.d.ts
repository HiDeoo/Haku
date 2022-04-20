declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    replaceContent: {
      replaceContent: (content: string) => ReturnType
    }
    uploadImages: {
      uploadImages: (files: (File | DataTransferItem)[]) => ReturnType
    }
  }
}

export {}
