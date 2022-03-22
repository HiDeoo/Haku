import { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { type FieldPath, useController, type Control, type FieldValues } from 'react-hook-form'

import Label from 'components/form/Label'
import TextInput from 'components/form/TextInput'
import { AUTH_TOKEN_LENGTH } from 'constants/auth'
import clst from 'styles/clst'

const MagicCodeInput = <TFormFields extends FieldValues>(
  { control, disabled, errorMessage, length = AUTH_TOKEN_LENGTH, name }: MagicCodeInputProps<TFormFields>,
  forwardedRef: ForwardedRef<MagicCodeInputHandle>
) => {
  useImperativeHandle(forwardedRef, () => ({ focus }))

  const inputElements = useRef<(HTMLInputElement | null)[]>(new Array(length))

  const [values, setValues] = useState<string[]>(new Array(length).fill(''))

  const {
    field: { onBlur, onChange, ref: setFieldRef },
  } = useController<TFormFields>({
    control,
    name,
    rules: {
      required: 'required',
      pattern: { value: new RegExp(`^\\d{${length}}$`), message: 'invalid' },
    },
  })

  function focus() {
    inputElements.current[0]?.focus()
  }

  const setInputRef = useCallback(
    (index: number, inputRef: HTMLInputElement | null) => {
      inputElements.current[index] = inputRef

      if (index === 0) {
        setFieldRef(inputRef)
      }
    },
    [setFieldRef]
  )

  const onChangeInput = useCallback(
    (index: number, value: string) => {
      setValues((prevValues) => {
        const newValues = [...prevValues.slice(0, index), value, ...prevValues.slice(index + 1)]

        onChange(newValues.join(''))

        return newValues
      })

      if (index < length - 1 && value.length > 0) {
        inputElements.current[index + 1]?.focus()
      }
    },
    [length, onChange]
  )

  const onBackspace = useCallback(
    (index: number) => {
      const value = values[index]

      if ((value && value.length > 0) || index === 0) {
        return
      }

      inputElements.current[index - 1]?.focus()
    },
    [values]
  )

  const onMove = useCallback(
    (index: number, direction: 'left' | 'right') => {
      if ((direction === 'left' && index === 0) || (direction === 'right' && index === length - 1)) {
        return
      }

      const input = inputElements.current[index + (direction === 'left' ? -1 : 1)]

      input?.focus()
      requestAnimationFrame(() => {
        input?.setSelectionRange(input.value.length, input.value.length)
      })
    },
    [length]
  )

  const onPaste = useCallback(
    (value: string) => {
      const newValues = Array.from({ length }, (_, index) => value[index] ?? '')

      setValues(newValues)

      onChange(newValues.join(''))

      inputElements.current[Math.min(AUTH_TOKEN_LENGTH - 1, value.length - 1)]?.focus()
    },
    [length, onChange]
  )

  const inputs = useMemo(() => {
    return Array.from({ length }, (_, index) => (
      <MagicCodeDigitInput
        index={index}
        onBlur={onBlur}
        onMove={onMove}
        onPaste={onPaste}
        disabled={disabled}
        setRef={setInputRef}
        onChange={onChangeInput}
        onBackspace={onBackspace}
        errorMessage={errorMessage}
        value={values[index] ?? ''}
        key={`magic-code-input-${index}`}
      />
    ))
  }, [disabled, errorMessage, length, onBackspace, onBlur, onChangeInput, onMove, onPaste, setInputRef, values])

  return (
    <div role="group" aria-labelledby="magic-code-label" className="mb-3 last-of-type:mb-4">
      <Label
        disabled={disabled}
        id="magic-code-label"
        errorMessage={errorMessage}
        htmlFor="magic-code-input-0"
        errorMessageProps={{ id: 'magic-code-error-message' }}
      >
        Code
      </Label>
      <div className="flex gap-2">{inputs}</div>
    </div>
  )
}

export default forwardRef(MagicCodeInput) as <TFormFields extends FieldValues>(
  props: React.PropsWithChildren<MagicCodeInputProps<TFormFields>>
) => ReturnType<typeof MagicCodeInput>

const MagicCodeDigitInput: React.FC<MagicCodeDigitInputProps> = ({
  disabled,
  errorMessage,
  index,
  onBackspace,
  onBlur,
  onChange,
  onMove,
  onPaste,
  setRef,
  value,
}) => {
  const inputClasses = clst('px-0 text-center', errorMessage ? 'focus:ring-red-400' : 'focus:ring-blue-600')

  function setInputRef(ref: HTMLInputElement | null) {
    setRef(index, ref)
  }

  function onChangeValue(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(index, event.target.value.replace(value, ''))
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      onBackspace(index)
    } else if (event.key === 'ArrowLeft') {
      onMove(index, 'left')
    } else if (event.key === 'ArrowRight') {
      onMove(index, 'right')
    }
  }

  function onPasteValue(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()

    onPaste(event.clipboardData.getData('text'))
  }

  return (
    <TextInput
      value={value}
      onBlur={onBlur}
      ref={setInputRef}
      inputMode="numeric"
      disabled={disabled}
      onKeyDown={onKeyDown}
      onPaste={onPasteValue}
      onChange={onChangeValue}
      className={inputClasses}
      autoComplete="one-time-code"
      id={`magic-code-input-${index}`}
      aria-labelledby="magic-code-label"
      placeholder={(index + 1).toString()}
      aria-describedby="magic-code-error-message"
    />
  )
}

type MagicCodeInputProps<TFormFields extends FieldValues> = {
  control: Control<TFormFields>
  disabled?: boolean
  errorMessage?: string
  length?: number
  name: FieldPath<TFormFields>
} & { ref?: React.ForwardedRef<MagicCodeInputHandle> }

interface MagicCodeDigitInputProps {
  disabled?: boolean
  errorMessage?: string
  index: number
  onBackspace: (index: number) => void
  onMove: (index: number, direction: 'left' | 'right') => void
  onBlur: () => void
  onChange: (index: number, value: string) => void
  onPaste: (value: string) => void
  setRef: (index: number, ref: HTMLInputElement | null) => void
  value: string
}

export interface MagicCodeInputHandle {
  focus: () => void
}
