import React, { useEffect, useState, useCallback } from 'react'
import { getAllOrders, getOrdersByUser, updateOrderStatus, completeOrder, deleteOrder } from '../api/ordersApi'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  InProgress: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  Completed:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Cancelled:  'bg-red-500/10 text-red-400 border border-red-500/20',
  Pending:    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
}

const PAYMENT_COLORS = {
  Paid:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  Failed:  'bg-red-500/10 text-red-400 border border-red-500/20',
}

export default function OrdersPage() {
  const { currentUser } = useAuth()
  const role = currentUser?.role

  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [message, setMessage] = useState(null)

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      let data = []
      if (role === 'Admin') {
        data = await getAllOrders()
      } else if (role === 'User') {
        data = await getOrdersByUser(currentUser.id)
      } else if (role === 'Provider') {
        data = await getAllOrders()
      }
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      showMsg(err.message || 'Failed to load', 'error')
    } finally {
      setLoading(false)
    }
  }, [role, currentUser])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleComplete = async (id) => {
    setSaving(true)
    try {
      await completeOrder(id)
      showMsg('Order completed!')
      fetchOrders()
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    setSaving(true)
    try {
      await updateOrderStatus(id, status)
      showMsg(`Status updated to ${status}`)
      fetchOrders()
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return
    try {
      await deleteOrder(id)
      showMsg('Order deleted!')
      fetchOrders()
    } catch (err) {
      showMsg('Cannot delete — related records exist', 'error')
    }
  }

  return (
    <div className="p-6 min-h-screen bg-[#0F172A]">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {role === 'Admin' ? 'All Orders' : 'My Orders'}
          </h1>
          <p className="text-slate-400 text-sm">
            {role === 'Admin' ? 'Track and manage all orders' : 'Track your orders'}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Request ID</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Total Amount</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Commission</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Provider Earning</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Payment</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr><td colSpan="8" className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
            ) : orders.length > 0 ? orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 text-slate-500 font-mono text-sm">#{o.id}</td>
                <td className="px-6 py-4">
                  <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-medium">
                    Req #{o.serviceRequestId}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-100 font-semibold">
                  Rs. {o.totalAmount?.toLocaleString() || '0'}
                </td>
                <td className="px-6 py-4 text-slate-300">
                  <div className="text-xs">
                    <span className="text-slate-400">{o.commissionPercentage}%</span>
                    <span className="ml-2 text-red-400">− Rs. {o.commissionAmount?.toLocaleString() || '0'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-emerald-400 font-semibold">
                    Rs. {o.providerEarning?.toLocaleString() || '0'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[o.paymentStatus] || PAYMENT_COLORS.Pending}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || STATUS_COLORS.Pending}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {o.status !== 'Completed' && o.status !== 'Cancelled' && (
                      <button onClick={() => handleComplete(o.id)} disabled={saving}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50">
                        Complete
                      </button>
                    )}
                    {o.status === 'InProgress' && (
                      <button onClick={() => handleStatusUpdate(o.id, 'Cancelled')} disabled={saving}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50">
                        Cancel
                      </button>
                    )}
                    {role === 'Admin' && (
                      <button onClick={() => handleDelete(o.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="px-6 py-10 text-center text-slate-500">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

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