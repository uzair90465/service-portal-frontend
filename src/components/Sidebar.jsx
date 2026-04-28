import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
  { label: 'Users', to: '/users', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.874M9 20H4v-2a4 4 0 015-3.874m6-4.126a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { label: 'Categories', to: '/categories', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
  { label: 'Services', to: '/services', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { label: 'Locations', to: '/locations', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { label: 'Providers', to: '/providers', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { label: 'Service Requests', to: '/service-requests', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { label: 'Orders', to: '/orders', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { label: 'Reviews', to: '/reviews', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  { label: 'Chat', to: '/chat', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
];

const PROVIDER_NAV = [
  { label: 'Dashboard', to: '/', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
  { label: 'My Profile', to: '/providers', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  { label: 'Available Requests', to: '/service-requests', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { label: 'My Orders', to: '/orders', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { label: 'Chat', to: '/chat', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
];

const USER_NAV = [
  { label: 'Dashboard', to: '/', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
  { label: 'My Requests', to: '/service-requests', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { label: 'My Orders', to: '/orders', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { label: 'Reviews', to: '/reviews', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  { label: 'Chat', to: '/chat', icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
];

const ROLE_COLORS = {
  Admin: { bg: 'rgba(56,189,248,0.1)', text: '#38BDF8', border: 'rgba(56,189,248,0.2)' },
  Provider: { bg: 'rgba(168,85,247,0.1)', text: '#A855F7', border: 'rgba(168,85,247,0.2)' },
  User: { bg: 'rgba(52,211,153,0.1)', text: '#34D399', border: 'rgba(52,211,153,0.2)' },
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  // Handle screen resize automatically
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const role = currentUser?.role || 'User'
  const NAV_ITEMS = role === 'Admin' ? ADMIN_NAV : role === 'Provider' ? PROVIDER_NAV : USER_NAV
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.User

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* 🍔 MOBILE HAMBURGER BUTTON (Only visible on Mobile) */}
      {isMobile && (
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            position: 'fixed', top: '15px', left: '15px', zIndex: 110,
            background: '#38BDF8', color: 'white', border: 'none',
            borderRadius: '6px', padding: '8px', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(56,189,248,0.4)'
          }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16m-7 6h7" />}
          </svg>
        </button>
      )}

      {/* 🌑 MOBILE OVERLAY */}
      {isMobile && mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90 }}
        />
      )}

      {/* ➡️ SIDEBAR */}
      <aside style={{
        width: collapsed ? '64px' : '240px',
        transform: isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        background: 'linear-gradient(180deg, #0F172A 0%, #0B1120 100%)',
        borderRight: '1px solid rgba(56,189,248,0.08)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', 
        position: isMobile ? 'fixed' : 'sticky', 
        top: 0, left: 0,
        flexShrink: 0, 
        zIndex: 100,
      }}>

        {/* Logo */}
        <div style={{
          height: '64px', display: 'flex', alignItems: 'center',
          padding: '0 20px', borderBottom: '1px solid rgba(56,189,248,0.08)',
          gap: '12px', overflow: 'hidden',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 0 16px rgba(56,189,248,0.3)',
          }}>
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: '16px', color: '#F1F5F9', whiteSpace: 'nowrap' }}>
              Service<span style={{ color: '#38BDF8' }}>Portal</span>
            </span>
          )}
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div style={{ padding: '12px 16px 4px' }}>
            <span style={{
              background: roleColor.bg, border: `1px solid ${roleColor.border}`,
              color: roleColor.text, padding: '4px 12px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px'
            }}>
              {role}
            </span>
          </div>
        )}

        {/* Nav Label */}
        {!collapsed && (
          <div style={{ padding: '12px 16px 8px', fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#475569' }}>
            Main Menu
          </div>
        )}

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isMobile && setMobileOpen(false)} // Close sidebar when a link is clicked on mobile
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '8px', marginBottom: '2px',
                textDecoration: 'none',
                color: isActive ? '#38BDF8' : '#94A3B8',
                background: isActive ? 'rgba(56,189,248,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #38BDF8' : '2px solid transparent',
                fontWeight: isActive ? 600 : 400, fontSize: '14px',
                transition: 'all 0.15s ease', whiteSpace: 'nowrap', overflow: 'hidden',
              })}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {(!collapsed || isMobile) && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info + Logout */}
        {(!collapsed || isMobile) && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(56,189,248,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0
              }}>
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser?.name}
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>ID #{currentUser?.id}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '8px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                color: '#F87171', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}

        {/* Collapse toggle (Laptop only) */}
        {!isMobile && (
          <div style={{ padding: collapsed ? '12px 8px' : '0 8px 8px', borderTop: collapsed ? '1px solid rgba(56,189,248,0.08)' : 'none' }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '12px', padding: '10px 12px', borderRadius: '8px',
                background: 'transparent', border: 'none', color: '#475569',
                cursor: 'pointer', fontSize: '14px', transition: 'all 0.15s ease',
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}