import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { Header } from "./components/Header";
import { SubscriptionList } from "./components/SubscriptionList";
import { useAuth } from "./hooks/useAuth";
import { useSubscriptionSync } from "./hooks/useSubscriptionSync";
import { ChannelPage } from "./pages/ChannelPage";
import { HomePage } from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import { WatchPage } from "./pages/WatchPage";
import { useAppStore } from "./store/useAppStore";

function AuthenticatedLayout() {
  const session = useAppStore((state) => state.session);

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-4 flex flex-col gap-6 mx-auto min-h-screen bg-base-300">
      <Header email={session.user.email} />
      <div className="flex gap-6 items-start">
        <SubscriptionList />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function RootRoute() {
  const session = useAppStore((state) => state.session);

  if (!session) {
    return <LandingPage />;
  }

  return (
    <div className="p-4 flex flex-col gap-6 mx-auto min-h-screen bg-base-300">
      <Header email={session.user.email} />
      <div className="flex gap-6 items-start">
        <SubscriptionList />
        <div className="flex-1 min-w-0">
          <HomePage />
        </div>
      </div>
    </div>
  );
}

function App() {
  useAuth();
  useSubscriptionSync();
  const authLoaded = useAppStore((state) => state.authLoaded);

  if (!authLoaded) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route element={<AuthenticatedLayout />}>
          <Route path="/watch/:videoId" element={<WatchPage />} />
          <Route path="/channel/:channelId" element={<ChannelPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
