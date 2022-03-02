import { useEffect, useMemo, useState } from 'react'
import { debounce } from 'throttle-debounce'

export default function useDebouncedValue<TValue>(value: TValue, delayInMs = 250): TValue {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value)

  const updateDebouncedValue = useMemo(() => debounce(delayInMs, setDebouncedValue), [delayInMs])

  useEffect(() => {
    updateDebouncedValue(value)
  }, [updateDebouncedValue, value])

  return debouncedValue
}
