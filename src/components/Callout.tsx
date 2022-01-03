import clsx from 'clsx'
import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri'

import Icon from 'components/Icon'
import Flex from 'components/Flex'

const Callout: React.FC<Props> = ({ intent, message, title }) => {
  const isSuccess = intent === 'success'
  const isError = intent === 'error'

  const icon = isSuccess ? RiCheckLine : RiErrorWarningLine
  const iconLabel = isSuccess ? 'Success' : 'Error'

  const containerClasses = clsx('rounded-md mt-1 mb-3 pl-3 pr-4 py-2.5 border', {
    'bg-green-400/30 text-green-100 border-green-300/30': isSuccess,
    'bg-red-400/50 text-red-100 border-red-200/30': isError,
  })
  const altClasses = clsx({
    'text-green-200/100': isSuccess,
    'text-red-200/100': isError,
  })
  const iconClasses = clsx('mt-0.5 mr-2', altClasses)
  const titleClasses = clsx('block mb-1 -mt-0.5 text-base font-semibold', altClasses)

  return (
    <Flex className={containerClasses}>
      <div className={iconClasses}>
        <Icon icon={icon} label={iconLabel} />
      </div>
      <div>
        {title ? <strong className={titleClasses}>{title}</strong> : null}
        {message}
      </div>
    </Flex>
  )
}

export default Callout

interface Props {
  intent: 'success' | 'error'
  message: string
  title?: string
}
