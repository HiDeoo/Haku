const Label: React.FC<Props> = ({ children, errorMessage, errorMessageProps, ...props }) => {
  return (
    <div className="mb-1">
      <label {...props}>{children}</label>
      {errorMessage && (
        <span {...errorMessageProps} className="ml-1.5 text-xs relative -top-px text-red-400 italic">
          ({errorMessage})
        </span>
      )}
    </div>
  )
}

export default Label

interface Props extends React.LabelHTMLAttributes<HTMLLabelElement> {
  errorMessage?: string
  errorMessageProps?: React.HTMLAttributes<HTMLElement>
}
