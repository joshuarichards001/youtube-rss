import { supabase } from './supabaseClient'

export default function Login() {
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/youtube.readonly',
        },
      })
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unknown error occurred')
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="p-8 bg-base-100 rounded-box shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">Welcome</h1>
        <p className="mb-6 text-center">Sign in to continue</p>
        <button
          onClick={handleLogin}
          className="btn btn-primary w-full"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
