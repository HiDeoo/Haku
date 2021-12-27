import clsx from 'clsx'

const Label: React.FC<Props> = ({ children, disabled, errorMessage, errorMessageProps, ...props }) => {
  const classes = clsx('mb-1', disabled && 'opacity-50')

  return (
    <div className={classes}>
      <label {...props} className="inline-block w-full">
        {children}
      </label>
      {errorMessage ? (
        <span {...errorMessageProps} className="ml-1.5 text-xs relative -top-px text-red-400 italic">
          ({errorMessage})
        </span>
      ) : null}
    </div>
  )
}

export default Label

interface Props extends React.LabelHTMLAttributes<HTMLLabelElement> {
  disabled?: boolean
  errorMessage?: string
  errorMessageProps?: React.HTMLAttributes<HTMLElement>
}
