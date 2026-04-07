import { useAppStore } from '../store/useAppStore'

export const ProgressBar = () => {
  const { progress } = useAppStore()

  if (progress.status === 'idle') {
    return null
  }

  const percentage = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0

  const isCompleted = progress.status === 'completed'
  const isError = progress.status === 'error'

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 bg-base-200 p-4 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${isError ? 'text-error' : ''}`}>
          {progress.message}
        </span>
        <span className={`text-sm font-bold ${isCompleted ? 'text-success' : isError ? 'text-error' : 'text-primary'}`}>
          {percentage}%
        </span>
      </div>
      <progress
        className={`progress w-full transition-all duration-300 ${isCompleted ? 'progress-success' : isError ? 'progress-error' : 'progress-primary'
          }`}
        value={progress.processed}
        max={progress.total}
      ></progress>
    </div>
  )
}
