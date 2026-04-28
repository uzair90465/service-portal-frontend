import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/users': 'User Management',
  '/categories': 'Categories',
  '/services': 'Services',
  '/locations': 'Locations',
  '/providers': 'Providers',
  '/service-requests': 'Service Requests',
  '/reviews': 'Reviews',
  '/chat': 'Chat',
  '/orders': 'Orders',
}

export default function Layout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Portal'
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B1120' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: '64px',
          background: 'rgba(15,23,42,0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(56,189,248,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 5,
        }}>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 600, color: '#F1F5F9', letterSpacing: '-0.3px' }}>
              {title}
            </h1>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '1px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* User Info + Bell + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Avatar */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1' }}>
                {currentUser?.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                {currentUser?.role || 'Guest'} — ID #{currentUser?.id}
              </div>
            </div>

            <button onClick={handleLogout}
              style={{
                marginLeft: '8px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#F87171', padding: '6px 14px', borderRadius: '8px',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#FCA5A5' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171' }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}