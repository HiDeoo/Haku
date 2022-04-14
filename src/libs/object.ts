export function hasKey<TObject extends object, TKey extends PropertyKey>(
  obj: TObject,
  key: TKey
): obj is TObject & Record<TKey, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export function allEntries<TObject extends object>(obj: TObject) {
  return Object.entries(obj) as [keyof TObject, TObject[keyof TObject]][]
}
