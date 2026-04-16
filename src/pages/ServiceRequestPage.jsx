import React, { useEffect, useState, useCallback } from 'react'
import { getAllRequests, createRequest, getRequestsByUser, getRequestsForProvider } from '../api/serviceRequestApi'
import { createOffer, getOffersByRequest, acceptOffer } from '../api/requestOfferApi'
import { getAllServices } from '../api/servicesApi'
import { getAllLocations } from '../api/locationsApi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const STATUS_COLORS = {
  Pending:    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  Accepted:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Rejected:   'bg-red-500/10 text-red-400 border border-red-500/20',
  InProgress: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  Completed:  'bg-purple-500/10 text-purple-400 border border-purple-500/20',
}

export default function ServiceRequestPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const role = currentUser?.role

  const [requests, setRequests]   = useState([])
  const [services, setServices]   = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [message, setMessage]     = useState(null)

  const [newRequestModal, setNewRequestModal] = useState(false)
  const [offerModal, setOfferModal]           = useState(false)
  const [viewOffersModal, setViewOffersModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [offers, setOffers]                   = useState([])
  const [offersLoading, setOffersLoading]     = useState(false)

  const [offerForm, setOfferForm] = useState({
    providerId: currentUser?.id || '',
    offeredPrice: '', message: ''
  })

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchDropdowns = useCallback(async () => {
    const [s, l] = await Promise.all([getAllServices(), getAllLocations()])
    setServices(Array.isArray(s) ? s : [])
    setLocations(Array.isArray(l) ? l : [])
  }, [])

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      let data = []
      if (role === 'Admin') {
        data = await getAllRequests()
      } else if (role === 'User') {
        data = await getRequestsByUser(currentUser.id)
      } else if (role === 'Provider') {
        data = await getRequestsForProvider(currentUser.id)
      }
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      showMsg('Failed to load requests', 'error')
    } finally {
      setLoading(false)
    }
  }, [role, currentUser])

  useEffect(() => {
    fetchDropdowns()
    fetchRequests()
  }, [fetchDropdowns, fetchRequests])

  const handleCreateRequest = async (e) => {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.target)
    try {
      await createRequest({
        userId: currentUser.id,
        serviceId: Number(form.get('serviceId')),
        locationId: Number(form.get('locationId')),
        problemDescription: form.get('problemDescription')
      })
      showMsg('Request created!')
      setNewRequestModal(false)
      fetchRequests()
    } catch (err) {
      showMsg('Failed to create request', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSendOffer = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createOffer({
        requestId: selectedRequest.id,
        providerId: currentUser.id,
        offeredPrice: parseFloat(offerForm.offeredPrice),
        message: offerForm.message
      })
      showMsg('Offer sent!')
      setOfferModal(false)
      setOfferForm({ providerId: currentUser.id, offeredPrice: '', message: '' })
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleViewOffers = async (request) => {
    setSelectedRequest(request)
    setViewOffersModal(true)
    setOffersLoading(true)
    try {
      const data = await getOffersByRequest(request.id)
      setOffers(Array.isArray(data) ? data : [])
    } catch (err) {
      showMsg('Failed to load offers', 'error')
      setOffers([])
    } finally {
      setOffersLoading(false)
    }
  }

  const handleAcceptOffer = async (offerId) => {
    setSaving(true)
    try {
      const res = await acceptOffer(offerId)
      showMsg(`Offer accepted! Order #${res.orderId} created`)
      setViewOffersModal(false)
      fetchRequests()
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const pageTitle = role === 'Admin' ? 'All Service Requests'
    : role === 'Provider' ? 'Available Requests'
    : 'My Requests'

  const pageSubtitle = role === 'Admin' ? 'Manage all service requests'
    : role === 'Provider' ? 'Requests matching your services'
    : 'Track your service requests'

  return (
    <div className="p-6 min-h-screen bg-[#0F172A]">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
          <p className="text-slate-400 text-sm">{pageSubtitle}</p>
        </div>
        {role === 'User' && (
          <button onClick={() => setNewRequestModal(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/20">
            + New Request
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Service</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Problem</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
            ) : requests.length > 0 ? requests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 text-slate-500 font-mono text-sm">#{r.id}</td>
                <td className="px-6 py-4">
                  <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-medium">
                    {r.serviceTitle || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">{r.locationName || 'N/A'}</td>
                <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{r.problemDescription}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || STATUS_COLORS.Pending}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {role === 'User' && (
                      <>
                        <button onClick={() => handleViewOffers(r)}
                          className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                          View Offers
                        </button>
                        <button onClick={() => navigate(`/chat?requestId=${r.id}&receiverId=0`)}
                          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                          Chat
                        </button>
                      </>
                    )}
                    {role === 'Provider' && (
                      <>
                        <button onClick={() => { setSelectedRequest(r); setOfferModal(true) }}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                          Send Offer
                        </button>
                        <button onClick={() => navigate(`/chat?requestId=${r.id}&receiverId=${r.userId}`)}
                          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                          Chat
                        </button>
                      </>
                    )}
                    {role === 'Admin' && (
                      <span className="text-slate-500 text-xs">View Only</span>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                No requests found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: NEW REQUEST */}
      {newRequestModal && role === 'User' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Create Service Request</h2>
            <form onSubmit={handleCreateRequest} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Select Service</label>
                <select name="serviceId" required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="">-- Select Service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Select Location</label>
                <select name="locationId" required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="">-- Select Location --</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Problem Description</label>
                <textarea name="problemDescription" required rows="3" placeholder="Describe the problem..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setNewRequestModal(false)}
                  className="flex-1 py-3 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND OFFER */}
      {offerModal && selectedRequest && role === 'Provider' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-1">Send Offer</h2>
            <p className="text-slate-400 text-sm mb-6">
              Request <span className="text-sky-400 font-semibold">#{selectedRequest.id}</span> — {selectedRequest.serviceTitle}
            </p>
            <form onSubmit={handleSendOffer} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Offered Price (Rs.)</label>
                <input type="number" step="0.01" required placeholder="e.g. 1500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={offerForm.offeredPrice}
                  onChange={e => setOfferForm({ ...offerForm, offeredPrice: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                <textarea rows="3" required placeholder="e.g. I will fix it today..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  value={offerForm.message}
                  onChange={e => setOfferForm({ ...offerForm, message: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOfferModal(false)}
                  className="flex-1 py-3 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                  {saving ? 'Sending...' : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW OFFERS */}
      {viewOffersModal && selectedRequest && role === 'User' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-1">Offers Received</h2>
            <p className="text-slate-400 text-sm mb-6">
              Request <span className="text-sky-400 font-semibold">#{selectedRequest.id}</span> — {selectedRequest.serviceTitle}
            </p>
            {offersLoading ? (
              <div className="text-center text-slate-500 py-8">Loading offers...</div>
            ) : offers.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-slate-100 font-semibold">{offer.providerName || `Provider #${offer.providerId}`}</p>
                        <p className="text-slate-400 text-sm mt-1">{offer.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold text-lg">Rs. {offer.offeredPrice}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[offer.status] || STATUS_COLORS.Pending}`}>
                          {offer.status}
                        </span>
                      </div>
                    </div>
                    {offer.status === 'Pending' && (
                      <button onClick={() => handleAcceptOffer(offer.id)} disabled={saving}
                        className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-all">
                        {saving ? 'Accepting...' : 'Accept This Offer'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">No offers received yet</div>
            )}
            <button onClick={() => setViewOffersModal(false)}
              className="w-full mt-6 py-3 text-slate-400 hover:text-white transition-colors">
              Close
            </button>
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