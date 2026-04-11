
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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




const App = () => {
  return (
    <Router>

      <Navbar />

      <Routes>

        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/admin/dashboard' element={< AdminDashboard />} />
        <Route path='/auth/profile' element={<UserProfilePage />} />
        <Route path='/regularUser' element={<RegularUser />} />
        <Route path='/talent' element={< Talent />} />
        <Route path='/profile/:id' element={<FreelancerProfile />} />
        <Route path='/find/work' element={<FindWork />} />
        <Route path="/browse-projects" element={<BrowseProjects />} />









      </Routes>

      <ToastContainer />

    </Router>


  )
}

export default App
