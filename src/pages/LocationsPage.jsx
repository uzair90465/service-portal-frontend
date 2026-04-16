import React, { useEffect, useState, useCallback } from 'react'
import { getAllLocations, createLocation, updateLocation, deleteLocation } from '../api/locationsApi'

export default function LocationsPage() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData]   = useState(null)
  const [message, setMessage]     = useState(null)
  const [formData, setFormData]   = useState({ name: '', parentId: '' })

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllLocations()
      setLocations(Array.isArray(data) ? data : [])
    } catch (err) {
      showMsg('Failed to load', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLocations() }, [fetchLocations])

  const openCreate = () => {
    setEditData(null)
    setFormData({ name: '', parentId: '' })
    setModalOpen(true)
  }

  const openEdit = (loc) => {
    setEditData(loc)
    setFormData({ name: loc.name, parentId: loc.parentId || '' })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        parentId: formData.parentId === '' ? null : parseInt(formData.parentId)
      }
      if (editData) {
        await updateLocation(editData.id, payload)
        showMsg('Location updated!')
      } else {
        await createLocation(payload)
        showMsg('Location created!')
      }
      setModalOpen(false)
      fetchLocations()
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return
    try {
      await deleteLocation(id)
      showMsg('Location deleted!')
      fetchLocations()
    } catch (err) {
      showMsg('Cannot delete — child records exist', 'error')
    }
  }

  return (
    <div className="p-6 min-h-screen bg-[#0F172A]">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Location Management</h1>
          <p className="text-slate-400 text-sm">Manage cities, regions and areas</p>
        </div>
        <button onClick={openCreate}
          className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/20">
          + Add Location
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
            ) : locations.length > 0 ? locations.map((loc) => (
              <tr key={loc.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 text-slate-500 font-mono text-sm">#{loc.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-100">{loc.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    loc.parentId
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {loc.parentId ? `Sub-Location (Parent: #${loc.parentId})` : 'Root Location'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(loc)}
                      className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(loc.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No locations found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editData ? 'Edit Location' : 'Add New Location'}
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Location Name</label>
                <input required placeholder="e.g. Lahore, DHA Phase 5"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Parent Location (Optional)</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}>
                  <option value="">None (Root)</option>
                  {locations
                    .filter(l => l.id !== editData?.id)
                    .map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
                  {saving ? 'Saving...' : editData ? 'Update' : 'Create'}
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