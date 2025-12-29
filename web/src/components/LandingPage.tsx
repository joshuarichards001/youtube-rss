import { supabase } from "../helpers/supabaseClient"

export default function LandingPage() {
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">YouTube RSS Manager</h1>
          <p className="text-xl text-base-content/70">
            Transform your YouTube subscriptions into a personalized RSS feed
          </p>
        </div>

        <div className="bg-base-100 rounded-box shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">What is this?</h2>
          <p className="text-base-content/80 mb-6 leading-relaxed">
            YouTube RSS Manager syncs your YouTube subscriptions and generates custom RSS feeds,
            giving you full control over how you consume content. Stay up-to-date with your
            favorite creators without the algorithm deciding what you see.
          </p>

          <h3 className="text-lg font-semibold mb-3">Features</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Automatic sync with your YouTube subscriptions</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>No ads, no algorithm, just content you choose</span>
            </li>
          </ul>

          <button
            onClick={handleLogin}
            className="btn btn-primary btn-lg w-full"
          >
            Sign in with Google to Get Started
          </button>
        </div>

        <p className="text-center text-sm text-base-content/60">
          We only request read-only access to your YouTube subscriptions
        </p>
      </div>
    </div>
  )
}
