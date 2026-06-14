import { useState, useEffect } from 'react'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmModal from '../../components/ui/ConfirmModal'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  department_id: '',
}

const inputClass =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all'

const roleBadge = {
  admin: 'bg-violet-50 text-violet-700',
  staff: 'bg-blue-50 text-blue-700',
  user: 'bg-gray-50 text-gray-500',
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const asArray = v => Array.isArray(v) ? v : []

  const fetchData = async () => {
    setLoading(true)

    const [ur, dr] = await Promise.allSettled([
      api.get('/users/'),
      api.get('/departments/'),
    ])

    setUsers(ur.status === 'fulfilled' ? asArray(ur.value.data) : [])
    setDepartments(dr.status === 'fulfilled' ? asArray(dr.value.data) : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleReset = () => {
    setShowForm(false)
    setEditTarget(null)
    setForm(emptyForm)
    setError('')
  }

  const handleEdit = u => {
    setEditTarget(u)
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      department_id: u.department_id ? String(u.department_id) : '',
    })
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        department_id: form.department_id ? Number(form.department_id) : null,
      }

      if (editTarget) {
        await api.put(`/users/${editTarget.id}`, payload)
      } else {
        await api.post('/users/', {
          ...payload,
          password: form.password,
        })
      }

      handleReset()
      fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.put(`/users/${id}`, { is_active: !isActive })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/users/${deleteTarget.id}`)
      setDeleteTarget(null)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Manajemen User
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            {users.length} user terdaftar
          </p>
        </div>

        <Button
          onClick={() => showForm ? handleReset() : setShowForm(true)}
          size="sm"
        >
          {showForm ? 'Batal' : '+ Tambah User'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <p className="mb-4 text-sm font-medium text-gray-800">
            {editTarget ? `Edit — ${editTarget.name}` : 'User Baru'}
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 sm:col-span-2">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs text-gray-500">
                Nama
              </label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Nama lengkap"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-gray-500">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                placeholder="email@presenai.com"
                className={inputClass}
              />
            </div>

            {!editTarget && (
              <div>
                <label className="mb-1.5 block text-xs text-gray-500">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Min. 6 karakter"
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs text-gray-500">
                Role
              </label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              >
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className={editTarget ? 'sm:col-span-2' : ''}>
              <label className="mb-1.5 block text-xs text-gray-500">
                Departemen
              </label>
              <select
                value={form.department_id}
                onChange={e => setForm({ ...form, department_id: e.target.value })}
                className={inputClass}
              >
                <option value="">Tanpa departemen</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={handleReset} size="sm">
                Batal
              </Button>
              <Button type="submit" disabled={submitting} size="sm">
                {submitting ? 'Menyimpan...' : editTarget ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Data */}
      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Memuat data...
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">
              Belum ada user.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Nama', 'Email', 'Departemen', 'Role', 'Status', ''].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {users.map(u => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={u.name} />
                          <span className="font-medium text-gray-800">
                            {u.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {u.email}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {u.department_name || <span className="text-gray-300">—</span>}
                      </td>

                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge active={u.is_active} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <ActionButtons
                            user={u}
                            onEdit={handleEdit}
                            onToggleActive={handleToggleActive}
                            onDelete={setDeleteTarget}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="divide-y divide-gray-100 md:hidden">
              {users.map(u => (
                <div key={u.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={u.name} size="lg" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {u.name}
                          </p>
                          <p className="mt-0.5 break-all text-xs text-gray-500">
                            {u.email}
                          </p>
                        </div>

                        <StatusBadge active={u.is_active} />
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2">
                        <div className="rounded-xl bg-gray-50 px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                            Departemen
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-gray-700">
                            {u.department_name || 'Tanpa departemen'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                              Role
                            </p>
                            <div className="mt-1">
                              <RoleBadge role={u.role} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="rounded-lg bg-gray-50 px-2 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          className="rounded-lg bg-gray-50 px-2 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
                        >
                          {u.is_active ? 'Nonaktif' : 'Aktif'}
                        </button>

                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="rounded-lg bg-red-50 px-2 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus user?"
        message={deleteTarget ? `User ${deleteTarget.name} akan dihapus dari sistem.` : ''}
        confirmText="Hapus User"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function Avatar({ name, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'h-10 w-10' : 'h-7 w-7'

  return (
    <div
      className={`${sizeClass} flex flex-shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-600`}
    >
      {name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  )
}

function RoleBadge({ role }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${roleBadge[role] || roleBadge.user}`}
    >
      {role}
    </span>
  )
}

function StatusBadge({ active }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'
      }`}
    >
      {active ? 'Aktif' : 'Nonaktif'}
    </span>
  )
}

function ActionButtons({ user, onEdit, onToggleActive, onDelete }) {
  return (
    <>
      <button
        onClick={() => onEdit(user)}
        className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100"
      >
        Edit
      </button>

      <button
        onClick={() => onToggleActive(user.id, user.is_active)}
        className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100"
      >
        {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
      </button>

      <button
        onClick={() => onDelete(user)}
        className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
      >
        Hapus
      </button>
    </>
  )
}
