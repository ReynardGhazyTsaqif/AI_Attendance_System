import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import api from '../../services/api'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'

const statusBadge = {
  hadir: 'bg-green-50 text-green-700',
  terlambat: 'bg-amber-50 text-amber-700',
  tidak_hadir: 'bg-red-50 text-red-600',
  izin: 'bg-blue-50 text-blue-700',
  sakit: 'bg-purple-50 text-purple-700',
}

function StatBox({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-gray-100 text-gray-900',
    violet: 'bg-violet-50 border-violet-100 text-violet-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    red: 'bg-red-50 border-red-100 text-red-600',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 ${tones[tone] || tones.default}`}>
      <p className="text-[11px] font-medium text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function CompactMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [imageStats, setImageStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, m, t, l] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/image-processing-stats'),
          api.get('/dashboard/trend'),
          api.get('/dashboard/recent-logs'),
        ])

        setSummary(s.data)
        setImageStats(m.data)
        setTrend(Array.isArray(t.data) ? t.data : [])
        setLogs(Array.isArray(l.data) ? l.data : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const handleSendDailySummary = async () => {
    if (user?.role !== 'admin') {
      setEmailMessage('')
      setEmailError('Akses ditolak. Hanya admin yang dapat mengirim laporan harian.')
      return
    }

    setSendingEmail(true)
    setEmailMessage('')
    setEmailError('')

    try {
      if (import.meta.env.DEV) {
        console.info('[DailySummary] POST /attendance/send-daily-summary', {
          hasToken: !!localStorage.getItem('token'),
          role: user?.role,
        })
      }

      const res = await api.post('/attendance/send-daily-summary', null)
      setEmailMessage(res.data?.message || 'Laporan harian sedang diproses dan akan dikirim ke email.')
    } catch (err) {
      const detail = err.response?.data?.detail
      const message = formatErrorDetail(detail) || err.message || 'Gagal mengirim laporan harian.'

      if (import.meta.env.DEV) {
        console.error('[DailySummary] request failed', {
          status: err.response?.status,
          detail,
        })
      }

      setEmailError(message)
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Memuat data...
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        {/* Main Summary */}
        {summary && (
          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Ringkasan Kehadiran Hari Ini
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Monitoring kehadiran berdasarkan data check-in terbaru.
                </p>
              </div>

              <div className="rounded-2xl bg-violet-600 px-4 py-3 text-white">
                <p className="text-[11px] font-medium text-violet-200">
                  Tingkat Kehadiran
                </p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight">
                  {summary.attendance_rate}%
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatBox label="Total Karyawan" value={summary.total_users} />
              <StatBox label="Hadir" value={summary.hadir} tone="green" />
              <StatBox label="Terlambat" value={summary.terlambat} tone="amber" />
              <StatBox label="Tidak Hadir" value={summary.tidak_hadir} tone="red" />
            </div>

            <div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-violet-500 transition-all duration-500"
                  style={{ width: `${summary.attendance_rate}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">
                {summary.total_checkin} dari {summary.total_users} karyawan sudah melakukan check-in.
              </p>
            </div>
          </Card>
        )}

        {/* Email Notification */}
        <Card className="p-5">
          <div className="flex h-full flex-col justify-between gap-4">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <MailIcon />
              </div>

              <p className="text-sm font-semibold text-gray-900">
                Email Notification
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                Kirim laporan harian attendance ke email yang sudah dikonfigurasi.
              </p>
            </div>

            <div>
              <button
                onClick={handleSendDailySummary}
                disabled={sendingEmail}
                className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingEmail ? 'Mengirim...' : 'Kirim Laporan Harian'}
              </button>

              {emailMessage && (
                <div className="mt-3 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-700">
                  {emailMessage}
                </div>
              )}

              {emailError && (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {emailError}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Model Stats */}
      {imageStats && (
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.6fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Statistik Model Image Processing
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                Ringkasan performa face verification berdasarkan data yang tersimpan.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <CompactMetric
                label="Jumlah Data Diuji"
                value={`${imageStats.total_tested || 0} deteksi`}
              />
              <CompactMetric
                label="Akurasi Model"
                value={
                  imageStats.average_confidence != null
                    ? `${imageStats.average_confidence}%`
                    : 'N/A'
                }
              />
              <CompactMetric
                label="Waktu Inferensi"
                value={
                  imageStats.average_inference_time_ms != null
                    ? `${(imageStats.average_inference_time_ms / 1000).toFixed(2)} detik`
                    : 'Belum tersedia'
                }
              />
            </div>
          </div>
        </Card>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Chart */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Tren 7 Hari Terakhir
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Perbandingan hadir dan terlambat.
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={trend} barSize={10} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F1EF"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                width={26}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                }}
                cursor={{ fill: '#F7F7F6' }}
              />
              <Bar
                dataKey="hadir"
                name="Hadir"
                fill="#7C3AED"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="terlambat"
                name="Terlambat"
                fill="#FCD34D"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Logs */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Aktivitas Terbaru
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Check-in terbaru hari ini.
              </p>
            </div>

            <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
              {logs.length} data
            </span>
          </div>

          <div className="max-h-[230px] space-y-2 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Belum ada aktivitas hari ini
              </p>
            ) : (
              logs.map(log => (
                <div
                  key={log.attendance_id}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-600">
                    {log.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {log.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTime(log.check_in_time)}
                    </p>
                  </div>

                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                      statusBadge[log.status] || 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {log.status?.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function formatTime(value) {
  if (!value) return '—'

  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatErrorDetail(detail) {
  if (!detail) return ''
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map(item => {
        if (typeof item === 'string') return item
        if (item?.msg) {
          const location = Array.isArray(item.loc) ? item.loc.join('.') : ''
          return `${location ? `${location}: ` : ''}${item.msg}`
        }
        return JSON.stringify(item)
      })
      .join('; ')
  }
  if (typeof detail === 'object') return detail.msg || JSON.stringify(detail)
  return String(detail)
}

function MailIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 6h16v12H4V6Z" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
