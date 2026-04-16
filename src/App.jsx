import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import CategoriesPage from './pages/CategoriesPage'
import ServicesPage from './pages/ServicesPage'
import LocationsPage from './pages/LocationsPage'
import ProviderPage from './pages/ProviderPage'
import ServiceRequestPage from './pages/ServiceRequestPage'
import ReviewsPage from './pages/ReviewsPage'
import ChatPage from './pages/ChatPage'
import OrdersPage from './pages/OrdersPage'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth()
  if (currentUser) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="providers" element={<ProviderPage />} />
        <Route path="service-requests" element={<ServiceRequestPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}