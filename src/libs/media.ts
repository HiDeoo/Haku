const backgroundUrlRegExp = /url\((?<url>.*)\)/

export function getA11yImageAttributes(params: A11yImageParams) {
  const { style, ...attributes } = getA11yImageReactAttributes(params)

  return {
    ...attributes,
    style: style?.background ? `background: ${style.background};` : undefined,
  }
}

export function getA11yImageReactAttributes({
  alt,
  base64Placeholder,
  height,
  lazy,
  src,
  srcSet,
  width,
}: A11yImageParams) {
  return {
    alt: alt ?? undefined,
    crossOrigin: 'anonymous',
    decoding: 'async',
    height: height ?? undefined,
    loading: lazy ? 'lazy' : undefined,
    sizes: '100vw',
    src: src ?? undefined,
    srcSet: srcSet ?? undefined,
    style: base64Placeholder ? { background: `url(${base64Placeholder}) top left / cover no-repeat` } : undefined,
    width: width ?? undefined,
  } as const
}

export function getA11yImageParams(element: HTMLImageElement): A11yImageParams {
  return {
    alt: element.getAttribute('alt'),
    height: element.getAttribute('height'),
    src: element.getAttribute('src'),
    srcSet: element.getAttribute('srcset'),
    base64Placeholder: backgroundUrlRegExp.exec(element.getAttribute('style') ?? '')?.groups?.url,
    width: element.getAttribute('width'),
  }
}

export function isJpegMimeType(mimeType: string) {
  return mimeType === 'image/jpeg' || mimeType === 'image/jpg'
}

export interface A11yImageParams {
  alt?: string | null
  base64Placeholder?: string | null
  height?: string | null
  lazy?: boolean
  src?: string | null
  srcSet?: string | null
  width?: string | null
}
