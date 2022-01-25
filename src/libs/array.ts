export function addAtIndex<TData>(array: TData[], index: number, ...items: TData[]): TData[] {
  return [...array.slice(0, index), ...items, ...array.slice(index)]
}

export function removeAtIndex<TData>(array: TData[], index: number): TData[] {
  return [...array.slice(0, index), ...array.slice(index + 1)]
}
