import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastProvider } from './context/ToastContext'

import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateCampaign from './pages/CreateCampaign'
import CampaignList from './pages/CampaignList'
import CampaignDetails from './pages/CampaignDetails'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import DaoVoting from './pages/DaoVoting'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <ToastProvider>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute roles={['creator', 'admin']}>
                  <CreateCampaign />
                </ProtectedRoute>
              }
            />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dao"
              element={
                <ProtectedRoute>
                  <DaoVoting />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </ToastProvider>
    </div>
  )
}
