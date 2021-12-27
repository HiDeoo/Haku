import { useTextField } from '@react-aria/textfield'
import { useObjectRef } from '@react-aria/utils'
import clsx from 'clsx'
import { forwardRef } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'

import Label from 'components/Label'
import styles from 'styles/TextInput.module.css'

const TextInput = forwardRef<HTMLInputElement, React.PropsWithChildren<Props>>(
  ({ onChange, type = 'text', ...props }, forwardedRef) => {
    const ref = useObjectRef(forwardedRef)
    const { labelProps, inputProps, errorMessageProps } = useTextField(props, ref)

    const containerClasses = clsx(styles.container, props.disabled && styles.containerDisabled)
    const inputClasses = clsx(styles.input, props.errorMessage ? 'focus:ring-red-400' : 'focus:ring-blue-600')

    return (
      <div className={containerClasses}>
        <Label {...labelProps} errorMessage={props.errorMessage} errorMessageProps={errorMessageProps}>
          {props.label}
        </Label>
        <input
          {...inputProps}
          ref={ref}
          type={type}
          onChange={onChange}
          className={inputClasses}
          disabled={props.disabled}
        />
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'

export default TextInput

interface Props extends Partial<Omit<UseFormRegisterReturn, 'ref'>> {
  autoFocus?: React.InputHTMLAttributes<HTMLInputElement>['autoFocus']
  disabled?: boolean
  errorMessage?: string
  label: string
  placeholder: string
  type?: 'text' | 'email'
}
