import clsx from 'clsx'

const Label: React.FC<Props> = ({ children, disabled, errorMessage, errorMessageProps, ...props }) => {
  const containerClasses = clsx('mb-1', { 'opacity-50': disabled })

  return (
    <div className={containerClasses}>
      <label {...props} className="inline-block w-full">
        {children}
        {errorMessage ? (
          <span {...errorMessageProps} className="ml-1.5 text-xs relative -top-px text-red-400 italic">
            ({errorMessage})
          </span>
        ) : null}
      </label>
    </div>
  )
}

export default Label

interface Props extends React.LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean
  errorMessage?: string
  errorMessageProps?: React.HTMLAttributes<HTMLElement>
}
