import { Header } from './components/Header'
import LandingPage from './components/LandingPage'
import { StatusAlert } from './components/StatusAlert'
import { SubscriptionList } from './components/SubscriptionList'
import { VideoGrid } from './components/VideoGrid'
import { useAuth } from './hooks/useAuth'
import { useSubscriptionSync } from './hooks/useSubscriptionSync'

function App() {
  const session = useAuth()
  useSubscriptionSync()

  if (!session) {
    return <LandingPage />
  }

  return (
    <div className="p-4 flex flex-col gap-8 max-w-7xl mx-auto">
      <Header email={session.user.email} />
      <StatusAlert />
      <VideoGrid />
      <SubscriptionList />
    </div>
  )
}

export default App
