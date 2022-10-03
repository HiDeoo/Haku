import { clst } from 'styles/clst'

export const Label = ({ children, disabled, errorMessage, errorMessageProps, ...props }: LabelProps) => {
  const containerClasses = clst('mb-1', disabled && 'opacity-50')

  return (
    <div className={containerClasses}>
      <label {...props} className="inline-block w-full">
        {children}
        {errorMessage ? (
          <span {...errorMessageProps} className="relative -top-px ml-1.5 text-xs italic text-red-400">
            ({errorMessage})
          </span>
        ) : null}
      </label>
    </div>
  )
}

interface LabelProps extends React.ComponentPropsWithoutRef<'label'> {
  disabled?: boolean
  errorMessage?: string
  errorMessageProps?: React.ComponentPropsWithoutRef<'span'>
}
