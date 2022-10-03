import { clst } from 'styles/clst'

export const SyncReport = ({ error, isLoading, lastSync }: SyncReportProps) => {
  const syncText = lastSync ? (
    <>
      Synced at <time dateTime={lastSync.toLocaleTimeString()}>{lastSync.toLocaleTimeString()}</time>
    </>
  ) : (
    'Sync issue'
  )
  const syncClasses = clst('shrink-0 text-xs italic', {
    hidden: (!error && !lastSync) || isLoading,
    'text-zinc-500': lastSync,
    'text-red-500 font-semibold': error,
  })

  return (
    <div className={syncClasses} role="status">
      {syncText}
    </div>
  )
}

interface SyncReportProps extends SyncStatus {
  isLoading: boolean
}

export interface SyncStatus {
  error?: unknown
  lastSync?: Date
}
