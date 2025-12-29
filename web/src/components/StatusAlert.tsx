import { useAppStore } from '../store/useAppStore'

export const StatusAlert = () => {
  const session = useAppStore((state) => state.session)
  const loading = useAppStore((state) => state.loading)
  const hasProviderToken = !!session?.provider_token

  if (hasProviderToken) {
    return (
      <div className="alert alert-success shadow-md">
        <span>YouTube connected! {loading ? 'Syncing...' : 'Up to date.'}</span>
      </div>
    )
  }

  return (
    <div className="alert alert-warning shadow-md">
      <span>
        Missing YouTube access. Please sign out and sign in again if subscriptions don't load.
      </span>
    </div>
  )
}
