import { type AriaTextFieldOptions, useTextField } from '@react-aria/textfield'
import { useObjectRef } from '@react-aria/utils'
import { type BaseEvent } from '@react-types/shared'
import { forwardRef } from 'react'
import { type ChangeHandler, type UseFormRegisterReturn } from 'react-hook-form'

import { Label } from 'components/form/Label'
import { clst } from 'styles/clst'

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, defaultValue, onChange, type = 'text', ...props }, forwardedRef) => {
    const ref = useObjectRef(forwardedRef)
    const { labelProps, inputProps, errorMessageProps } = useTextField(props, ref)

    const inputClasses = clst(
      'w-full px-3 py-1.5',
      'bg-zinc-600 rounded-md placeholder:text-zinc-100/40 disabled:cursor-not-allowed appearance-none',
      'focus:outline-none focus:ring-2 focus:ring-offset-zinc-800 focus:ring-offset-2',
      props.errorMessage ? 'focus:ring-red-400' : 'focus:ring-blue-600',
      (props.disabled || props.readOnly) && 'opacity-50',
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

export interface TextInputProps extends Partial<Omit<UseFormRegisterReturn, 'ref' | 'onBlur' | 'onChange'>> {
  'aria-label'?: React.ComponentPropsWithoutRef<'input'>['aria-label']
  autoComplete?: React.ComponentPropsWithoutRef<'input'>['autoComplete']
  autoFocus?: React.ComponentPropsWithoutRef<'input'>['autoFocus']
  className?: string
  defaultValue?: React.ComponentPropsWithoutRef<'input'>['defaultValue']
  disabled?: boolean
  enterKeyHint?: React.ComponentPropsWithoutRef<'input'>['enterKeyHint']
  errorMessage?: string
  id?: React.ComponentPropsWithoutRef<'input'>['id']
  inputMode?: React.ComponentPropsWithoutRef<'input'>['inputMode']
  label?: string
  onBlur: AriaTextFieldOptions<'input'>['onBlur']
  onChange: ChangeHandler | React.ChangeEventHandler<HTMLInputElement>
  onKeyDown?: (event: BaseEvent<React.KeyboardEvent<HTMLInputElement>>) => void
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>
  placeholder: string
  readOnly?: React.ComponentPropsWithoutRef<'input'>['readOnly']
  spellCheck?: React.ComponentPropsWithoutRef<'input'>['spellCheck']
  type?: 'text' | 'email' | 'url'
  value?: string
}
