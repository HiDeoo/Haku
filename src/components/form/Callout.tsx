import { RiCheckLine, RiErrorWarningLine } from 'react-icons/ri'

import Flex from 'components/ui/Flex'
import Icon from 'components/ui/Icon'
import clst from 'styles/clst'

const Callout: React.FC<CalloutProps> = ({ intent, message, title }) => {
  const isSuccess = intent === 'success'
  const isError = intent === 'error'

  const icon = isSuccess ? RiCheckLine : RiErrorWarningLine
  const iconLabel = isSuccess ? 'Success' : 'Error'

  const containerClasses = clst('rounded-md mt-1 mb-3 pl-3 pr-4 py-2.5 border', {
    'bg-green-400/30 text-green-100 border-green-300/30': isSuccess,
    'bg-red-400/50 text-red-100 border-red-200/30': isError,
  })
  const altClasses = clst({
    'text-green-200/100': isSuccess,
    'text-red-200/100': isError,
  })
  const iconClasses = clst('mt-0.5 mr-2', altClasses)
  const titleClasses = clst('block mb-1 -mt-0.5 text-base font-semibold', altClasses)

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

interface CalloutProps {
  intent: 'success' | 'error'
  message: string
  title?: string
}
