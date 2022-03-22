import { type AriaTextFieldOptions, useTextField } from '@react-aria/textfield'
import { useObjectRef } from '@react-aria/utils'
import { forwardRef } from 'react'
import { type ChangeHandler, type UseFormRegisterReturn } from 'react-hook-form'

import Label from 'components/form/Label'
import clst from 'styles/clst'

const TextInput = forwardRef<HTMLInputElement, React.PropsWithChildren<TextInputProps>>(
  ({ className, defaultValue, onChange, type = 'text', ...props }, forwardedRef) => {
    const ref = useObjectRef(forwardedRef)
    const { labelProps, inputProps, errorMessageProps } = useTextField(props, ref)

    const inputClasses = clst(
      'w-full px-3 py-1.5',
      'bg-zinc-600 rounded-md placeholder:text-blue-50/40 disabled:cursor-not-allowed appearance-none',
      'focus:outline-none focus:ring-2 focus:ring-offset-zinc-800 focus:ring-offset-2',
      props.errorMessage ? 'focus:ring-red-400' : 'focus:ring-blue-600',
      { 'opacity-50': props.disabled || props.readOnly },
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
        readOnly={props.readOnly}
        defaultValue={defaultValue}
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

TextInput.displayName = 'TextInput'

export default TextInput

interface TextInputProps extends Partial<Omit<UseFormRegisterReturn, 'ref' | 'onBlur' | 'onChange'>> {
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete']
  autoFocus?: React.InputHTMLAttributes<HTMLInputElement>['autoFocus']
  className?: string
  defaultValue?: React.InputHTMLAttributes<HTMLInputElement>['defaultValue']
  disabled?: boolean
  enterKeyHint?: React.InputHTMLAttributes<HTMLInputElement>['enterKeyHint']
  errorMessage?: string
  id?: React.InputHTMLAttributes<HTMLInputElement>['id']
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode']
  label?: string
  onBlur: AriaTextFieldOptions<'input'>['onBlur']
  onChange: ChangeHandler | React.ChangeEventHandler<HTMLInputElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>
  placeholder: string
  readOnly?: React.InputHTMLAttributes<HTMLInputElement>['readOnly']
  spellCheck?: React.InputHTMLAttributes<HTMLInputElement>['spellCheck']
  type?: 'text' | 'email' | 'url'
  value?: string
}
