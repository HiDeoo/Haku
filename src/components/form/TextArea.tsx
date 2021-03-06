import { useTextField } from '@react-aria/textfield'
import { useObjectRef } from '@react-aria/utils'
import { forwardRef } from 'react'
import { type ChangeHandler, type UseFormRegisterReturn } from 'react-hook-form'

import { Label } from 'components/form/Label'
import { clst } from 'styles/clst'

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, onChange, rows, ...props }, forwardedRef) => {
    const ref = useObjectRef(forwardedRef)
    const { labelProps, inputProps, errorMessageProps } = useTextField<'textarea'>(props, ref)

    const textAreaClasses = clst(
      'w-full px-3 py-1.5 resize-none',
      'bg-zinc-600 rounded-md placeholder:text-zinc-100/40 disabled:cursor-not-allowed appearance-none',
      'focus:outline-none focus:ring-2 focus:ring-offset-zinc-800 focus:ring-offset-2',
      props.errorMessage ? 'focus:ring-red-400' : 'focus:ring-blue-600',
      (props.disabled || props.readOnly) && 'opacity-50',
      className
    )

    const input = (
      <textarea
        {...inputProps}
        ref={ref}
        rows={rows}
        onChange={onChange}
        disabled={props.disabled}
        readOnly={props.readOnly}
        className={textAreaClasses}
        spellCheck={props.spellCheck}
        enterKeyHint={props.enterKeyHint}
      />
    )

    return props.label ? (
      <div className="mb-3 last-of-type:mb-4">
        <Label
          {...labelProps}
          disabled={props.disabled}
          errorMessage={props.errorMessage}
          errorMessageProps={errorMessageProps}
        >
          {props.label}
        </Label>
        {input}
      </div>
    ) : (
      input
    )
  }
)

TextArea.displayName = 'TextArea'

interface TextAreaProps extends Partial<Omit<UseFormRegisterReturn, 'ref' | 'onBlur' | 'onChange'>> {
  autoFocus?: React.ComponentPropsWithoutRef<'textarea'>['autoFocus']
  className?: string
  disabled?: boolean
  enterKeyHint?: React.ComponentPropsWithoutRef<'textarea'>['enterKeyHint']
  errorMessage?: string
  label?: string
  onChange: ChangeHandler | React.ChangeEventHandler<HTMLTextAreaElement>
  placeholder: string
  readOnly?: React.ComponentPropsWithoutRef<'textarea'>['readOnly']
  rows?: React.ComponentPropsWithoutRef<'textarea'>['rows']
  spellCheck?: React.ComponentPropsWithoutRef<'textarea'>['spellCheck']
}
