import { useState, useEffect } from 'react'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormModal from '../../components/ui/FormModal'
import ConfirmModal from '../../components/ui/ConfirmModal'

const inputClass =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all'

export default function LocationPage() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', radius_meter: 100 })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchLocations = async () => {
    try { const res = await api.get('/locations/'); setLocations(res.data) }
    catch (err) { console.error(err) } finally { setLoading(false) }
  }
  useEffect(() => { fetchLocations() }, [])

  const openAdd = () => { setEditTarget(null); setForm({ name: '', latitude: '', longitude: '', radius_meter: 100 }); setError(''); setShowForm(true) }
  const openEdit = loc => { setEditTarget(loc); setForm({ name: loc.name, latitude: loc.latitude, longitude: loc.longitude, radius_meter: loc.radius_meter }); setError(''); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditTarget(null); setForm({ name: '', latitude: '', longitude: '', radius_meter: 100 }); setError('') }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) { setError('Browser tidak mendukung GPS'); return }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setForm(prev => ({ ...prev, latitude: pos.coords.latitude.toFixed(7), longitude: pos.coords.longitude.toFixed(7) })); setGettingLocation(false) },
      () => { setError('Gagal mendapatkan lokasi GPS.'); setGettingLocation(false) }
    )
  }

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      const payload = { name: form.name, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), radius_meter: parseInt(form.radius_meter) }
      editTarget ? await api.put(`/locations/${editTarget.id}`, payload) : await api.post('/locations/', payload)
      closeForm(); fetchLocations()
    } catch (err) { setError(err.response?.data?.detail || 'Gagal menyimpan lokasi') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/locations/${deleteTarget.id}`); setDeleteTarget(null); fetchLocations() }
    catch (err) { console.error(err) }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Lokasi Absensi</h1>
          <p className="text-sm text-gray-400 mt-0.5">{locations.length} lokasi terdaftar</p>
        </div>
        <Button onClick={openAdd} size="sm">+ Tambah</Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400">Memuat data...</div>
        ) : locations.length === 0 ? (
          <Card><p className="text-sm text-gray-400 text-center py-8">Belum ada lokasi absensi.</p></Card>
        ) : (
          locations.map(loc => (
            <Card key={loc.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{loc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Dibuat {new Date(loc.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full font-medium flex-shrink-0">
                  {loc.radius_meter}m
                </span>
              </div>
              <div className="font-mono text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
                <span>{loc.latitude}, {loc.longitude}</span>
                <button
                  onClick={() => window.open(`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`, '_blank')}
                  className="text-violet-500 hover:text-violet-700 font-sans text-xs ml-2 transition-colors flex-shrink-0"
                >
                  Maps
                </button>
              </div>
              <div className="mb-4">
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div className="bg-violet-400 h-1 rounded-full" style={{ width: `${Math.min((loc.radius_meter / 500) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(loc)} className="flex-1 text-xs py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">Edit</button>
                <button onClick={() => setDeleteTarget(loc)} className="flex-1 text-xs py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">Hapus</button>
              </div>
            </Card>
          ))
        )}
      </div>

      <FormModal
        open={showForm}
        title={editTarget ? `Edit — ${editTarget.name}` : 'Tambah Lokasi'}
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lokasi</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              placeholder="contoh: Kampus Utama, Kantor Pusat"
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Koordinat GPS</label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
                className="text-xs text-violet-600 hover:text-violet-700 disabled:opacity-50 transition-colors"
              >
                {gettingLocation ? 'Mendeteksi...' : 'Pakai lokasi saat ini'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} required placeholder="Latitude" className={inputClass} />
              <input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} required placeholder="Longitude" className={inputClass} />
            </div>
            {form.latitude && form.longitude && (
              <button
                type="button"
                onClick={() => window.open(`https://www.google.com/maps?q=${form.latitude},${form.longitude}`, '_blank')}
                className="text-xs text-violet-500 hover:text-violet-700 mt-2 transition-colors"
              >
                Cek di Google Maps →
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Radius Absensi</label>
              <span className="text-sm font-semibold text-violet-600">{form.radius_meter} m</span>
            </div>
            <input
              type="range" min="50" max="500" step="10"
              value={form.radius_meter}
              onChange={e => setForm({ ...form, radius_meter: e.target.value })}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>50m (ketat)</span><span>500m (longgar)</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={closeForm} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-sm font-medium text-white transition-colors">
              {submitting ? 'Menyimpan...' : editTarget ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus lokasi?"
        message={deleteTarget ? `Lokasi "${deleteTarget.name}" akan dihapus dari sistem.` : ''}
        confirmText="Hapus Lokasi"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}