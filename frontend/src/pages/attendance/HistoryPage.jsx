import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/ui/Card'

const statusStyle = {
  hadir: 'bg-green-50 text-green-700',
  terlambat: 'bg-amber-50 text-amber-700',
  tidak_hadir: 'bg-red-50 text-red-600',
  izin: 'bg-blue-50 text-blue-700',
  sakit: 'bg-purple-50 text-purple-700',
  pulang_cepat: 'bg-orange-50 text-orange-700',
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, s] = await Promise.all([
          api.get(`/attendance/history/${user.user_id}`),
          api.get(`/dashboard/my-summary`),
        ])

        setRecords(Array.isArray(h.data) ? h.data : [])
        setSummary(s.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Memuat riwayat...
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Riwayat Absensi
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          30 hari terakhir
        </p>
      </div>

      {/* Summary chips */}
      {summary && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            {
              label: 'Hadir',
              value: summary.hadir,
              color: 'text-green-700',
              bg: 'bg-green-50',
            },
            {
              label: 'Terlambat',
              value: summary.terlambat,
              color: 'text-amber-700',
              bg: 'bg-amber-50',
            },
            {
              label: 'Izin',
              value: summary.izin,
              color: 'text-blue-700',
              bg: 'bg-blue-50',
            },
            {
              label: 'Sakit',
              value: summary.sakit,
              color: 'text-purple-700',
              bg: 'bg-purple-50',
            },
            {
              label: 'Tidak Hadir',
              value: summary.tidak_hadir,
              color: 'text-red-600',
              bg: 'bg-red-50',
            },
            {
              label: 'Kehadiran',
              value: `${summary.attendance_rate}%`,
              color: 'text-violet-700',
              bg: 'bg-violet-50',
            },
          ].map(item => (
            <div
              key={item.label}
              className={`${item.bg} rounded-xl px-3 py-3 text-center`}
            >
              <p className={`text-lg font-semibold ${item.color}`}>
                {item.value}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Data */}
      <Card className="overflow-hidden p-0">
        {records.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Belum ada riwayat absensi
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Tanggal', 'Check In', 'Check Out', 'Status', 'Terlambat', 'Akurasi'].map(h => (
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
                  {records.map(r => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {formatDate(r.check_in_time)}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {formatTime(r.check_in_time)}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {r.check_out_time ? (
                          formatTime(r.check_out_time)
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>

                      <td className="px-4 py-3">
                        {r.late_minutes > 0 ? (
                          <span className="text-sm text-amber-600">
                            {r.late_minutes} mnt
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {formatConfidence(r.confidence_score)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="divide-y divide-gray-100 md:hidden">
              {records.map(r => (
                <div key={r.id} className="p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(r.check_in_time)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Riwayat absensi harian
                      </p>
                    </div>

                    <StatusBadge status={r.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <InfoItem
                      label="Check In"
                      value={formatTime(r.check_in_time)}
                    />

                    <InfoItem
                      label="Check Out"
                      value={
                        r.check_out_time ? (
                          formatTime(r.check_out_time)
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      }
                    />

                    <InfoItem
                      label="Terlambat"
                      value={
                        r.late_minutes > 0 ? (
                          <span className="text-amber-600">
                            {r.late_minutes} mnt
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      }
                    />

                    <InfoItem
                      label="Akurasi"
                      value={formatConfidence(r.confidence_score)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
        statusStyle[status] || 'bg-gray-50 text-gray-500'
      }`}
    >
      {status?.replace('_', ' ') || '—'}
    </span>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-gray-700">
        {value}
      </p>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return '—'

  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatConfidence(value) {
  if (value === null || value === undefined) {
    return <span className="text-gray-300">—</span>
  }

  return `${Number(value).toFixed(1)}%`
}