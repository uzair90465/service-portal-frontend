import React, { useEffect, useState, useCallback } from 'react'
import { getAllUsers, createUser, updateUser, deleteUser } from '../api/usersApi'

function Toast({ toasts, remove }) {
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {toasts.map((t) => (
        <div key={t.id} className="toast-enter" style={{ background: t.type === 'success' ? 'rgba(16,185,129,0.12)' : t.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(56,189,248,0.12)', border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,0.3)' : t.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(56,189,248,0.3)'}`, borderRadius: '10px', padding: '12px 16px', minWidth: '280px', display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <span style={{ fontSize: '16px' }}>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span style={{ fontSize: '14px', color: '#E2E8F0', flex: 1 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      ))}
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((p) => [...p, { id, message, type }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500)
  }, [])
  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), [])
  return { toasts, add, remove }
}

function ConfirmDialog({ open, name, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="modal-box" style={{ background: '#0F172A', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '28px', width: '380px', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="rgba(239,68,68,0.9)" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h3 style={{ color: '#F1F5F9', fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>Delete User</h3>
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>Are you sure you want to delete <strong style={{ color: '#E2E8F0' }}>{name}</strong>? This action cannot be undone.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', cursor: 'pointer', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(239,68,68,0.3)' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', role: '', status: 'Active' }

function UserModal({ open, mode, initialData, onClose, onSave, loading }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(mode === 'edit' && initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM)
      setErrors({})
    }
  }, [open, mode, initialData])

  const validate = () => {
    const e = {}
    if (!form.name?.trim()) e.name = 'Name is required'
    if (!form.email?.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format'
    if (mode === 'create' && !form.password?.trim()) e.password = 'Password is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave(form)
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div key={key}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type} value={form[key] || ''} placeholder={placeholder}
        onChange={(e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setErrors((p) => ({ ...p, [key]: '' })) }}
        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${errors[key] ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(56,189,248,0.4)')}
        onBlur={(e) => (e.target.style.borderColor = errors[key] ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)')}
      />
      {errors[key] && <p style={{ color: '#FCA5A5', fontSize: '12px', marginTop: '4px' }}>{errors[key]}</p>}
    </div>
  )

  if (!open) return null

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" style={{ background: '#0F172A', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '16px', padding: '28px', width: '480px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#38BDF8" strokeWidth={2}>
                {mode === 'edit' ? <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-6 3a6 6 0 110-12 6 6 0 010 12zm0 2a9 9 0 00-9 9h18a9 9 0 00-9-9z" />}
              </svg>
            </div>
            <div>
              <h2 style={{ color: '#F1F5F9', fontSize: '16px', fontWeight: 700 }}>{mode === 'edit' ? 'Edit User' : 'Add New User'}</h2>
              <p style={{ color: '#475569', fontSize: '12px' }}>{mode === 'edit' ? 'Update user information' : 'Fill in the details below'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '20px' }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {field('name', 'Full Name', 'text', 'e.g. John Doe')}
          {field('email', 'Email Address', 'email', 'e.g. john@example.com')}
          {mode === 'create' && field('password', 'Password', 'password', 'Enter password')}
          {field('phone', 'Phone Number', 'text', 'e.g. +92 300 0000000')}
          {field('role', 'Role / Designation', 'text', 'e.g. Manager')}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Status</label>
            <select value={form.status || 'Active'} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} style={{ width: '100%', padding: '10px 12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F1F5F9', fontSize: '14px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', cursor: 'pointer', fontSize: '14px', fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: '8px', border: 'none', background: loading ? 'rgba(56,189,248,0.3)' : 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {loading ? 'Saving…' : mode === 'edit' ? 'Update User' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = { Active: { bg: 'rgba(16,185,129,0.1)', color: '#6EE7B7', border: 'rgba(16,185,129,0.2)', dot: '#10B981' }, Inactive: { bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: 'rgba(100,116,139,0.2)', dot: '#64748B' }, Pending: { bg: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: 'rgba(245,158,11,0.2)', dot: '#F59E0B' } }[status] || { bg: 'rgba(56,189,248,0.1)', color: '#7DD3FC', border: 'rgba(56,189,248,0.2)', dot: '#38BDF8' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '20px', background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: '12px', fontWeight: 500, color: cfg.color }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot }} />{status}
    </span>
  )
}

function Avatar({ name }) {
  const initials = (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['#38BDF8', '#818CF8', '#34D399', '#F472B6', '#FB923C']
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color, flexShrink: 0 }}>{initials}</div>
  )
}

export default function UsersPage() {
  const { toasts, add: addToast, remove: removeToast } = useToast()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [modal, setModal]     = useState({ open: false, mode: 'create', data: null })
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      addToast(err.message || 'Failed to load users', 'error')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleCreate = () => setModal({ open: true, mode: 'create', data: null })
  const handleEdit   = (user) => setModal({ open: true, mode: 'edit', data: user })
  const handleDeleteClick = (user) => setConfirm({ open: true, id: user.id, name: user.name })

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(confirm.id)
      setUsers((p) => p.filter((u) => u.id !== confirm.id))
      addToast('User deleted successfully', 'success')
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error')
    } finally {
      setConfirm({ open: false, id: null, name: '' })
    }
  }

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        const newUser = await createUser({ name: formData.name, email: formData.email, password: formData.password })
        setUsers((p) => [newUser, ...p])
        addToast('User created successfully', 'success')
      } else {
        const updated = await updateUser(modal.data.id, formData)
        setUsers((p) => p.map((u) => (u.id === modal.data.id ? updated : u)))
        addToast('User updated successfully', 'success')
      }
      setModal({ open: false, mode: 'create', data: null })
    } catch (err) {
      addToast(err.message || 'Failed to save user', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ← filtered BEFORE return
  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q)
  })

  const card = { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(56,189,248,0.08)', borderRadius: '14px' }

  return (
    <>
      <Toast toasts={toasts} remove={removeToast} />
      <ConfirmDialog open={confirm.open} name={confirm.name} onConfirm={handleDeleteConfirm} onCancel={() => setConfirm({ open: false, id: null, name: '' })} />
      <UserModal open={modal.open} mode={modal.mode} initialData={modal.data} onClose={() => setModal((p) => ({ ...p, open: false }))} onSave={handleSave} loading={saving} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.4px' }}>Users</h2>
          <p style={{ color: '#475569', fontSize: '13px', marginTop: '3px' }}>{loading ? 'Loading…' : `${filtered.length} of ${users.length} user${users.length !== 1 ? 's' : ''}`}</p>
        </div>
        <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(56,189,248,0.25)' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add User
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Users', value: users.length, color: '#38BDF8' },
          { label: 'Active',      value: users.filter((u) => u.isActive === true).length,  color: '#10B981' },
          { label: 'Inactive',    value: users.filter((u) => u.isActive === false).length, color: '#F59E0B' },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{loading ? '…' : s.value}</span>
            </div>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(56,189,248,0.06)', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or role…" style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#E2E8F0', fontSize: '14px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
          </div>
          <button onClick={fetchUsers} style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8 8 0 0120 15m-15.419-6A8 8 0 004 15m16-6h-.581" /></svg>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(56,189,248,0.06)' }}>
                {['User', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <svg style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#38BDF8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8 8 0 0120 15m-15.419-6A8 8 0 004 15" /></svg>
                  {' '}Loading users…
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                  <p style={{ color: '#475569', fontSize: '15px', fontWeight: 500 }}>{search ? 'No users match your search' : 'No users yet'}</p>
                </td></tr>
              ) : (
                filtered.map((user, idx) => (
                  <tr key={user.id ?? idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.1s' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56,189,248,0.03)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar name={user.name} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0' }}>{user.name || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>#{String(user.id ?? 0).padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}><span style={{ fontSize: '13px', color: '#94A3B8' }}>{user.email || '—'}</span></td>
                    <td style={{ padding: '14px 20px' }}><span style={{ fontSize: '13px', color: '#64748B' }}>{user.phone || '—'}</span></td>
                    <td style={{ padding: '14px 20px' }}><span style={{ fontSize: '13px', color: '#94A3B8', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>{user.role || '—'}</span></td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={user.isActive ? 'Active' : 'Inactive'} /></td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleEdit(user)} style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', color: '#38BDF8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" /></svg>Edit
                        </button>
                        <button onClick={() => handleDeleteClick(user)} style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(56,189,248,0.06)', fontSize: '12px', color: '#334155' }}>
            Showing {filtered.length}{filtered.length !== users.length ? ` of ${users.length}` : ''} user{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </>
  )
}