export function isEmpty(array: unknown[] | undefined): array is undefined | [] {
  return array === undefined || array.length === 0
}

export function isNotEmpty<T>(array: readonly T[] | undefined): array is NonEmptyArray<T> {
  return array !== undefined && array.length > 0
}

export function addAtIndex<TData>(array: TData[], index: number, ...items: TData[]): TData[] {
  return [...array.slice(0, index), ...items, ...array.slice(index)]
}

export function removeAtIndex<TData>(array: TData[], index: number): TData[] {
  return [...array.slice(0, index), ...array.slice(index + 1)]
}

export function unshiftFromIndex<TData>(array: TData[], index: number): TData[] {
  return [...array.slice(index, index + 1), ...array.slice(0, index), ...array.slice(index + 1)]
}

export function groupByKey<
  TIndex extends PropertyKey,
  TKey extends TIndex,
  TRecord extends unknown & { [key in TKey]: TIndex }
>(records: TRecord[], key: TKey): Record<TRecord[TKey], TRecord[]> {
  type GroupedRecords = Record<TRecord[TKey], TRecord[]>
  const groupedRecords: Partial<GroupedRecords> = {}

  for (const record of records) {
    const keyValue = record[key]

    groupedRecords[keyValue] = [...(groupedRecords[keyValue] ?? []), record]
  }

  return groupedRecords as GroupedRecords
}

export function sortTupleArrayAlphabetically<TItem extends [string, string]>(array: TItem[]): TItem[] {
  return array.sort((a, b) => a[0].localeCompare(b[0]))
}

type NonEmptyArray<T> = readonly [T, ...(readonly T[])]
