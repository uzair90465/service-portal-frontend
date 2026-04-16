import React, { useEffect, useState, useCallback } from 'react'
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../api/categoriesApi'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editData, setEditData]     = useState(null) // null = create, object = edit
  const [message, setMessage]       = useState(null)
  const [formData, setFormData]     = useState({ name: '', parentId: '' })

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      showMsg('Failed to load', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  // Open modal for Create
  const openCreate = () => {
    setEditData(null)
    setFormData({ name: '', parentId: '' })
    setModalOpen(true)
  }

  // Open modal for Edit
  const openEdit = (cat) => {
    setEditData(cat)
    setFormData({ name: cat.name, parentId: cat.parentId || '' })
    setModalOpen(true)
  }

  // Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        parentId: formData.parentId === '' ? null : parseInt(formData.parentId)
      }
      if (editData) {
        await updateCategory(editData.id, payload)
        showMsg('Category updated!')
      } else {
        await createCategory(payload)
        showMsg('Category created!')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      showMsg(err.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await deleteCategory(id)
      showMsg('Category deleted!')
      fetchCategories()
    } catch (err) {
      showMsg('Cannot delete — child records exist', 'error')
    }
  }

  return (
    <div className="p-6 min-h-screen bg-[#0F172A]">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Category Management</h1>
          <p className="text-slate-400 text-sm">Organize your services into groups</p>
        </div>
        <button onClick={openCreate}
          className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-sky-500/20">
          + Add Category
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
            ) : categories.length > 0 ? categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 text-slate-500 font-mono text-sm">#{cat.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-100">{cat.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cat.parentId
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {cat.parentId ? `Sub-Category (Parent: #${cat.parentId})` : 'Top Level'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)}
                      className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-medium transition-all">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">No categories found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal — Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editData ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Category Name</label>
                <input required placeholder="e.g. Electrician Services"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Parent Category (Optional)</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.parentId}
                  onChange={e => setFormData({ ...formData, parentId: e.target.value })}>
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter(c => c.id !== editData?.id) // apna aap parent nahi bane
                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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