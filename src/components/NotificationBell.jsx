import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosInstance from '../api/axiosInstance'

export default function NotificationBell() {
  const { currentUser } = useAuth()
  const role = currentUser?.role
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      let items = []

      if (role === 'Provider') {
        // Requests
        const res = await axiosInstance.get(`/ServiceRequest/provider/${currentUser.id}`)
        const requests = Array.isArray(res.data) ? res.data : []
        requests.forEach(r => {
          items.push({
            id: `req-${r.id}`,
            message: `New request: ${r.serviceTitle} at ${r.locationName}`,
            type: 'request',
            time: new Date().toLocaleTimeString()
          })
        })

        // Messages
        const msgRes = await axiosInstance.get(`/Messages/user/${currentUser.id}`)
        const msgs = Array.isArray(msgRes.data) ? msgRes.data : []
        msgs.filter(m => m.receiverId === currentUser.id).forEach(m => {
          items.push({
            id: `msg-${m.id}`,
            message: `New message: ${m.messageText?.substring(0, 40)}`,
            type: 'message',
            time: new Date(m.sentAt).toLocaleTimeString()
          })
        })
      }

      if (role === 'User') {
        // Offers
        const res = await axiosInstance.get(`/ServiceRequest/user/${currentUser.id}`)
        const requests = Array.isArray(res.data) ? res.data : []

        for (const r of requests) {
          try {
            const offRes = await axiosInstance.get(`/RequestOffer/request/${r.id}`)
            const offers = Array.isArray(offRes.data) ? offRes.data : []
            offers.filter(o => o.status === 'Pending').forEach(o => {
              items.push({
                id: `offer-${o.id}`,
                message: `New offer: Rs. ${o.offeredPrice} for ${r.serviceTitle}`,
                type: 'offer',
                time: new Date().toLocaleTimeString()
              })
            })
          } catch {}
        }

        // Orders
        try {
          const ordRes = await axiosInstance.get(`/Orders/user/${currentUser.id}`)
          const orders = Array.isArray(ordRes.data) ? ordRes.data : []
          orders.filter(o => o.status === 'Completed').forEach(o => {
            items.push({
              id: `order-${o.id}`,
              message: `✅ Order #${o.id} has been completed!`,
              type: 'order',
              time: new Date().toLocaleTimeString()
            })
          })
          orders.filter(o => o.status === 'InProgress').forEach(o => {
            items.push({
              id: `inprogress-${o.id}`,
              message: `🔄 Order #${o.id} is now in progress!`,
              type: 'order',
              time: new Date().toLocaleTimeString()
            })
          })
        } catch {}

        // Messages
        try {
          const msgRes = await axiosInstance.get(`/Messages/user/${currentUser.id}`)
          const msgs = Array.isArray(msgRes.data) ? msgRes.data : []
          msgs.filter(m => m.receiverId === currentUser.id).forEach(m => {
            items.push({
              id: `msg-${m.id}`,
              message: `💬 New message: ${m.messageText?.substring(0, 40)}`,
              type: 'message',
              time: new Date(m.sentAt).toLocaleTimeString()
            })
          })
        } catch {}
      }

      // Unread count
      const stored = JSON.parse(sessionStorage.getItem('seenNotifs') || '[]')
      const newItems = items.filter(i => !stored.includes(i.id))
      setUnread(newItems.length)
      setNotifications(items)

    } catch (err) {
      console.error('Notification error:', err)
    }
  }, [currentUser, role])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 8000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAllRead = () => {
    const ids = notifications.map(n => n.id)
    sessionStorage.setItem('seenNotifs', JSON.stringify(ids))
    setUnread(0)
  }

  const TYPE_COLORS = {
    request: '#38BDF8',
    offer:   '#A855F7',
    order:   '#34D399',
    message: '#FB923C',
  }

  const TYPE_ICONS = {
    request: '📋',
    offer:   '💰',
    order:   '✅',
    message: '💬',
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        style={{
          position: 'relative',
          background: unread > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(56,189,248,0.08)',
          border: `1px solid ${unread > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.15)'}`,
          borderRadius: '10px', padding: '8px', cursor: 'pointer',
          color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-6px', right: '-6px',
            background: '#EF4444', color: 'white', borderRadius: '50%',
            width: '20px', height: '20px', fontSize: '11px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'bellPulse 1s infinite', boxShadow: '0 0 8px rgba(239,68,68,0.6)'
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '48px', width: '340px',
          background: '#1E293B', border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          zIndex: 1000, overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid rgba(56,189,248,0.08)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(15,23,42,0.5)'
          }}>
            <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: '14px' }}>
              🔔 Notifications
            </span>
            <span style={{
              background: 'rgba(56,189,248,0.1)', color: '#38BDF8',
              padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600
            }}>
              {notifications.length} total
            </span>
          </div>

          {/* List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length > 0 ? notifications.map((n, i) => (
              <div key={i} style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(56,189,248,0.05)',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>
                  {TYPE_ICONS[n.type] || '🔔'}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#CBD5E1', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: TYPE_COLORS[n.type] || '#38BDF8', flexShrink: 0
                    }} />
                    <p style={{ color: '#475569', fontSize: '11px', margin: 0 }}>{n.time}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid rgba(56,189,248,0.08)',
            background: 'rgba(15,23,42,0.5)', textAlign: 'center'
          }}>
            <p style={{ color: '#475569', fontSize: '11px', margin: 0 }}>
              Auto refreshes every 8 seconds
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bellPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 8px rgba(239,68,68,0.6); }
          50% { transform: scale(1.15); box-shadow: 0 0 16px rgba(239,68,68,0.8); }
        }
      `}</style>
    </div>
  )
}