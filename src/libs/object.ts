export function hasKey<ObjectType, Key extends PropertyKey>(
  obj: ObjectType,
  key: Key
): obj is ObjectType & Record<Key, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, key)
}
