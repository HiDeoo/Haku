import { CheckIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import clsx from 'clsx'

import Flex from 'components/Flex'

const Callout: React.FC<Props> = ({ intent, message }) => {
  const Icon = intent === 'success' ? CheckIcon : ExclamationTriangleIcon

  const containerClasses = clsx('rounded-md mb-3 px-3 py-2.5 border', {
    'bg-green-400/30 text-green-100 border-green-300/30': intent === 'success',
    'bg-red-400/50 text-red-100 border-red-200/30': intent === 'error',
  })

  const iconClasses = clsx('mt-0.5 mr-2.5', {
    'text-green-300/60': intent === 'success',
    'text-red-300/90': intent === 'error',
  })

  return (
    <Flex className={containerClasses}>
      <div className={iconClasses}>
        <Icon />
      </div>
      <div>{message}</div>
    </Flex>
  )
}

export default Callout

interface Props {
  intent: 'success' | 'error'
  message: string
}
