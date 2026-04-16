import React, { useEffect, useState, useCallback } from 'react'
import { getAllServices, createService, updateService, deleteService } from '../api/servicesApi'
import { getAllCategories } from '../api/categoriesApi'

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [message, setMessage] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: ''
  })

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // Pehle categories load karte hain dropdown ke liye
  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    try {
      const [sData, cData] = await Promise.all([getAllServices(), getAllCategories()])
      setServices(Array.isArray(sData) ? sData : [])
      setCategories(Array.isArray(cData) ? cData : [])
    } catch (err) {
      showMsg('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInitialData() }, [fetchInitialData])

  const openCreate = () => {
    setEditData(null)
    setFormData({ title: '', description: '', categoryId: '' })
    setModalOpen(true)
  }

  const openEdit = (service) => {
    setEditData(service)
    setFormData({
      title: service.title,
      description: service.description,
      categoryId: String(service.categoryId) || '' // String conversion for select matching
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId)
      }

      if (editData) {
        // --- UPDATE LOGIC ---
        await updateService(editData.id, payload)
        showMsg('Service updated successfully!')
      } else {
        // --- CREATE LOGIC ---
        await createService(payload)
        showMsg('Service created successfully!')
      }

      setModalOpen(false)
      // Refresh list
      const updatedServices = await getAllServices()
      setServices(Array.isArray(updatedServices) ? updatedServices : [])
    } catch (err) {
      showMsg(err.message || 'Error saving service', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return
    try {
      await deleteService(id)
      showMsg('Service deleted!')
      // Instant UI update
      setServices(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      showMsg('Cannot delete — service is linked to requests or providers', 'error')
    }
  }

  return (
    <div className="p-6 min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Service Management</h1>
          <p className="text-slate-400 text-sm">Create and edit service offerings</p>
        </div>
        <button onClick={openCreate}
          className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/20">
          + Add Service
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase">ID</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase">Title</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase">Category</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase">Description</th>
              <th className="px-6 py-4 text-slate-400 font-medium text-sm uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading Services...</td></tr>
            ) : services.length > 0 ? services.map((s) => (
              <tr key={s.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 text-slate-500 font-mono text-sm">#{s.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-100">{s.title}</td>
                <td className="px-6 py-4">
                  <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-medium">
                    {s.categoryName || `ID: ${s.categoryId}`}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 truncate max-w-xs">{s.description}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)}
                      className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-500">No services found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editData ? 'Update Service Details' : 'Create New Service'}
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Service Title</label>
                <input required placeholder="e.g. Electrician"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                <select required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                  <option value="">-- Choose Category --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea required rows="3" placeholder="Explain what this service covers..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg">
                  {saving ? 'Processing...' : editData ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {message && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl text-white font-semibold shadow-2xl z-50 animate-bounce ${
          message.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}