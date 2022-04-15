export function getA11yImageAttributes({ alt, height, lazy, src, srcSet, width }: A11yImageParams) {
  return {
    alt: alt ?? undefined,
    crossOrigin: 'anonymous',
    decoding: 'async',
    height: height ?? undefined,
    loading: lazy ? 'lazy' : undefined,
    sizes: '100vw',
    src: src ?? undefined,
    srcSet: srcSet ?? undefined,
    width: width ?? undefined,
  } as const
}

export function getA11yImageParams(element: HTMLImageElement): A11yImageParams {
  return {
    alt: element.getAttribute('alt'),
    height: element.getAttribute('height'),
    src: element.getAttribute('src'),
    srcSet: element.getAttribute('srcset'),
    width: element.getAttribute('width'),
  }
}

export interface A11yImageParams {
  alt?: string | null
  height?: string | null
  lazy?: boolean
  src?: string | null
  srcSet?: string | null
  width?: string | null
}
