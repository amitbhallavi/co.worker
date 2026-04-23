import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from './components/Navbar'
import { ToastContainer } from 'react-toastify'
import ErrorBoundary from './components/ErrorBoundary'
import { disconnect, initSocket, subscribeToRatingEvents } from './utils/socketManager'
import { fetchUserPlan } from './features/subscription/planSlice'
import { addRatingSocket, updateRatingSocket, deleteRatingSocket } from './features/rating/ratingSlice'
import Login from './pages/Login'
import Register from './pages/Register'

const HIDE_NAVBAR_ROUTES = new Set(['/login', '/register'])
const Home = lazy(() => import('./pages/Home'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'))
const Talent = lazy(() => import('./pages/Talent'))
const FreelancerProfile = lazy(() => import('./pages/FreelancerProfile'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage.jsx'))
const RegularUser = lazy(() => import('./components/RegularUser.jsx'))
const FindWork = lazy(() => import('./pages/FindWork.jsx'))
const BrowseProjects = lazy(() => import('./components/BrowseProjects.jsx'))
const WalletDashboard = lazy(() => import('./pages/Walletdashboard.jsx'))
const PricingPage = lazy(() => import('./pages/PricingPage.jsx'))
const HowItWorks = lazy(() => import('./pages/HowItWorks.jsx'))
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'))
const AdminPayments = lazy(() => import('./pages/AdminPayments.jsx'))
const AssignedProjects = lazy(() => import('./pages/AssignedProjects.jsx'))
const ClientAssignedProjects = lazy(() => import('./pages/ClientAssignedProjects.jsx'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage.jsx'))
const SubscriptionManagement = lazy(() => import('./pages/SubscriptionManagement.jsx'))

const RouteFallback = () => (
  <div className="min-h-[calc(100vh-4rem)] bg-[#020617] flex items-center justify-center px-4">
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
      </div>
      <p className="text-sm text-white/60">Loading page...</p>
    </div>
  </div>
)

const AppShell = () => {
  const location = useLocation()
  const hideNavbar = HIDE_NAVBAR_ROUTES.has(location.pathname)

  return (
    <>
      {!hideNavbar && <Navbar />}

      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Routes>

            {/* ── Public ── */}
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/how-it-works' element={<HowItWorks />} />
            <Route path='/pricing' element={<PricingPage />} />

            {/* ── Talent / Browse ── */}
            <Route path='/talent' element={<Talent />} />
            <Route path='/profile/:id' element={<FreelancerProfile />} />
            <Route path='/browse-projects' element={<BrowseProjects />} />
            <Route path='/project/:id' element={<ProjectDetailPage />} />

            {/* ── Find Work (Freelancer) ── */}
            <Route path='/find/work' element={<FindWork />} />

            {/* ── User Profiles ── */}
            <Route path='/auth/profile' element={<UserProfilePage />} />
            <Route path='/regularUser' element={<RegularUser />} />

            <Route path='/messages' element={<ChatPage />} />
            <Route path='/messages/:id' element={<ChatPage />} />

            <Route path='/chat' element={<ChatPage />} />
            <Route path='/chat/:id' element={<ChatPage />} />

            <Route path='/freelancer/wallet' element={<WalletDashboard />} />
            <Route path='/wallet' element={<WalletDashboard />} />

            <Route path='/subscription' element={<SubscriptionManagement />} />
            <Route path='/subscription/manage' element={<SubscriptionManagement />} />

            <Route path='/assigned-projects' element={<AssignedProjects />} />
            <Route path='/client-projects' element={<ClientAssignedProjects />} />

            {/* ── Admin ── */}
            <Route path='/admin/dashboard' element={<AdminDashboard />} />
            <Route path='/admin/payments' element={<AdminPayments />} />

          </Routes>
        </Suspense>
      </ErrorBoundary>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

const App = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)

  useEffect(() => {
    if (!user?.token) {
      disconnect()
      return
    }

    initSocket(user.token)
    dispatch(fetchUserPlan())

    return subscribeToRatingEvents({
      onCreated: (data) => dispatch(addRatingSocket(data)),
      onUpdated: (data) => dispatch(updateRatingSocket(data)),
      onDeleted: (data) => dispatch(deleteRatingSocket(data)),
    })
  }, [user?.token, dispatch])

  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
