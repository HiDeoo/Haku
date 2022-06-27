import { RiCloudOffLine } from 'react-icons/ri'

import { Navbar } from 'components/ui/Navbar'
import { useNetworkStatus } from 'hooks/useNetworkStatus'

export const NetworkStatus: React.FC = () => {
  const { online } = useNetworkStatus()

  if (online) {
    return null
  }

  return <Navbar.Icon tooltip="You are disconnected" iconLabel="Offline" icon={RiCloudOffLine} />
}
