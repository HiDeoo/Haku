import { RiCloudOffLine } from 'react-icons/ri'

import Flex from 'components/ui/Flex'
import Icon from 'components/ui/Icon'
import Tooltip from 'components/ui/Tooltip'
import { useNetworkStatus } from 'hooks/useNetworkStatus'

const NetworkStatus: React.FC = () => {
  const { online } = useNetworkStatus()

  if (online) {
    return null
  }

  return (
    <Tooltip content="You are disconnected">
      <Flex fullHeight alignItems="center" className="shrink-0">
        <Icon icon={RiCloudOffLine} className="h-3.5 w-3.5 text-zinc-500" label="Offline" />
      </Flex>
    </Tooltip>
  )
}

export default NetworkStatus
