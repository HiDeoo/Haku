export function capitalize(str: string): string {
  return str.charAt(0).toLocaleUpperCase().concat(str.slice(1).toLowerCase())
}
