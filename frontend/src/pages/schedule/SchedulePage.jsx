import { useState, useEffect } from 'react'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormModal from '../../components/ui/FormModal'
import ConfirmModal from '../../components/ui/ConfirmModal'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all'
const asArray = v => Array.isArray(v) ? v : []

const addTime = (time, mins) => {
  if (!time || !mins) return '...'
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + Number(mins)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
const subTime = (time, mins) => {
  if (!time || !mins) return '...'
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m - Number(mins)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ department_id: '', name: '', work_start: '08:00', work_end: '17:00', late_tolerance: 15, early_leave_tolerance: 15 })
  const [dataReady, setDataReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchData = async () => {
    setLoading(true); setDataReady(false)
    const [sr, dr] = await Promise.allSettled([api.get('/schedules/'), api.get('/departments/')])
    setSchedules(sr.status === 'fulfilled' ? asArray(sr.value.data) : [])
    setDepartments(dr.status === 'fulfilled' ? asArray(dr.value.data) : [])
    setLoading(false); setDataReady(true)
  }
  useEffect(() => { fetchData() }, [])

  const scheduledDeptIds = dataReady ? schedules.map(s => Number(s.department_id)) : []
  const availableDepts = dataReady ? departments.filter(d => !scheduledDeptIds.includes(Number(d.id))) : []

  const openAdd = (deptId = '') => {
    setEditTarget(null)
    setForm({ department_id: deptId, name: '', work_start: '08:00', work_end: '17:00', late_tolerance: 15, early_leave_tolerance: 15 })
    setError(''); setShowForm(true)
  }
  const openEdit = s => {
    setEditTarget(s)
    setForm({ department_id: s.department_id, name: s.name, work_start: s.work_start.slice(0, 5), work_end: s.work_end.slice(0, 5), late_tolerance: s.late_tolerance, early_leave_tolerance: s.early_leave_tolerance })
    setError(''); setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditTarget(null); setError('') }

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      editTarget
        ? await api.put(`/schedules/${editTarget.id}`, { name: form.name, work_start: form.work_start, work_end: form.work_end, late_tolerance: Number(form.late_tolerance), early_leave_tolerance: Number(form.early_leave_tolerance) })
        : await api.post('/schedules/', { ...form, department_id: Number(form.department_id), late_tolerance: Number(form.late_tolerance), early_leave_tolerance: Number(form.early_leave_tolerance) })
      closeForm(); fetchData()
    } catch (err) { setError(err.response?.data?.detail || 'Gagal menyimpan jadwal') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.delete(`/schedules/${deleteTarget.id}`); setDeleteTarget(null); fetchData() }
    catch (err) { console.error(err) }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Jadwal Kerja</h1>
          <p className="text-sm text-gray-400 mt-0.5">Atur jam masuk dan pulang per departemen</p>
        </div>
        <Button onClick={() => openAdd()} size="sm">+ Tambah Jadwal</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">Memuat jadwal...</div>
      ) : schedules.length === 0 ? (
        <Card><p className="text-sm text-gray-400 text-center py-8">Belum ada jadwal kerja.</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {schedules.map(s => (
            <Card key={s.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.department_name}</p>
                  <p className="text-xs text-violet-600 mt-0.5">{s.name}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 ${s.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  {s.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-6 bg-gray-50 rounded-xl py-4 mb-3">
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-1">Masuk</p>
                  <p className="text-xl font-semibold text-gray-900">{s.work_start?.slice(0, 5)}</p>
                </div>
                <span className="text-gray-200 text-lg">→</span>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 mb-1">Pulang</p>
                  <p className="text-xl font-semibold text-gray-900">{s.work_end?.slice(0, 5)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center bg-amber-50 rounded-lg py-2">
                  <p className="text-[11px] text-gray-400">Toleransi terlambat</p>
                  <p className="text-sm font-medium text-amber-700 mt-0.5">{s.late_tolerance} mnt</p>
                </div>
                <div className="text-center bg-orange-50 rounded-lg py-2">
                  <p className="text-[11px] text-gray-400">Toleransi pulang</p>
                  <p className="text-sm font-medium text-orange-600 mt-0.5">{s.early_leave_tolerance} mnt</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="flex-1 text-xs py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">Edit</button>
                <button onClick={() => setDeleteTarget(s)} className="flex-1 text-xs py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">Hapus</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && availableDepts.length > 0 && (
        <Card>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Departemen tanpa jadwal</p>
          <div className="space-y-2">
            {availableDepts.map(d => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{d.name}</span>
                <button onClick={() => openAdd(String(d.id))} className="text-xs text-violet-600 hover:text-violet-700 transition-colors">
                  + Tambah jadwal
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <FormModal
        open={showForm}
        title={editTarget ? `Edit Jadwal — ${editTarget.department_name}` : 'Tambah Jadwal'}
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-3 rounded-lg">{error}</div>}

          {!editTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Departemen</label>
              {availableDepts.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 px-3 py-3 rounded-lg">Semua departemen sudah memiliki jadwal.</p>
              ) : (
                <select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} required className={inputClass}>
                  <option value="">Pilih departemen...</option>
                  {availableDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Jadwal</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="contoh: Shift Pagi, Shift Normal" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Masuk</label>
              <input type="time" value={form.work_start} onChange={e => setForm({ ...form, work_start: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Pulang</label>
              <input type="time" value={form.work_end} onChange={e => setForm({ ...form, work_end: e.target.value })} required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Toleransi Terlambat
                <span className="text-gray-400 font-normal ml-1 text-xs">(menit)</span>
              </label>
              <input type="number" min="0" max="120" value={form.late_tolerance} onChange={e => setForm({ ...form, late_tolerance: e.target.value })} className={inputClass} />
              <p className="text-xs text-gray-400 mt-1.5">Hadir s.d. {addTime(form.work_start, form.late_tolerance)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Toleransi Pulang Cepat
                <span className="text-gray-400 font-normal ml-1 text-xs">(menit)</span>
              </label>
              <input type="number" min="0" max="120" value={form.early_leave_tolerance} onChange={e => setForm({ ...form, early_leave_tolerance: e.target.value })} className={inputClass} />
              <p className="text-xs text-gray-400 mt-1.5">Normal setelah {subTime(form.work_end, form.early_leave_tolerance)}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={closeForm} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors">Batal</button>
            <button type="submit" disabled={submitting || (!editTarget && availableDepts.length === 0)} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-sm font-medium text-white transition-colors">
              {submitting ? 'Menyimpan...' : editTarget ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus jadwal?"
        message={deleteTarget ? `Jadwal "${deleteTarget.name}" untuk ${deleteTarget.department_name} akan dihapus.` : ''}
        confirmText="Hapus Jadwal"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}