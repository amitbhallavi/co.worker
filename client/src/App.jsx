import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import { ToastContainer } from 'react-toastify'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import Talent from './pages/Talent'
import FreelancerProfile from './pages/FreelancerProfile'
import ErrorBoundary from './components/ErrorBoundary'
import UserProfilePage from './pages/UserProfilePage.jsx'
import RegularUser from './components/RegularUser.jsx'
import FindWork from './pages/FindWork.jsx'
import BrowseProjects from './components/BrowseProjects.jsx'
import WalletDashboard from './pages/Walletdashboard.jsx'
import PricingPage from './pages/PricingPage.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import ChatPage from './pages/ChatPage.jsx'
import AdminPayments from './pages/AdminPayments.jsx'
import AssignedProjects from './pages/AssignedProjects.jsx'
import ClientAssignedProjects from './pages/ClientAssignedProjects.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import SubscriptionManagement from './pages/SubscriptionManagement.jsx'
import { initSocket, subscribeToRatingEvents } from './utils/socketManager'
import { fetchUserPlan } from './features/subscription/planSlice'
import { addRatingSocket, updateRatingSocket, deleteRatingSocket } from './features/rating/ratingSlice'

const HIDE_NAVBAR_ROUTES = new Set(['/login', '/register'])

const AppShell = () => {
  const location = useLocation()
  const hideNavbar = HIDE_NAVBAR_ROUTES.has(location.pathname)

  return (
    <>
      {!hideNavbar && <Navbar />}

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

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

const App = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)

  // ── Initialize Socket.IO when user logs in ──────────────────────────────────
  useEffect(() => {
    if (user?.token) {
      initSocket(user.token)
      // Fetch user's current plan on login
      dispatch(fetchUserPlan())
    }
    return () => {
      // Optionally disconnect on logout
      // disconnect()
    }
  }, [user?.token, dispatch])

  // ── Setup real-time rating listeners ──────────────────────────────────────
  useEffect(() => (
    subscribeToRatingEvents({
      onCreated: (data) => dispatch(addRatingSocket(data)),
      onUpdated: (data) => dispatch(updateRatingSocket(data)),
      onDeleted: (data) => dispatch(deleteRatingSocket(data)),
    })
  ), [dispatch])
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
