import { supabase } from '../helpers/supabaseClient'

interface HeaderProps {
  email?: string
}

export const Header = ({ email }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-bold">YouTube RSS Feed</h1>
      <div className="flex items-center gap-4">
        <p className="text-sm opacity-70">Logged in as: {email}</p>
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
