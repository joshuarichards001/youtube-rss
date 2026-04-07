import { ProgressBar } from '../components/ProgressBar'
import { StatusAlert } from '../components/StatusAlert'
import { SubscriptionList } from '../components/SubscriptionList'
import { VideoGrid } from '../components/VideoGrid'

export const HomePage = () => {
  return (
    <>
      <StatusAlert />
      <ProgressBar />
      <div className="flex gap-6">
        <SubscriptionList />
        <div className="flex-1 min-w-0">
          <VideoGrid />
        </div>
      </div>
    </>
  )
}
