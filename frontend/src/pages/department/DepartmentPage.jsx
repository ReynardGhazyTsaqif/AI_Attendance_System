import { useState, useEffect } from 'react'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const inputClass =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all'

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ name: '', location_id: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const asArray = v => Array.isArray(v) ? v : []

  const fetchData = async () => {
    setLoading(true)
    const [dr, lr] = await Promise.allSettled([api.get('/departments/'), api.get('/locations/')])
    setDepartments(dr.status === 'fulfilled' ? asArray(dr.value.data) : [])
    setLocations(lr.status === 'fulfilled' ? asArray(lr.value.data) : [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleReset = () => { setShowForm(false); setEditTarget(null); setForm({ name: '', location_id: '' }); setError('') }
  const handleEdit = dept => { setEditTarget(dept); setForm({ name: dept.name, location_id: dept.location_id || '' }); setShowForm(true); setError('') }

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      const payload = { name: form.name, location_id: form.location_id ? parseInt(form.location_id) : null }
      editTarget ? await api.put(`/departments/${editTarget.id}`, payload) : await api.post('/departments/', payload)
      handleReset(); fetchData()
    } catch (err) { setError(err.response?.data?.detail || 'Gagal menyimpan') } finally { setSubmitting(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus departemen "${name}"?`)) return
    try { await api.delete(`/departments/${id}`); fetchData() } catch (err) { console.error(err) }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Departemen</h1>
          <p className="text-sm text-gray-400 mt-0.5">{departments.length} departemen terdaftar</p>
        </div>
        <Button onClick={() => { handleReset(); setShowForm(!showForm) }} size="sm">
          {showForm && !editTarget ? 'Batal' : '+ Tambah'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <p className="text-sm font-medium text-gray-800 mb-4">
            {editTarget ? `Edit — ${editTarget.name}` : 'Departemen Baru'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg">{error}</div>}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Nama Departemen</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="contoh: Teknik Informatika, HRD" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Lokasi Absensi <span className="text-gray-300">(opsional)</span></label>
              {locations.length === 0 ? (
                <div className="text-sm text-amber-700 bg-amber-50 px-3 py-2.5 rounded-lg">
                  Belum ada lokasi. Tambah dulu di menu Lokasi.
                </div>
              ) : (
                <select value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })} className={inputClass}>
                  <option value="">Tanpa lokasi (GPS tidak divalidasi)</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name} — radius {l.radius_meter}m</option>)}
                </select>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={handleReset} size="sm">Batal</Button>
              <Button type="submit" disabled={submitting} size="sm">{submitting ? 'Menyimpan...' : editTarget ? 'Update' : 'Simpan'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400">Memuat data...</div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">Belum ada departemen.</p>
          </div>
        ) : (
          <div>
            {departments.map((dept, idx) => (
              <div key={dept.id} className={`flex items-center justify-between px-5 py-3.5 ${idx < departments.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center text-xs font-medium text-violet-600">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{dept.name}</p>
                    {dept.location_name
                      ? <p className="text-xs text-green-600 mt-0.5">{dept.location_name}</p>
                      : <p className="text-xs text-gray-400 mt-0.5">Tanpa lokasi absensi</p>
                    }
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(dept)} className="text-xs px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(dept.id, dept.name)} className="text-xs px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}