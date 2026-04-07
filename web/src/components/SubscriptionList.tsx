import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export const SubscriptionList = () => {
  const subscriptions = useAppStore((state) => state.subscriptions);
  const loading = useAppStore((state) => state.loading);
  const syncing = useAppStore((state) => state.syncing);
  const syncSubscriptions = useAppStore((state) => state.syncSubscriptions);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const [search, setSearch] = useState("");

  const filtered = search
    ? subscriptions.filter((sub) =>
        sub.title.toLowerCase().includes(search.toLowerCase()),
      )
    : subscriptions;

  const content = (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Subs ({subscriptions.length})
        </h2>
        <div className="flex items-center gap-1">
          <button
            className="btn btn-ghost btn-square btn-sm"
            onClick={() => syncSubscriptions?.()}
            disabled={syncing || !syncSubscriptions}
            title="Sync subscriptions from YouTube"
          >
            {syncing ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </button>
          <button
            className="btn btn-ghost btn-square btn-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close subscriptions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input input-sm input-bordered w-full"
      />
      <div className="flex flex-col gap-2 overflow-y-auto">
        {filtered.map((sub) => (
          <Link
            key={sub.id}
            to={`/channel/${sub.channelId}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <img
              src={sub.thumbnail}
              alt={sub.title}
              className="rounded-full w-8 h-8 shrink-0"
            />
            <p className="text-sm font-medium truncate">{sub.title}</p>
          </Link>
        ))}
        {loading && (
          <div className="text-center py-4 opacity-50 text-sm">
            Loading subscriptions...
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 bg-base-200 rounded-xl overflow-y-auto self-start sticky top-6 max-h-[calc(100vh-3rem)]">
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
  );
};
