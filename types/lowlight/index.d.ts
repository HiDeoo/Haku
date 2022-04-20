declare module 'lowlight/lib/core' {
  function highlight(language: string, value: string, options?: lowlight.HighlightOptions): lowlight.HighlightResult
  function highlightAuto(value: string, options?: lowlight.HighlightAutoOptions): lowlight.HighlightAutoResult
  function registerLanguage(name: string, syntax: LanguageFn): void
  function listLanguages(): string[]

  const lowlight = { highlight, highlightAuto, registerLanguage, listLanguages }

  export { lowlight }
}
