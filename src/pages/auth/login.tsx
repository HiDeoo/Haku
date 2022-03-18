import { Presence } from '@radix-ui/react-presence'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useReducer, useRef } from 'react'
import { useForm } from 'react-hook-form'

import Button from 'components/form/Button'
import Callout from 'components/form/Callout'
import Form from 'components/form/Form'
import MagicCodeInput, { type MagicCodeInputHandle } from 'components/form/MagicCodeInput'
import TextInput from 'components/form/TextInput'
import Flex from 'components/ui/Flex'
import { getAuthErrorMesssage } from 'libs/auth'

const Login: Page = () => {
  const { push, query } = useRouter()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>()

  const emailInput = useRef<HTMLInputElement | null>(null)
  const magicCodeInput = useRef<MagicCodeInputHandle | null>(null)

  const [state, dispatch] = useReducer(stateReducer, initialState)

  const isError = typeof state.errorType === 'string'
  const isValidating = state.status === 'validatingEmail' || state.status === 'validatingCode'
  const shouldShowCodeInput = state.status === 'waitingCode' || state.status === 'validatingCode'

  const { ref: emailInputRef, ...emailInputProps } = register('email', { required: 'required' })

  function setEmailInputRef(ref: HTMLInputElement | null) {
    emailInputRef(ref)
    emailInput.current = ref
  }

  async function onSubmit({ code, email }: FormFields) {
    if (state.status === 'idle') {
      dispatch({ type: 'validatingEmail' })

      const signInResponse = await signIn<'email'>('email-api', { email, redirect: false })

      if (!signInResponse || signInResponse.error) {
        dispatch({ type: 'error', errorType: signInResponse?.error ?? 'Unknown' })

        emailInput.current?.focus()

        return
      }

      dispatch({ type: 'waitingCode' })

      magicCodeInput.current?.focus()
    } else {
      dispatch({ type: 'validatingCode' })

      const callbackUrl = typeof query.callbackUrl === 'string' ? query.callbackUrl : undefined

      push(
        `/api/auth/callback/email-api?email=${encodeURIComponent(email)}&token=${code}${
          callbackUrl ? `&callbackUrl=${callbackUrl}` : ''
        }`
      )
    }
  }

  return (
    <Flex direction="col" className="w-60">
      <Presence present={shouldShowCodeInput}>
        <Callout
          className="animate-modal-content"
          intent="success"
          title="Check your inbox"
          data-state={shouldShowCodeInput ? 'open' : 'closed'}
          message="A login code has been sent to your email address."
        />
      </Presence>
      <Presence present={isError}>
        <Callout
          intent="error"
          className="animate-modal-content"
          data-state={isError ? 'open' : 'closed'}
          message={getAuthErrorMesssage(state.errorType)}
        />
      </Presence>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          autoFocus
          type="email"
          label="Email"
          enterKeyHint="done"
          autoComplete="email"
          {...emailInputProps}
          ref={setEmailInputRef}
          placeholder="user@address.com"
          errorMessage={errors.email?.message}
          readOnly={isValidating || shouldShowCodeInput}
        />
        {shouldShowCodeInput ? (
          <MagicCodeInput
            name="code"
            control={control}
            ref={magicCodeInput}
            disabled={isValidating}
            errorMessage={errors.code?.message}
          />
        ) : null}
        <Button type="submit" primary className="w-full" disabled={isValidating} loading={isValidating}>
          {shouldShowCodeInput ? 'Confirm' : 'Login'}
        </Button>
      </Form>
    </Flex>
  )
}

Login.sidebar = false

export default Login

const initialState: State = {
  errorType: undefined,
  status: 'idle',
}

function stateReducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'validatingEmail': {
      return { status: action.type, errorType: undefined }
    }
    case 'error': {
      return { status: 'idle', errorType: action.errorType }
    }
    case 'waitingCode': {
      return { status: action.type, errorType: undefined }
    }
    case 'validatingCode': {
      return { status: action.type, errorType: undefined }
    }
    default: {
      throw new Error('Unknown login action.')
    }
  }
}

interface State {
  errorType: string | undefined
  status: 'idle' | 'validatingEmail' | 'waitingCode' | 'validatingCode'
}

type Action =
  | { type: 'validatingEmail' }
  | { type: 'error'; errorType: State['errorType'] }
  | { type: 'waitingCode' }
  | { type: 'validatingCode' }

type FormFields = {
  code: string
  email: string
}
