export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1).toLowerCase()
}

export function isValidUrl(text: string): boolean {
  try {
    new URL(text)

    return true
  } catch {
    return false
  }
}
