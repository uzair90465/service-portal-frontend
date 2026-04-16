import React, { useEffect, useState, useCallback } from 'react'
import { createReview, getAllReviews, getReviewByOrder, updateReview, deleteReview } from '../api/reviewsApi'
import { getOrdersByUser } from '../api/ordersApi'
import { useAuth } from '../context/AuthContext'

const RATING_STARS = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-yellow-400' : 'text-slate-600'}>★</span>
  ))
}

export default function ReviewsPage() {
  const { currentUser } = useAuth()
  const role = currentUser?.role

  const [reviews, setReviews]     = useState([])
  const [myOrders, setMyOrders]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData]   = useState(null)
  const [message, setMessage]     = useState(null)
  const [searchOrderId, setSearchOrderId] = useState('')

  const [formData, setFormData] = useState({
    orderId: '',
    rating: '5',
    comment: ''
  })

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      if (role === 'Admin') {
        const data = await getAllReviews()
        setReviews(Array.isArray(data) ? data : [])
      } else if (role === 'User') {
        // User ke apne orders fetch karo
        const orders = await getOrdersByUser(currentUser.id)
        setMyOrders(Array.isArray(orders) ? orders : [])
        // Phir sirf unhi orders ke reviews dikhao
        const orderIds = Array.isArray(orders) ? orders.map(o => o.id) : []
        const allReviews = await getAllReviews()
        const myReviews = Array.isArray(allReviews)
          ? allReviews.filter(r => orderIds.includes(r.orderId))
          : []
        setReviews(myReviews)
      } else if (role === 'Provider') {
        const data = await getAllReviews()
        setReviews(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      showMsg(err.message || 'Failed to load', 'error')
    } finally {
      setLoading(false)
    }
  }, [role, currentUser])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchOrderId) return
    setLoading(true)
    try {
      const data = await getReviewByOrder(parseInt(searchOrderId))
      setReviews(data ? [data] : [])
    } catch (err) {
      showMsg('No review found for this order', 'error')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchOrderId('')
    fetchReviews()
  }

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await deleteReview(orderId)
      showMsg('Review deleted!')
      fetchReviews()
    } catch (err) {
      showMsg('Failed to delete review', 'error')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        orderId: parseInt(formData.orderId),
        rating: parseInt(formData.rating),
        comment: formData.comment
      }
      if (editData) {
        await updateReview(editData.orderId, payload)
        showMsg('Review updated!')
      } else {
        await createReview(payload)
        showMsg('Review submitted!')
      }
      setModalOpen(false)
      setEditData(null)
      setFormData({ orderId: '', rating: '5', comment: '' })
      fetchReviews()
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 min-h-screen bg-[#0F172A]">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews</h1>
          <p className="text-slate-400 text-sm">
            {role === 'User' ? 'Your reviews on completed orders' : 'Customer feedback on completed orders'}
          </p>
        </div>
        {role === 'User' && (
          <button
            onClick={() => { setEditData(null); setFormData({ orderId: '', rating: '5', comment: '' }); setModalOpen(true) }}
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/20"
          >
            + Add Review
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="number"
          placeholder="Search by Order ID..."
          className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 w-80 placeholder-slate-500"
          value={searchOrderId}
          onChange={e => setSearchOrderId(e.target.value)}
        />
        <button type="submit" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
          Search
        </button>
        {searchOrderId && (
          <button type="button" onClick={handleClearSearch} className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-4 py-3 rounded-xl border border-slate-700">
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Rating</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Comment</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Provider</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
            ) : reviews.length > 0 ? reviews.map((r, i) => (
              <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4">
                  <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-medium">
                    Order #{r.orderId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{RATING_STARS(r.rating)}</span>
                    <span className="text-slate-400 text-sm font-medium">({r.rating}/5)</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300 max-w-sm">{r.comment}</td>
                <td className="px-6 py-4 text-purple-400 font-medium">{r.providerName || 'N/A'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {role === 'User' && (
                      <button
                        onClick={() => { setEditData(r); setFormData({ orderId: r.orderId, rating: String(r.rating), comment: r.comment }); setModalOpen(true) }}
                        className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-lg text-xs font-medium">
                        Edit
                      </button>
                    )}
                    {role === 'Admin' && (
                      <button onClick={() => handleDelete(r.orderId)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-medium">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No reviews found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && role === 'User' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">{editData ? 'Edit Review' : 'Submit Review'}</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Select Order</label>
                {editData ? (
                  <input type="number" disabled
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none opacity-50"
                    value={formData.orderId} />
                ) : (
                  <select required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                    value={formData.orderId}
                    onChange={e => setFormData({ ...formData, orderId: e.target.value })}>
                    <option value="">-- Select Completed Order --</option>
                    {myOrders.filter(o => o.status === 'Completed').map(o => (
                      <option key={o.id} value={o.id}>Order #{o.id} — Rs. {o.totalAmount}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button"
                      onClick={() => setFormData({ ...formData, rating: String(star) })}
                      className={`text-3xl transition-all ${parseInt(formData.rating) >= star ? 'text-yellow-400 scale-110' : 'text-slate-600'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Comment</label>
                <textarea required rows="4"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  value={formData.comment}
                  onChange={e => setFormData({ ...formData, comment: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
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