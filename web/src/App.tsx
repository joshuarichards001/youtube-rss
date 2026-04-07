import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import LandingPage from './pages/LandingPage'
import { useAuth } from './hooks/useAuth'
import { useSubscriptionSync } from './hooks/useSubscriptionSync'
import { useAppStore } from './store/useAppStore'
import { HomePage } from './pages/HomePage'
import { WatchPage } from './pages/WatchPage'

function AuthenticatedLayout() {
  const session = useAppStore((state) => state.session)

  if (!session) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="p-4 flex flex-col gap-8 max-w-7xl mx-auto">
      <Header email={session.user.email} />
      <Outlet />
    </div>
  )
}

function RootRoute() {
  const session = useAppStore((state) => state.session)

  if (!session) {
    return <LandingPage />
  }

  return (
    <div className="p-4 flex flex-col gap-8 max-w-7xl mx-auto">
      <Header email={session.user.email} />
      <HomePage />
    </div>
  )
}

function App() {
  useAuth()
  useSubscriptionSync()
  const authLoaded = useAppStore((state) => state.authLoaded)

  if (!authLoaded) {
    return null
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route element={<AuthenticatedLayout />}>
          <Route path="/watch/:videoId" element={<WatchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
