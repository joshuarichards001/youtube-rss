import { supabase } from "../helpers/supabaseClient";
import { useAppStore } from "../store/useAppStore";

interface HeaderProps {
  email?: string;
}

export const Header = ({ email }: HeaderProps) => {
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  return (
    <div className="flex justify-between items-center pb-4 border-b border-base-content/10">
      <div className="flex items-center gap-3">
        <button
          className="btn btn-ghost btn-square lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open subscriptions"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-3xl font-bold">YouTube RSS</h1>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm opacity-50 hidden sm:block">{email}</p>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
