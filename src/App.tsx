import { Navigate, Route, Routes } from 'react-router-dom'
import { LiveAnnouncerProvider } from './components/common/LiveAnnouncer'
import { AppShell } from './components/layout/AppShell'
import { RequireAuth } from './components/layout/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { TimelinePage } from './pages/TimelinePage'
import { DiscoverPage } from './pages/DiscoverPage'
import { ProfilePage } from './pages/ProfilePage'
import { MessagesPage } from './pages/MessagesPage'
import { ForumsPage } from './pages/ForumsPage'
import { ForumDetailPage } from './pages/ForumDetailPage'
import { EventsPage } from './pages/EventsPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { RequestsPage } from './pages/RequestsPage'

export default function App() {
  return (
    <LiveAnnouncerProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<TimelinePage />} />
            <Route path="people" element={<DiscoverPage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:conversationId" element={<MessagesPage />} />
            <Route path="forums" element={<ForumsPage />} />
            <Route path="forums/:forumId" element={<ForumDetailPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:eventId" element={<EventDetailPage />} />
            <Route path="requests" element={<RequestsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LiveAnnouncerProvider>
  )
}
