import { useTextField } from '@react-aria/textfield'
import { useObjectRef } from '@react-aria/utils'
import { forwardRef } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'

import Label from 'components/Label'
import clst from 'styles/clst'

const TextInput = forwardRef<HTMLInputElement, React.PropsWithChildren<TextInputProps>>(
  ({ className, defaultValue, onChange, type = 'text', ...props }, forwardedRef) => {
    const ref = useObjectRef(forwardedRef)
    const { labelProps, inputProps, errorMessageProps } = useTextField(props, ref)

    const inputClasses = clst(
      'w-full bg-zinc-600 rounded-md px-3 py-1.5 placeholder:text-blue-50/40 disabled:cursor-not-allowed',
      'focus:outline-none focus:ring-2 focus:ring-offset-zinc-800 focus:ring-offset-2',
      props.errorMessage ? 'focus:ring-red-400' : 'focus:ring-blue-600',
      { 'opacity-50': props.disabled },
      className
    )

    const input = (
      <input
        {...inputProps}
        ref={ref}
        type={type}
        onChange={onChange}
        className={inputClasses}
        disabled={props.disabled}
        defaultValue={defaultValue}
        spellCheck={props.spellCheck}
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

TextInput.displayName = 'TextInput'

export default TextInput

interface TextInputProps extends Partial<Omit<UseFormRegisterReturn, 'ref'>> {
  autoFocus?: React.InputHTMLAttributes<HTMLInputElement>['autoFocus']
  className?: string
  defaultValue?: React.InputHTMLAttributes<HTMLInputElement>['defaultValue']
  disabled?: boolean
  errorMessage?: string
  label?: string
  placeholder: string
  spellCheck?: React.InputHTMLAttributes<HTMLInputElement>['spellCheck']
  type?: 'text' | 'email' | 'url'
}
