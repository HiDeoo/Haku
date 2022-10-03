import { cloneElement, isValidElement, useId, useRef } from 'react'

import { type ButtonProps } from 'components/form/Button'

export const FileButton = ({ accept, disabled, multiple, onChange, trigger }: FileButtonProps) => {
  const idPrefix = useId()
  const triggerId = `${idPrefix}-file-button`

  const input = useRef<HTMLInputElement>(null)

  if (!isValidElement(trigger)) {
    return null
  }

  function handlePress() {
    input.current?.click()
  }

  return (
    <>
      {cloneElement(trigger, { id: triggerId, disabled, onPress: handlePress })}
      <input
        ref={input}
        type="file"
        className="hidden"
        disabled={disabled}
        multiple={multiple}
        onChange={onChange}
        accept={accept?.join(',')}
        aria-labelledby={triggerId}
      />
    </>
  )
}

interface FileButtonProps {
  accept?: string[]
  disabled?: boolean
  multiple?: boolean
  onChange: React.ChangeEventHandler<HTMLInputElement>
  trigger: React.ReactElement<ButtonProps>
}
