declare module 'lowlight/lib/core' {
  function highlight(language: string, value: string, options?: lowlight.HighlightOptions): lowlight.HighlightResult
  function highlightAuto(value: string, options?: lowlight.HighlightAutoOptions): lowlight.HighlightAutoResult
  function registerAlias(name: string, alias: string): void
  function registerLanguage(name: string, syntax: LanguageFn): void
  function listLanguages(): string[]
  function listLanguagesWithoutAliases(): string[]

  const lowlight = {
    highlight,
    highlightAuto,
    registerAlias,
    registerLanguage,
    listLanguages,
    listLanguagesWithoutAliases,
  }

  export { lowlight }
}
