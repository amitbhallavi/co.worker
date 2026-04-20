import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import { initSocket, getSocket } from './utils/socketManager'
import { fetchUserPlan } from './features/subscription/planSlice'
import { addRatingSocket, updateRatingSocket, deleteRatingSocket } from './features/rating/ratingSlice'

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
  useEffect(() => {
    try {
      const io = getSocket()
      if (!io) return

      // Listen for new ratings
      io.on('ratingCreated', (data) => {
        console.log('📍 New rating created:', data)
        dispatch(addRatingSocket(data))
      })

      // Listen for updated ratings
      io.on('ratingUpdated', (data) => {
        console.log('✏️ Rating updated:', data)
        dispatch(updateRatingSocket(data))
      })

      // Listen for deleted ratings
      io.on('ratingDeleted', (data) => {
        console.log('🗑️ Rating deleted:', data)
        dispatch(deleteRatingSocket(data))
      })

      // Cleanup listeners on unmount
      return () => {
        io.off('ratingCreated')
        io.off('ratingUpdated')
        io.off('ratingDeleted')
      }
    } catch (err) {
      console.error('Socket.io listener setup error:', err)
    }
  }, [dispatch])
  return (
    <Router>
      <Navbar />
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

        {/* ✅ Chat — /messages (FreelancerProfile navigate karta hai yahan) */}
        <Route path='/messages' element={<ChatPage />} />
        <Route path='/messages/:id' element={<ChatPage />} />

        {/* ✅ OLD /chat routes bhi rakho backward compat ke liye */}
        <Route path='/chat' element={<ChatPage />} />
        <Route path='/chat/:id' element={<ChatPage />} />

        {/* ✅ Wallet — freelancer dashboard */}
        <Route path='/freelancer/wallet' element={<WalletDashboard />} />
        <Route path='/wallet' element={<WalletDashboard />} />

        {/* ✅ Subscription Management */}
        <Route path='/subscription' element={<SubscriptionManagement />} />
        <Route path='/subscription/manage' element={<SubscriptionManagement />} />

        {/* ✅ Assigned Projects */}
        <Route path='/assigned-projects' element={<AssignedProjects />} />
        <Route path='/client-projects' element={<ClientAssignedProjects />} />

        {/* ── Admin ── */}
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        {/* ✅ AdminPayments — add kiya */}
        <Route path='/admin/payments' element={<AdminPayments />} />

      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  )
}

export default App