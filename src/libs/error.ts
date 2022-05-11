export function toError(error: unknown): Error | undefined {
  if (error instanceof Error) {
    return error
  } else if (typeof error === 'string') {
    return new Error(error)
  } else if (typeof error === 'object') {
    return new Error(JSON.stringify(error))
  }

  return undefined
}
