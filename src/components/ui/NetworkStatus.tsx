import IconCloudOffLine from '~icons/ri/cloud-off-line'

import { Navbar } from 'components/ui/Navbar'
import { useNetworkStatus } from 'hooks/useNetworkStatus'

export const NetworkStatus = () => {
  const { online } = useNetworkStatus()

  if (online) {
    return null
  }

  return <Navbar.Icon tooltip="You are disconnected" iconLabel="Offline" icon={IconCloudOffLine} />
}
