import { cloneElement, isValidElement, useId, useRef } from 'react'

const FileButton: React.FC<FileButtonProps> = ({ accept, disabled, multiple, onChange, trigger }) => {
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

export default FileButton

interface FileButtonProps {
  accept?: string[]
  disabled?: boolean
  multiple?: boolean
  onChange: React.ChangeEventHandler<HTMLInputElement>
  trigger: React.ReactNode
}
