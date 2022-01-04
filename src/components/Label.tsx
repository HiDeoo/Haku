import clsx from 'clsx'

const Label: React.FC<LabelProps> = ({ children, disabled, errorMessage, errorMessageProps, ...props }) => {
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

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean
  errorMessage?: string
  errorMessageProps?: React.HTMLAttributes<HTMLElement>
}
