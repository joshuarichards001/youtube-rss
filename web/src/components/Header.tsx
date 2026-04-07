import { supabase } from '../helpers/supabaseClient'
import { useAppStore } from '../store/useAppStore'

interface HeaderProps {
  email?: string
}

export const Header = ({ email }: HeaderProps) => {
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button
          className="btn btn-ghost btn-square lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open subscriptions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-4xl font-bold">YouTube RSS Feed</h1>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm opacity-70 hidden sm:block">Logged in as: {email}</p>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
