import React, { useEffect, useState, useRef, useCallback } from 'react'
import { sendMessage, getChatByRequest } from '../api/messagesApi'
import { getRequestsByUser, getRequestsForProvider } from '../api/serviceRequestApi'
import { getOffersByRequest } from '../api/requestOfferApi'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const { currentUser } = useAuth()
  const role = currentUser?.role
  const senderId = currentUser?.id

  const [requestId, setRequestId]   = useState(parseInt(searchParams.get('requestId')) || '')
  const [receiverId, setReceiverId] = useState(parseInt(searchParams.get('receiverId')) || '')
  const [requests, setRequests]     = useState([])
  const [messages, setMessages]     = useState([])
  const [loading, setLoading]       = useState(false)
  const [sending, setSending]       = useState(false)
  const [text, setText]             = useState('')
  const [message, setMessage]       = useState(null)
  const [started, setStarted]       = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const bottomRef = useRef(null)

  const showMsg = (txt, type = 'success') => {
    setMessage({ txt, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // Load user's requests for dropdown
  useEffect(() => {
    const loadRequests = async () => {
      try {
        let data = []
        if (role === 'User') {
          data = await getRequestsByUser(senderId)
        } else if (role === 'Provider') {
          data = await getRequestsForProvider(senderId)
        }
        setRequests(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load requests')
      }
    }
    if (senderId) loadRequests()
  }, [senderId, role])

  // Auto start if params in URL
  useEffect(() => {
    const rid = parseInt(searchParams.get('requestId'))
    const rcv = parseInt(searchParams.get('receiverId'))
    if (rid && rcv) {
      setRequestId(rid)
      setReceiverId(rcv)
      setStarted(true)
    }
  }, [])

  const fetchMessages = useCallback(async () => {
    if (!requestId) return
    setLoading(true)
    try {
      const data = await getChatByRequest(requestId)
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      showMsg('Failed to load messages', 'error')
    } finally {
      setLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    if (started) fetchMessages()
  }, [fetchMessages, started])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // When request selected — auto find receiver
  const handleRequestSelect = async (reqId) => {
    setRequestId(reqId)
    const req = requests.find(r => r.id === parseInt(reqId))
    setSelectedRequest(req)

    if (role === 'User') {
      // Find accepted offer to get provider ID
      try {
        const offers = await getOffersByRequest(reqId)
        const accepted = Array.isArray(offers) ? offers.find(o => o.status === 'Accepted') : null
        if (accepted) {
          setReceiverId(accepted.providerId)
        } else {
          setReceiverId('')
        }
      } catch (err) {
        setReceiverId('')
      }
    } else if (role === 'Provider') {
      // Get userId from request
      if (req?.userId) {
        setReceiverId(req.userId)
      }
    }
  }

  const handleStart = (e) => {
    e.preventDefault()
    if (!requestId) {
      showMsg('Please select a request', 'error')
      return
    }
    setStarted(true)
    fetchMessages()
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !receiverId) return
    setSending(true)
    try {
      await sendMessage({
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        serviceRequestId: parseInt(requestId),
        messageText: text.trim()
      })
      setText('')
      fetchMessages()
    } catch (err) {
      showMsg(err.message || 'Failed to send', 'error')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('en-PK', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="p-6 min-h-screen bg-[#0F172A]">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Chat</h1>
        <p className="text-slate-400 text-sm">
          Logged in as: <span className="text-sky-400 font-semibold">{currentUser?.name}</span>
        </p>
      </div>

      {/* Request Selection — show if not started */}
      {!started && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 max-w-lg mb-6">
          <h2 className="text-lg font-bold text-white mb-2">Start a Conversation</h2>
          <p className="text-slate-400 text-sm mb-6">Select a service request to start chatting</p>
          <form onSubmit={handleStart} className="space-y-5">

            {/* Request Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                {role === 'User' ? 'My Requests' : 'Available Requests'}
              </label>
              <select required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                value={requestId}
                onChange={e => handleRequestSelect(e.target.value)}>
                <option value="">-- Select a Request --</option>
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    #{r.id} — {r.serviceTitle || 'Service'} — {r.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Receiver info — auto filled */}
            {requestId && (
              <div style={{
                background: receiverId ? 'rgba(52,211,153,0.08)' : 'rgba(250,204,21,0.08)',
                border: `1px solid ${receiverId ? 'rgba(52,211,153,0.2)' : 'rgba(250,204,21,0.2)'}`,
                borderRadius: '12px', padding: '12px 16px'
              }}>
                {receiverId ? (
                  <p style={{ color: '#34D399', fontSize: '13px' }}>
                    ✅ {role === 'User' ? 'Provider' : 'Customer'} found — ready to chat!
                  </p>
                ) : (
                  <p style={{ color: '#FACC15', fontSize: '13px' }}>
                    ⚠️ {role === 'User' ? 'No accepted offer yet on this request' : 'Loading customer info...'}
                  </p>
                )}
              </div>
            )}

            <button type="submit" disabled={!requestId || !receiverId}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-sky-500/20">
              Open Chat
            </button>
          </form>
        </div>
      )}

      {/* Chat Box */}
      {started && (
        <>
          {/* Info Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-medium">
                {selectedRequest?.serviceTitle || `Request #${requestId}`}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium">
                {selectedRequest?.locationName || 'Chat Active'}
              </span>
            </div>
            <button
              onClick={() => { setStarted(false); setMessages([]) }}
              className="text-slate-400 hover:text-white text-xs transition-colors border border-slate-700 px-3 py-1 rounded-lg">
              ← Back
            </button>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col"
            style={{ height: 'calc(100vh - 320px)' }}>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="text-center text-slate-500 py-10">Loading messages...</div>
              ) : messages.length > 0 ? messages.map((msg, i) => {
                const isMe = msg.senderId === senderId
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-slate-500 px-1">
                        {isMe ? 'You' : (msg.senderName || `${role === 'User' ? 'Provider' : 'Customer'}`)}
                      </span>
                      <div className={`px-4 py-3 rounded-2xl text-sm font-medium ${
                        isMe
                          ? 'bg-sky-500 text-white rounded-tr-sm'
                          : 'bg-slate-700 text-slate-100 rounded-tl-sm'
                      }`}>
                        {msg.messageText}
                      </div>
                      <span className="text-xs text-slate-600 px-1">{formatTime(msg.sentAt)}</span>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-center text-slate-500 py-10">
                  No messages yet — start the conversation!
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-700/50 p-4">
              <form onSubmit={handleSend} className="flex gap-3">
                <input type="text" placeholder="Type a message..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-500"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  disabled={sending} />
                <button type="submit" disabled={sending || !text.trim()}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-sky-500/20 flex items-center gap-2">
                  {sending ? 'Sending...' : (
                    <>
                      <span>Send</span>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {message && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl text-white font-semibold shadow-xl z-50 ${
          message.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          {message.txt}
        </div>
      )}
    </div>
  )
}