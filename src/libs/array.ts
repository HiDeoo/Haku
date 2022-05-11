export function isEmpty(array: unknown[] | undefined): array is undefined | [] {
  return typeof array === 'undefined' || array.length === 0
}

export function isNotEmpty<T>(array: ReadonlyArray<T> | undefined): array is NonEmptyArray<T> {
  return typeof array !== 'undefined' && array.length > 0
}

export function addAtIndex<TData>(array: TData[], index: number, ...items: TData[]): TData[] {
  return [...array.slice(0, index), ...items, ...array.slice(index)]
}

export function removeAtIndex<TData>(array: TData[], index: number): TData[] {
  return [...array.slice(0, index), ...array.slice(index + 1)]
}

export function groupByKey<
  TIndex extends PropertyKey,
  TKey extends TIndex,
  TRecord extends unknown & { [key in TKey]: TIndex }
>(records: TRecord[], key: TKey): Record<TRecord[TKey], TRecord[]> {
  return records.reduce((acc, record) => {
    const keyValue = record[key]

    if (typeof keyValue === 'string') {
      acc[keyValue] = [...(acc[keyValue] ?? []), record]
    }

    return acc
  }, {} as Record<TRecord[TKey], TRecord[]>)
}

export function sortTupleArrayAlphabetically<TItem extends [string, string]>(array: TItem[]): TItem[] {
  return array.sort((a, b) => a[0].localeCompare(b[0]))
}

type NonEmptyArray<T> = readonly [T, ...ReadonlyArray<T>]
