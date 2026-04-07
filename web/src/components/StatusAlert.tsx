import { useAppStore } from "../store/useAppStore";

export const StatusAlert = () => {
  const session = useAppStore((state) => state.session);
  const loading = useAppStore((state) => state.loading);
  const hasProviderToken = !!session?.provider_token;

  if (hasProviderToken) {
    return (
      <div className="text-sm text-success/70 flex items-center gap-2 mb-4">
        <span className="badge badge-success badge-xs" />
        {loading ? "Syncing subscriptions..." : "YouTube connected"}
      </div>
    );
  }

  return (
    <div className="alert alert-warning alert-soft text-sm mb-4">
      <span>
        Missing YouTube access. Please sign out and sign in again if
        subscriptions don't load.
      </span>
    </div>
  );
};
