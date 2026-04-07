import { useAppStore } from '../store/useAppStore'

export const SubscriptionList = () => {
  const subscriptions = useAppStore((state) => state.subscriptions)
  const loading = useAppStore((state) => state.loading)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)

  const content = (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Subscriptions ({subscriptions.length})</h2>
        <button
          className="btn btn-ghost btn-square btn-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close subscriptions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors">
            <img
              src={sub.thumbnail}
              alt={sub.title}
              className="rounded-full w-8 h-8 shrink-0"
            />
            <p className="text-sm font-medium truncate">{sub.title}</p>
          </div>
        ))}
        {loading && (
          <div className="text-center py-4 opacity-50 text-sm">
            Loading subscriptions...
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-base-200 rounded-xl overflow-y-auto max-h-[calc(100vh-8rem)]">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-3/4 max-w-xs bg-base-200 overflow-y-auto shadow-xl ">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
