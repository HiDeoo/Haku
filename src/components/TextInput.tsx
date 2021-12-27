import { useTextField } from '@react-aria/textfield'
import { useObjectRef } from '@react-aria/utils'
import clsx from 'clsx'
import { forwardRef } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'

import Label from 'components/Label'
import styles from 'styles/TextInput.module.css'

const TextInput = forwardRef<HTMLInputElement, React.PropsWithChildren<Props>>(
  ({ className, onChange, type = 'text', ...props }, forwardedRef) => {
    const ref = useObjectRef(forwardedRef)
    const { labelProps, inputProps, errorMessageProps } = useTextField(props, ref)

    const inputClasses = clsx(
      styles.input,
      props.errorMessage ? 'focus:ring-red-400' : 'focus:ring-blue-600',
      props.disabled && 'opacity-50',
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
      />
    )

    return props.label ? (
      <div className={styles.container}>
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

interface Props extends Partial<Omit<UseFormRegisterReturn, 'ref'>> {
  autoFocus?: React.InputHTMLAttributes<HTMLInputElement>['autoFocus']
  className?: string
  disabled?: boolean
  errorMessage?: string
  label?: string
  placeholder: string
  type?: 'text' | 'email'
}
