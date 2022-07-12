import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { type FieldPath, useController, type Control, type FieldValues } from 'react-hook-form'

import { Label } from 'components/form/Label'
import { TextInput } from 'components/form/TextInput'
import { AUTH_TOKEN_LENGTH } from 'constants/auth'
import { clst } from 'styles/clst'

const MagicCodeInputComponent = <TFormFields extends FieldValues>(
  { control, disabled, errorMessage, length = AUTH_TOKEN_LENGTH, name }: MagicCodeInputProps<TFormFields>,
  forwardedRef: React.ForwardedRef<MagicCodeInputHandle>
) => {
  useImperativeHandle(forwardedRef, () => ({ focus }))

  const inputElements = useRef<(HTMLInputElement | null)[]>(Array.from({ length }))

  const [values, setValues] = useState<string[]>(Array.from<string>({ length }).fill(''))

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

  const handleChange = useCallback(
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

  const handleBackspace = useCallback(
    (index: number) => {
      const value = values[index]

      if ((value && value.length > 0) || index === 0) {
        return
      }

      inputElements.current[index - 1]?.focus()
    },
    [values]
  )

  const handleMove = useCallback(
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

  const handlePaste = useCallback(
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
        onMove={handleMove}
        disabled={disabled}
        setRef={setInputRef}
        onPaste={handlePaste}
        onChange={handleChange}
        errorMessage={errorMessage}
        value={values[index] ?? ''}
        onBackspace={handleBackspace}
        key={`magic-code-input-${index}`}
      />
    ))
  }, [
    disabled,
    errorMessage,
    length,
    handleBackspace,
    onBlur,
    handleChange,
    handleMove,
    handlePaste,
    setInputRef,
    values,
  ])

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

export const MagicCodeInput = forwardRef(MagicCodeInputComponent) as <TFormFields extends FieldValues>(
  props: MagicCodeInputProps<TFormFields> & { ref?: React.ForwardedRef<MagicCodeInputHandle> }
) => ReturnType<typeof MagicCodeInputComponent>

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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(index, event.target.value.replace(value, ''))
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'Backspace': {
        onBackspace(index)
        break
      }
      case 'ArrowLeft': {
        onMove(index, 'left')
        break
      }
      case 'ArrowRight': {
        onMove(index, 'right')
        break
      }
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()

    onPaste(event.clipboardData.getData('text'))
  }

  return (
    <TextInput
      value={value}
      onBlur={onBlur}
      ref={setInputRef}
      inputMode="numeric"
      readOnly={disabled}
      onPaste={handlePaste}
      onChange={handleChange}
      className={inputClasses}
      onKeyDown={handleKeyDown}
      autoComplete="one-time-code"
      id={`magic-code-input-${index}`}
      aria-labelledby="magic-code-label"
      placeholder={(index + 1).toString()}
      aria-describedby="magic-code-error-message"
    />
  )
}

interface MagicCodeInputProps<TFormFields extends FieldValues> {
  control: Control<TFormFields>
  disabled?: boolean
  errorMessage?: string
  length?: number
  name: FieldPath<TFormFields>
}

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
