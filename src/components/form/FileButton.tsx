import { cloneElement, isValidElement, useRef } from 'react'

const FileButton: React.FC<FileButtonProps> = ({ onChange, trigger }) => {
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
      <input type="file" className="hidden" ref={input} onChange={onChange} />
    </>
  )
}

export default FileButton

interface FileButtonProps {
  onChange: React.ChangeEventHandler<HTMLInputElement>
  trigger: React.StrictReactNode
}
