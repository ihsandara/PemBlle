import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Login from './pages/Login'
import Register from './pages/Register'
import HomePage from './pages/HomePage'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import VerifyEmail from './pages/VerifyEmail'
import VerifyRequest from './pages/VerifyRequest'
import Notifications from './pages/Notifications'
import Users from './pages/Users'
import Policy from './pages/Policy'
import Terms from './pages/Terms'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import ChatList from './pages/Chat/ChatList'
import ChatRoom from './pages/Chat/ChatRoom'

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    // Set RTL direction for Arabic and Kurdish
    const rtlLanguages = ['ar', 'ku']
    const isRtl = rtlLanguages.includes(i18n.language)
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-dark-100">
        <Navbar />
        <div className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/verify-request" element={<VerifyRequest />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            
            {/* Home - Landing for guests, Home for logged users */}
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            
            {/* Chat Routes */}
            <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
            <Route path="/chat/:chatId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App
