import { RiFileDownloadLine, RiFileWarningLine } from 'react-icons/ri'

import Navbar from 'components/ui/Navbar'
import useContentType from 'hooks/useContentType'
import { useOfflineCache } from 'hooks/useOfflineCache'

const CacheStatus: React.FC = () => {
  const { cType } = useContentType()
  const { availableOffline, ready } = useOfflineCache()

  if (!ready) {
    return null
  }

  const tooltip = `${cType} ${availableOffline ? 'available' : 'unavailable'} for offline use`
  const icon = availableOffline ? RiFileDownloadLine : RiFileWarningLine
  const iconLabel = `${availableOffline ? 'Available' : 'Unavailable'} offline`

  return <Navbar.Icon tooltip={tooltip} iconLabel={iconLabel} icon={icon} />
}

export default CacheStatus
