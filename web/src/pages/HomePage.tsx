import { ProgressBar } from '../components/ProgressBar'
import { StatusAlert } from '../components/StatusAlert'
import { SubscriptionList } from '../components/SubscriptionList'
import { VideoGrid } from '../components/VideoGrid'

export const HomePage = () => {
  return (
    <>
      <StatusAlert />
      <ProgressBar />
      <VideoGrid />
      <SubscriptionList />
    </>
  )
}
