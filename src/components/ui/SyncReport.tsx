import clst from 'styles/clst'

const SyncReport: React.FC<SyncReportProps> = ({ error, isLoading, lastSync }) => {
  const syncText = lastSync ? `Synced at ${lastSync.toLocaleTimeString()}` : 'Sync issue'
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

export default SyncReport

interface SyncReportProps extends SyncStatus {
  isLoading: boolean
}

export interface SyncStatus {
  error?: unknown
  lastSync?: Date
}
