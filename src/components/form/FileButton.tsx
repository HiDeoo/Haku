import { cloneElement, isValidElement, useRef } from 'react'

const FileButton: React.FC<FileButtonProps> = ({ accept, disabled, multiple, onChange, trigger }) => {
  const input = useRef<HTMLInputElement>(null)

  if (!isValidElement(trigger)) {
    return null
  }

  function onPress() {
    input.current?.click()
  }

  return (
    <>
      {cloneElement(trigger, { disabled, onPress })}
      <input
        ref={input}
        type="file"
        className="hidden"
        disabled={disabled}
        multiple={multiple}
        onChange={onChange}
        accept={accept?.join(',')}
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
  trigger: React.StrictReactNode
}
