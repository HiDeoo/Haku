import { useTextField } from '@react-aria/textfield'
import { useObjectRef } from '@react-aria/utils'
import clsx from 'clsx'
import { forwardRef, type InputHTMLAttributes, type PropsWithChildren } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'

import styles from 'styles/TextInput.module.css'

const TextInput: React.FC<Props> = forwardRef<HTMLInputElement, PropsWithChildren<Props>>(
  ({ onChange, type = 'text', ...props }, forwardedRef) => {
    const ref = useObjectRef(forwardedRef)
    const { labelProps, inputProps, errorMessageProps } = useTextField(props, ref)

    const inputClasses = clsx(styles.input, props.errorMessage ? 'focus:ring-red-400' : 'focus:ring-blue-600')

    return (
      <div className={styles.container}>
        <div className={styles.labelContainer}>
          <label {...labelProps} className={styles.label}>
            {props.label}
          </label>
          {props.errorMessage && (
            <span {...errorMessageProps} className={styles.error}>
              ({props.errorMessage})
            </span>
          )}
        </div>
        <input {...inputProps} type={type} onChange={onChange} ref={ref} className={inputClasses} />
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'

export default TextInput

interface Props extends Partial<Omit<UseFormRegisterReturn, 'ref'>> {
  autoFocus?: InputHTMLAttributes<HTMLInputElement>['autoFocus']
  errorMessage?: string
  label: string
  placeholder: string
  type?: 'text' | 'email'
}
