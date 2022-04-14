export function hasKey<TObject extends object, TKey extends PropertyKey>(
  obj: TObject,
  key: TKey
): obj is TObject & Record<TKey, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, key)
}
