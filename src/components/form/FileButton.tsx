import { cloneElement, isValidElement, useRef } from 'react'

const FileButton: React.FC<FileButtonProps> = ({ accept, multiple, onChange, trigger }) => {
  const input = useRef<HTMLInputElement>(null)

  if (!isValidElement(trigger)) {
    return null
  }

  function onPress() {
    input.current?.click()
  }

  return (
    <>
      {cloneElement(trigger, { onPress })}
      <input
        ref={input}
        type="file"
        className="hidden"
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
  multiple?: boolean
  onChange: React.ChangeEventHandler<HTMLInputElement>
  trigger: React.StrictReactNode
}
