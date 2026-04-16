import React, { useEffect, useState, useCallback } from 'react'
import { getDashboardStats } from '../api/dashboardApi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getRequestsByUser } from '../api/serviceRequestApi'
import { getAllServices } from '../api/servicesApi'
import { getAllLocations } from '../api/locationsApi'
import axiosInstance from '../api/axiosInstance'

export default function DashboardPage() {
  const [stats, setStats]                 = useState(null)
  const [loading, setLoading]             = useState(true)
  const [providerModal, setProviderModal] = useState(false)
  const [becoming, setBecoming]           = useState(false)
  const [availableServices, setAvailableServices] = useState([])
  const [availableLocations, setAvailableLocations] = useState([])
  const [providerForm, setProviderForm]   = useState({
    experienceYears: '',
    isAvailable: true,
    selectedServices: [],
    selectedLocations: []
  })
  const { currentUser } = useAuth()
  const navigate        = useNavigate()
  const role            = currentUser?.role

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      if (role === 'Admin') {
        const data = await getDashboardStats()
        setStats(data)
      } else if (role === 'User') {
        const requests = await getRequestsByUser(currentUser.id).catch(() => [])
        setStats({
          requests: Array.isArray(requests) ? requests.length : 0,
          orders: 0,
          reviews: 0,
        })
      } else if (role === 'Provider') {
        const data = await getDashboardStats()
        setStats(data)
      }
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }, [role, currentUser])

  useEffect(() => {
    fetchStats()
    getAllServices().then(d => setAvailableServices(Array.isArray(d) ? d : []))
    getAllLocations().then(d => setAvailableLocations(Array.isArray(d) ? d : []))
  }, [fetchStats])

  const handleBecomeProvider = async (e) => {
    e.preventDefault()
    if (providerForm.selectedServices.length === 0) {
      alert('Please select at least one service')
      return
    }
    if (providerForm.selectedLocations.length === 0) {
      alert('Please select at least one location')
      return
    }
    setBecoming(true)
    try {
      const res = await axiosInstance.post('/Auth/become-provider', {
        userId: currentUser.id,
        experienceYears: parseInt(providerForm.experienceYears),
        isAvailable: providerForm.isAvailable,
        serviceIds: providerForm.selectedServices,
        locationIds: providerForm.selectedLocations,
      })
      localStorage.setItem('token', res.data.token)
      const updatedUser = { ...currentUser, role: 'Provider' }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      alert('You are now a Provider! Please login again.')
      window.location.href = '/login'
    } catch (err) {
      alert(err.message || 'Failed')
    } finally {
      setBecoming(false)
    }
  }

  const toggleService = (id) => {
    const curr = providerForm.selectedServices
    setProviderForm({
      ...providerForm,
      selectedServices: curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]
    })
  }

  const toggleLocation = (id) => {
    const curr = providerForm.selectedLocations
    setProviderForm({
      ...providerForm,
      selectedLocations: curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]
    })
  }

  const COLOR_MAP = {
    sky:     { bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.2)',  text: '#38BDF8',  icon: 'rgba(56,189,248,0.15)'  },
    purple:  { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)', text: '#A855F7', icon: 'rgba(168,85,247,0.15)' },
    emerald: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', text: '#34D399', icon: 'rgba(52,211,153,0.15)' },
    orange:  { bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', text: '#FB923C', icon: 'rgba(251,146,60,0.15)' },
    yellow:  { bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.2)', text: '#FACC15', icon: 'rgba(250,204,21,0.15)' },
  }

  const ADMIN_CARDS = [
    { key: 'users',      label: 'Total Users',      color: 'sky',     link: '/users',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.874M9 20H4v-2a4 4 0 015-3.874m6-4.126a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { key: 'providers',  label: 'Providers',        color: 'purple',  link: '/providers',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { key: 'services',   label: 'Services',         color: 'emerald', link: '/services',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { key: 'categories', label: 'Categories',       color: 'orange',  link: '/categories',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
    { key: 'requests',   label: 'Service Requests', color: 'yellow',  link: '/service-requests',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { key: 'orders',     label: 'Total Orders',     color: 'sky',     link: '/orders',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { key: 'reviews',    label: 'Reviews',          color: 'yellow',  link: '/reviews',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
    { key: 'locations',  label: 'Locations',        color: 'emerald', link: '/locations',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ]

  const USER_CARDS = [
    { key: 'requests', label: 'My Requests', color: 'sky',     link: '/service-requests',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { key: 'orders',   label: 'My Orders',   color: 'emerald', link: '/orders',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { key: 'reviews',  label: 'My Reviews',  color: 'yellow',  link: '/reviews',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  ]

  const PROVIDER_CARDS = [
    { key: 'requests', label: 'Available Requests', color: 'sky',     link: '/service-requests',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { key: 'orders',   label: 'My Orders',          color: 'emerald', link: '/orders',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  ]

  const CARDS = role === 'Admin' ? ADMIN_CARDS : role === 'Provider' ? PROVIDER_CARDS : USER_CARDS

  const ADMIN_LINKS  = [
    { label: 'Service Requests', link: '/service-requests', color: 'sky' },
    { label: 'Manage Providers', link: '/providers',        color: 'purple' },
    { label: 'View Orders',      link: '/orders',           color: 'emerald' },
    { label: 'Open Chat',        link: '/chat',             color: 'orange' },
    { label: 'Check Reviews',    link: '/reviews',          color: 'yellow' },
    { label: 'Manage Users',     link: '/users',            color: 'sky' },
  ]
  const USER_LINKS     = [
    { label: 'New Request', link: '/service-requests', color: 'sky' },
    { label: 'My Orders',   link: '/orders',            color: 'emerald' },
    { label: 'My Reviews',  link: '/reviews',           color: 'yellow' },
    { label: 'Open Chat',   link: '/chat',              color: 'purple' },
  ]
  const PROVIDER_LINKS = [
    { label: 'Available Requests', link: '/service-requests', color: 'sky' },
    { label: 'My Orders',          link: '/orders',            color: 'emerald' },
    { label: 'Open Chat',          link: '/chat',              color: 'purple' },
    { label: 'My Profile',         link: '/providers',         color: 'orange' },
  ]
  const QUICK_LINKS = role === 'Admin' ? ADMIN_LINKS : role === 'Provider' ? PROVIDER_LINKS : USER_LINKS

  return (
    <div className="p-6 min-h-screen bg-[#0F172A]">

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-sky-400">{currentUser?.name}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {role === 'Admin' ? 'Full system overview'
            : role === 'Provider' ? 'Manage your services and orders'
            : 'Track your requests and orders'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${role === 'Admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 mb-8`}>
        {CARDS.map((card) => {
          const c = COLOR_MAP[card.color]
          return (
            <div key={card.key} onClick={() => navigate(card.link)}
              style={{
                background: c.bg, border: `1px solid ${c.border}`,
                borderRadius: '16px', padding: '20px', cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    {card.label}
                  </p>
                  <p style={{ color: '#F1F5F9', fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>
                    {loading ? '...' : stats?.[card.key] ?? 0}
                  </p>
                </div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: c.icon, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: c.text, flexShrink: 0
                }}>
                  {card.icon}
                </div>
              </div>
              <p style={{ color: c.text, fontSize: '11px', marginTop: '12px', fontWeight: 500 }}>
                Click to manage →
              </p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions + Account */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map((item, i) => {
              const c = COLOR_MAP[item.color]
              return (
                <button key={i} onClick={() => navigate(item.link)}
                  style={{
                    background: c.bg, border: `1px solid ${c.border}`,
                    color: c.text, borderRadius: '12px', padding: '12px',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s ease', textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">Your Account</h2>
          <div className="flex items-center gap-4">
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {currentUser?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-lg">{currentUser?.name}</p>
              <p className="text-slate-400 text-sm">{currentUser?.email}</p>
              <span style={{
                background: role === 'Admin' ? 'rgba(56,189,248,0.1)' : role === 'Provider' ? 'rgba(168,85,247,0.1)' : 'rgba(52,211,153,0.1)',
                border: role === 'Admin' ? '1px solid rgba(56,189,248,0.2)' : role === 'Provider' ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(52,211,153,0.2)',
                color: role === 'Admin' ? '#38BDF8' : role === 'Provider' ? '#A855F7' : '#34D399',
                padding: '2px 10px', borderRadius: '20px', fontSize: '11px',
                fontWeight: 600, marginTop: '4px', display: 'inline-block'
              }}>
                {role}
              </span>
            </div>
            <div className="ml-auto">
              <p className="text-slate-500 text-xs">User ID</p>
              <p className="text-sky-400 font-bold text-2xl">#{currentUser?.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Become Provider Banner */}
      {role === 'User' && (
        <div className="mt-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Want to offer services?</h2>
              <p className="text-slate-400 text-sm mt-1">
                Become a Provider and start earning by offering your skills
              </p>
            </div>
            <button onClick={() => setProviderModal(true)}
              style={{
                background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                border: 'none', borderRadius: '12px',
                padding: '12px 24px', color: 'white',
                fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(168,85,247,0.3)'
              }}>
              🚀 Become a Provider
            </button>
          </div>
        </div>
      )}

      {/* Become Provider Modal */}
      {providerModal && role === 'User' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-8 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-2">Become a Provider</h2>
            <p className="text-slate-400 text-sm mb-6">
              Setup your provider profile to start receiving service requests
            </p>
            <form onSubmit={handleBecomeProvider} className="space-y-5">

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Years of Experience</label>
                <input type="number" required min="0" placeholder="e.g. 5"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  value={providerForm.experienceYears}
                  onChange={e => setProviderForm({ ...providerForm, experienceYears: e.target.value })} />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Availability</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  value={providerForm.isAvailable}
                  onChange={e => setProviderForm({ ...providerForm, isAvailable: e.target.value === 'true' })}>
                  <option value="true">Available for Work</option>
                  <option value="false">Not Available Right Now</option>
                </select>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Select Your Services <span className="text-red-400">*</span>
                </label>
                <div style={{
                  background: '#0F172A', border: '1px solid rgba(56,189,248,0.15)',
                  borderRadius: '12px', padding: '12px', maxHeight: '150px', overflowY: 'auto'
                }}>
                  {availableServices.length > 0 ? availableServices.map(s => (
                    <label key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '6px 4px', cursor: 'pointer'
                    }}>
                      <input type="checkbox"
                        checked={providerForm.selectedServices.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                        style={{ accentColor: '#A855F7', width: '16px', height: '16px' }}
                      />
                      <span style={{ color: '#CBD5E1', fontSize: '14px' }}>{s.title}</span>
                    </label>
                  )) : (
                    <p style={{ color: '#475569', fontSize: '13px' }}>Loading services...</p>
                  )}
                </div>
                {providerForm.selectedServices.length > 0 && (
                  <p style={{ color: '#A855F7', fontSize: '12px', marginTop: '4px' }}>
                    {providerForm.selectedServices.length} service(s) selected
                  </p>
                )}
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Select Your Locations <span className="text-red-400">*</span>
                </label>
                <div style={{
                  background: '#0F172A', border: '1px solid rgba(56,189,248,0.15)',
                  borderRadius: '12px', padding: '12px', maxHeight: '150px', overflowY: 'auto'
                }}>
                  {availableLocations.length > 0 ? availableLocations.map(l => (
                    <label key={l.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '6px 4px', cursor: 'pointer'
                    }}>
                      <input type="checkbox"
                        checked={providerForm.selectedLocations.includes(l.id)}
                        onChange={() => toggleLocation(l.id)}
                        style={{ accentColor: '#A855F7', width: '16px', height: '16px' }}
                      />
                      <span style={{ color: '#CBD5E1', fontSize: '14px' }}>{l.name}</span>
                    </label>
                  )) : (
                    <p style={{ color: '#475569', fontSize: '13px' }}>Loading locations...</p>
                  )}
                </div>
                {providerForm.selectedLocations.length > 0 && (
                  <p style={{ color: '#A855F7', fontSize: '12px', marginTop: '4px' }}>
                    {providerForm.selectedLocations.length} location(s) selected
                  </p>
                )}
              </div>

              {/* Warning */}
              <div style={{
                background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: '12px', padding: '12px 16px'
              }}>
                <p className="text-purple-400 text-xs">
                  ⚠️ After becoming a provider, you will be logged out and need to login again.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setProviderModal(false)}
                  className="flex-1 py-3 text-slate-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={becoming}
                  style={{
                    flex: 1, background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                    border: 'none', borderRadius: '12px', padding: '12px',
                    color: 'white', fontSize: '14px', fontWeight: 700,
                    cursor: becoming ? 'not-allowed' : 'pointer',
                    opacity: becoming ? 0.7 : 1
                  }}>
                  {becoming ? 'Processing...' : 'Confirm & Become Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}