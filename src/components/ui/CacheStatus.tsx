import IconAirplaneOff from '~icons/mdi/airplane-off'
import IconFlightTakeoffLine from '~icons/ri/flight-takeoff-line'

import { Navbar } from 'components/ui/Navbar'
import { useContentType } from 'hooks/useContentType'
import { useOfflineCache } from 'hooks/useOfflineCache'

export const CacheStatus = () => {
  const { cType } = useContentType()
  const { availableOffline, ready } = useOfflineCache()

  if (!ready) {
    return null
  }

  const tooltip = `${cType} ${availableOffline ? 'available' : 'unavailable'} for offline use`
  const icon = availableOffline ? IconFlightTakeoffLine : IconAirplaneOff
  const iconLabel = `${availableOffline ? 'Available' : 'Unavailable'} offline`

  return <Navbar.Icon tooltip={tooltip} iconLabel={iconLabel} icon={icon} />
}
