import React, { useEffect, useState, useCallback } from 'react'
import { createProfile, assignService, assignLocation, getProvider, getAllProviders, updateProfile, deleteProfile, removeService, removeLocation } from '../api/providerApi'
import { getAllServices } from '../api/servicesApi'
import { getAllLocations } from '../api/locationsApi'
import { getAllUsers } from '../api/usersApi'
import { useAuth } from '../context/AuthContext'

export default function ProviderPage() {
  const { currentUser } = useAuth()
  const role = currentUser?.role

  const TABS = role === 'Admin'
    ? ['All Providers', 'Profile Setup', 'Assign Services', 'Assign Locations']
    : ['My Profile', 'Assign Services', 'Assign Locations']

  const [activeTab, setActiveTab]     = useState(0)
  const [providers, setProviders]     = useState([])
  const [myProfile, setMyProfile]     = useState(null)
  const [services, setServices]       = useState([])
  const [locations, setLocations]     = useState([])
  const [allUsers, setAllUsers]       = useState([])
  const [saving, setSaving]           = useState(false)
  const [loading, setLoading]         = useState(false)
  const [message, setMessage]         = useState(null)
  const [editData, setEditData]       = useState(null)
  const [detailData, setDetailData]   = useState(null)
  const [detailModal, setDetailModal] = useState(false)

  const [profileForm, setProfileForm] = useState({
    userId: currentUser?.id || '',
    experienceYears: '',
    isAvailable: true,
    rating: ''
  })
  const [serviceForm, setServiceForm]   = useState({ providerId: role === 'Provider' ? currentUser?.id : '', serviceId: '' })
  const [locationForm, setLocationForm] = useState({ providerId: role === 'Provider' ? currentUser?.id : '', locationId: '' })

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchDropdowns = useCallback(async () => {
    const [s, l] = await Promise.all([getAllServices(), getAllLocations()])
    setServices(Array.isArray(s) ? s : [])
    setLocations(Array.isArray(l) ? l : [])
  }, [])

  const fetchProviders = useCallback(async () => {
    setLoading(true)
    try {
      if (role === 'Admin') {
        const data = await getAllProviders()
        setProviders(Array.isArray(data) ? data : [])
      } else if (role === 'Provider') {
        const data = await getProvider(currentUser.id)
        setMyProfile(data)
      }
    } catch (err) {
      showMsg('Failed to load', 'error')
    } finally {
      setLoading(false)
    }
  }, [role, currentUser])

  useEffect(() => {
    fetchDropdowns()
    fetchProviders()
    if (role === 'Admin') {
      getAllUsers().then(d => setAllUsers(Array.isArray(d) ? d : []))
    }
  }, [fetchDropdowns, fetchProviders, role])

  const handleViewDetail = async (userId) => {
    try {
      const data = await getProvider(userId)
      setDetailData(data)
      setDetailModal(true)
    } catch (err) {
      showMsg('Failed to load details', 'error')
    }
  }

  const openEdit = (provider) => {
    setEditData(provider)
    setProfileForm({
      userId: provider.userId,
      experienceYears: provider.experienceYears,
      isAvailable: provider.isAvailable,
      rating: provider.rating || ''
    })
    setActiveTab(role === 'Admin' ? 1 : 0)
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this provider profile?')) return
    try {
      await deleteProfile(userId)
      showMsg('Provider deleted!')
      fetchProviders()
    } catch (err) {
      showMsg('Cannot delete — related records exist', 'error')
    }
  }

  const handleProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        userId: parseInt(profileForm.userId),
        experienceYears: parseInt(profileForm.experienceYears),
        isAvailable: profileForm.isAvailable,
        rating: profileForm.rating ? parseFloat(profileForm.rating) : null
      }
      if (editData) {
        await updateProfile(editData.userId, payload)
        showMsg('Profile updated!')
      } else {
        await createProfile(payload)
        showMsg('Profile created!')
      }
      setEditData(null)
      fetchProviders()
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleService = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await assignService({
        providerId: parseInt(serviceForm.providerId),
        serviceId: parseInt(serviceForm.serviceId)
      })
      showMsg('Service assigned!')
      setServiceForm({ ...serviceForm, serviceId: '' })
      fetchProviders()
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLocation = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await assignLocation({
        providerId: parseInt(locationForm.providerId),
        locationId: parseInt(locationForm.locationId)
      })
      showMsg('Location assigned!')
      setLocationForm({ ...locationForm, locationId: '' })
      fetchProviders()
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveService = async (providerId, serviceId) => {
    try {
      await removeService(providerId, serviceId)
      showMsg('Service removed!')
      const data = await getProvider(providerId)
      setDetailData(data)
    } catch (err) {
      showMsg('Failed to remove', 'error')
    }
  }

  const handleRemoveLocation = async (providerId, locationId) => {
    try {
      await removeLocation(providerId, locationId)
      showMsg('Location removed!')
      const data = await getProvider(providerId)
      setDetailData(data)
    } catch (err) {
      showMsg('Failed to remove', 'error')
    }
  }

  return (
    <div className="p-6 min-h-screen bg-[#0F172A]">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {role === 'Admin' ? 'Provider Management' : 'My Provider Profile'}
          </h1>
          <p className="text-slate-400 text-sm">
            {role === 'Admin' ? 'Manage provider profiles, services and locations' : 'Manage your profile, services and locations'}
          </p>
        </div>
        {role === 'Admin' && (
          <button
            onClick={() => { setEditData(null); setProfileForm({ userId: '', experienceYears: '', isAvailable: true, rating: '' }); setActiveTab(1) }}
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/20"
          >
            + Create Profile
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-800/40 p-1 rounded-xl w-fit border border-slate-700/50">
        {TABS.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === i
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ADMIN: ALL PROVIDERS */}
      {role === 'Admin' && activeTab === 0 && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Availability</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
              ) : providers.length > 0 ? providers.map((p) => (
                <tr key={p.userId} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono text-sm">#{p.userId}</td>
                  <td className="px-6 py-4 font-semibold text-slate-100">{p.userName || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-300">{p.experienceYears} years</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {p.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-medium">
                      ⭐ {p.rating ?? 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleViewDetail(p.userId)}
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                        Details
                      </button>
                      <button onClick={() => openEdit(p)}
                        className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.userId)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No providers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PROVIDER: MY PROFILE */}
      {role === 'Provider' && activeTab === 0 && !editData && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
          {loading ? (
            <p className="text-slate-500">Loading profile...</p>
          ) : myProfile?.profile ? (
            <div>
              <div className="flex items-center gap-6 mb-6">
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A855F7, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 700, color: 'white'
                }}>
                  {currentUser?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">{currentUser?.name}</h2>
                  <p className="text-slate-400 text-sm">{currentUser?.email}</p>
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                    Provider
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-white font-bold text-xl">{myProfile.profile.experienceYears} years</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Availability</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    myProfile.profile.isAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {myProfile.profile.isAvailable ? 'Available' : 'Not Available'}
                  </span>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Rating</p>
                  <p className="text-yellow-400 font-bold text-xl">⭐ {myProfile.profile.rating ?? 'N/A'}</p>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3">My Services</h3>
                <div className="flex flex-wrap gap-2">
                  {myProfile.services?.length > 0 ? myProfile.services.map((s, i) => (
                    <span key={i} className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-medium">
                      Service #{s.serviceId}
                    </span>
                  )) : <p className="text-slate-500 text-sm">No services assigned</p>}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3">My Locations</h3>
                <div className="flex flex-wrap gap-2">
                  {myProfile.locations?.length > 0 ? myProfile.locations.map((l, i) => (
                    <span key={i} className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-medium">
                      Location #{l.locationId}
                    </span>
                  )) : <p className="text-slate-500 text-sm">No locations assigned</p>}
                </div>
              </div>
              <button onClick={() => openEdit(myProfile.profile)}
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-500 mb-4">No profile found</p>
            </div>
          )}
        </div>
      )}

      {/* PROFILE SETUP FORM */}
      {((role === 'Admin' && activeTab === 1) || (role === 'Provider' && activeTab === 0 && editData)) && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 mt-4">
          <h2 className="text-lg font-bold text-white mb-6">{editData ? 'Update Profile' : 'Create Profile'}</h2>
          <form onSubmit={handleProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* Admin — User dropdown */}
              {role === 'Admin' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Select User</label>
                  <select required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                    value={profileForm.userId}
                    onChange={e => setProfileForm({ ...profileForm, userId: e.target.value })}>
                    <option value="">-- Select User --</option>
                 {allUsers.map(u => (
  <option key={u.id} value={u.id}>{u.name}</option>
))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Experience Years</label>
                <input type="number" required placeholder="e.g. 5"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={profileForm.experienceYears}
                  onChange={e => setProfileForm({ ...profileForm, experienceYears: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Availability</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={profileForm.isAvailable}
                  onChange={e => setProfileForm({ ...profileForm, isAvailable: e.target.value === 'true' })}>
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Rating (Optional)</label>
                <input type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={profileForm.rating}
                  onChange={e => setProfileForm({ ...profileForm, rating: e.target.value })} />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-sky-500 hover:bg-sky-600 text-white px-10 py-3 rounded-xl font-bold disabled:opacity-50">
                {saving ? 'Saving...' : editData ? 'Update Profile' : 'Create Profile'}
              </button>
              <button type="button" onClick={() => { setEditData(null); setActiveTab(0) }}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ASSIGN SERVICES */}
      {((role === 'Admin' && activeTab === 2) || (role === 'Provider' && activeTab === 1)) && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-6">
            {role === 'Provider' ? 'Add Service to My Profile' : 'Assign Service to Provider'}
          </h2>
          <form onSubmit={handleService}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {role === 'Admin' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Select Provider</label>
                  <select required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                    value={serviceForm.providerId}
                    onChange={e => setServiceForm({ ...serviceForm, providerId: e.target.value })}>
                    <option value="">-- Select Provider --</option>
                  {providers.map(p => (
  <option key={p.userId} value={p.userId}>{p.userName}</option>
))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Select Service</label>
                <select required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={serviceForm.serviceId}
                  onChange={e => setServiceForm({ ...serviceForm, serviceId: e.target.value })}>
                  <option value="">-- Select Service --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-8">
              <button type="submit" disabled={saving}
                className="bg-sky-500 hover:bg-sky-600 text-white px-10 py-3 rounded-xl font-bold disabled:opacity-50">
                {saving ? 'Assigning...' : 'Assign Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ASSIGN LOCATIONS */}
      {((role === 'Admin' && activeTab === 3) || (role === 'Provider' && activeTab === 2)) && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-6">
            {role === 'Provider' ? 'Add Location to My Profile' : 'Assign Location to Provider'}
          </h2>
          <form onSubmit={handleLocation}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {role === 'Admin' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Select Provider</label>
                  <select required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                    value={locationForm.providerId}
                    onChange={e => setLocationForm({ ...locationForm, providerId: e.target.value })}>
                    <option value="">-- Select Provider --</option>
                  {providers.map(p => (
  <option key={p.userId} value={p.userId}>{p.userName}</option>
))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Select Location</label>
                <select required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={locationForm.locationId}
                  onChange={e => setLocationForm({ ...locationForm, locationId: e.target.value })}>
                  <option value="">-- Select Location --</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-8">
              <button type="submit" disabled={saving}
                className="bg-sky-500 hover:bg-sky-600 text-white px-10 py-3 rounded-xl font-bold disabled:opacity-50">
                {saving ? 'Assigning...' : 'Assign Location'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModal && detailData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Provider Details</h2>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Assigned Services</h3>
              {detailData.services?.length > 0 ? (
                <div className="space-y-2">
                  {detailData.services.map((s, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-900/50 px-4 py-2 rounded-lg">
                      <span className="text-sky-400 text-sm">Service #{s.serviceId}</span>
                      <button onClick={() => handleRemoveService(detailData.profile.userId, s.serviceId)}
                        className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-500 text-sm">No services assigned</p>}
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Assigned Locations</h3>
              {detailData.locations?.length > 0 ? (
                <div className="space-y-2">
                  {detailData.locations.map((l, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-900/50 px-4 py-2 rounded-lg">
                      <span className="text-purple-400 text-sm">Location #{l.locationId}</span>
                      <button onClick={() => handleRemoveLocation(detailData.profile.userId, l.locationId)}
                        className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-500 text-sm">No locations assigned</p>}
            </div>
            <button onClick={() => setDetailModal(false)}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {message && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl text-white font-semibold shadow-xl z-50 ${
          message.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}