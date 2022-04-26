// https://github.com/microsoft/TypeScript/pull/47254
declare namespace Intl {
  type ListFormatLocaleMatcher = 'lookup' | 'best fit'
  type ListFormatType = 'conjunction' | 'disjunction' | 'unit'
  type ListFormatStyle = 'long' | 'short' | 'narrow'

  interface ListFormatOptions {
    localeMatcher?: ListFormatLocaleMatcher
    type?: ListFormatType
    style?: ListFormatStyle
  }

  interface ListFormat {
    format(list: Iterable<string>): string

    formatToParts(list: Iterable<string>): { type: 'element' | 'literal'; value: string }[]
  }

  const ListFormat: {
    prototype: ListFormat

    new (locales?: BCP47LanguageTag | BCP47LanguageTag[], options?: ListFormatOptions): ListFormat

    supportedLocalesOf(
      locales: BCP47LanguageTag | BCP47LanguageTag[],
      options?: Pick<ListFormatOptions, 'localeMatcher'>
    ): BCP47LanguageTag[]
  }
}
