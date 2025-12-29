import { useAppStore } from '../store/useAppStore'

export const SubscriptionList = () => {
  const subscriptions = useAppStore((state) => state.subscriptions)
  const loading = useAppStore((state) => state.loading)

  return (
    <div className="collapse collapse-arrow bg-base-200">
      <input type="checkbox" />
      <div className="collapse-title text-xl font-medium">
        Your Subscriptions ({subscriptions.length})
      </div>
      <div className="collapse-content">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="card bg-base-100 shadow-sm text-xs">
              <figure className="px-2 pt-2">
                <img
                  src={sub.thumbnail}
                  alt={sub.title}
                  className="rounded-full w-16 h-16"
                />
              </figure>
              <div className="card-body p-2 items-center text-center">
                <p className="font-bold truncate w-full">{sub.title}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="col-span-full text-center py-10 opacity-50">
              Loading subscriptions...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
