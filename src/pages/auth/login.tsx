import { Presence } from '@radix-ui/react-presence'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import { useReducer, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from 'components/form/Button'
import { Callout } from 'components/form/Callout'
import { Form } from 'components/form/Form'
import { MagicCodeInput, type MagicCodeInputHandle } from 'components/form/MagicCodeInput'
import { TextInput } from 'components/form/TextInput'
import { Flex } from 'components/ui/Flex'
import { getAuthErrorMesssage } from 'libs/auth'
import { clst } from 'styles/clst'

const Login: Page = () => {
  const { push, query } = useRouter()

  const [isIconLoaded, setIsIconLoaded] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<FormFields>()

  const magicCodeInput = useRef<MagicCodeInputHandle>(null)

  const [state, dispatch] = useReducer(stateReducer, initialState)

  const isError = typeof state.errorType === 'string'
  const isValidating = state.status === 'validatingEmail' || state.status === 'validatingCode'
  const shouldShowCodeInput = state.status === 'waitingCode' || state.status === 'validatingCode'

  function handleIconLoaded() {
    setIsIconLoaded(true)
  }

  async function handleFormSubmit({ code, email }: FormFields) {
    if (state.status === 'idle') {
      dispatch({ type: 'validatingEmail' })

      const signInResponse = await signIn<'email'>('email-api', { email, redirect: false })

      if (!signInResponse || signInResponse.error) {
        dispatch({ type: 'error', errorType: signInResponse?.error ?? 'Unknown' })

        setFocus('email', { shouldSelect: true })

        return
      }

      dispatch({ type: 'waitingCode' })

      requestAnimationFrame(() => {
        magicCodeInput.current?.focus()
      })
    } else {
      dispatch({ type: 'validatingCode' })

      const callbackUrl = typeof query['callbackUrl'] === 'string' ? query['callbackUrl'] : undefined

      push(
        `/api/auth/callback/email-api?email=${encodeURIComponent(email)}&token=${code}${
          callbackUrl ? `&callbackUrl=${callbackUrl}` : ''
        }`
      )
    }
  }

  const iconWrapperClasses = clst(
    'mb-5 flex justify-center',
    isIconLoaded ? 'motion-safe:animate-fade-in' : 'opacity-0'
  )

  return (
    <Flex direction="col" className="w-60">
      <div className={iconWrapperClasses}>
        <img
          width={100}
          height={100}
          onLoad={handleIconLoaded}
          alt="Haku application icon"
          src="/images/icons/favicon.svg"
        />
      </div>
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
      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        <TextInput
          autoFocus
          type="email"
          label="Email"
          enterKeyHint="done"
          autoComplete="email"
          placeholder="user@address.com"
          errorMessage={errors.email?.message}
          readOnly={isValidating || shouldShowCodeInput}
          {...register('email', { required: 'required' })}
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

interface FormFields {
  code: string
  email: string
}
