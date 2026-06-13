import { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LivenessCheck from '../../components/ui/LivenessCheck'

const statusStyle = {
  hadir: 'bg-green-50 text-green-700',
  terlambat: 'bg-amber-50 text-amber-700',
  tidak_hadir: 'bg-red-50 text-red-600',
}

export default function AttendancePage() {
  const { user } = useAuth()
  const webcamRef = useRef(null)
  const [mode, setMode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [livenessCleared, setLivenessCleared] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [mySchedule, setMySchedule] = useState(null)

  useEffect(() => {
    api.get(`/attendance/today/${user.user_id}`).then(r => setTodayAttendance(r.data)).catch(() => {})
    api.get('/schedules/my').then(r => setMySchedule(r.data)).catch(() => {})
  }, [user])

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError('Browser tidak mendukung GPS'); return }
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Izin lokasi ditolak.')
    )
  }, [])

  useEffect(() => {
    if (!livenessCleared) return
    let count = 3
    setCountdown(count)
    const iv = setInterval(() => {
      count -= 1
      if (count > 0) { setCountdown(count) } else { clearInterval(iv); setCountdown(null); capture() }
    }, 1000)
    return () => clearInterval(iv)
  }, [livenessCleared])

  const capture = useCallback(async () => {
    if (!webcamRef.current || !location) { setError('Lokasi GPS belum tersedia.'); return }
    setLoading(true); setError('')
    try {
      const imageSrc = webcamRef.current.getScreenshot()
      const blob = await fetch(imageSrc).then(r => r.blob())
      const formData = new FormData()
      formData.append('user_id', user.user_id)
      formData.append('latitude', location.lat)
      formData.append('longitude', location.lng)
      formData.append('file', blob, 'capture.jpg')
      const endpoint = mode === 'checkin' ? '/attendance/check-in' : '/attendance/check-out'
      const res = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      setTodayAttendance(prev => ({
        ...prev,
        check_in_time: res.data.check_in_time || prev?.check_in_time,
        check_out_time: res.data.check_out_time || prev?.check_out_time,
        status: res.data.status || prev?.status,
      }))
      setMode(null); setLivenessCleared(false)
    } catch (err) {
      const detail = err.response?.data?.detail || ''
      const isFaceMismatch =
        err.response?.status === 422 ||
        detail.toLowerCase().includes('wajah tidak cocok') ||
        detail.toLowerCase().includes('confidence')
      setError(isFaceMismatch
        ? 'Wajah tidak cocok atau confidence terlalu rendah. Silakan coba lagi.'
        : detail || 'Gagal memproses absensi')
      setLivenessCleared(false)
    } finally { setLoading(false) }
  }, [webcamRef, location, mode, user])

  const handleCancel = () => { setMode(null); setError(''); setLivenessCleared(false); setCountdown(null) }

  const Row = ({ label, value }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Absensi</h1>
        <p className="text-sm text-gray-400 mt-0.5">Kedipkan mata untuk verifikasi, lalu scan otomatis</p>
      </div>

      {/* Today status */}
      <Card>
        <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Status Hari Ini</p>
        {todayAttendance ? (
          <div>
            <Row
              label="Status"
              value={
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusStyle[todayAttendance.status] || 'bg-gray-50 text-gray-500'}`}>
                  {todayAttendance.status?.replace('_', ' ')}
                </span>
              }
            />
            <Row
              label="Check In"
              value={todayAttendance.check_in_time
                ? new Date(todayAttendance.check_in_time).toLocaleTimeString('id-ID')
                : '—'}
            />
            <Row
              label="Check Out"
              value={todayAttendance.check_out_time
                ? new Date(todayAttendance.check_out_time).toLocaleTimeString('id-ID')
                : '—'}
            />
            {todayAttendance.late_minutes > 0 && (
              <Row label="Keterlambatan" value={<span className="text-amber-600">{todayAttendance.late_minutes} menit</span>} />
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-2">Belum ada absensi hari ini</p>
        )}
      </Card>

      {/* Schedule */}
      {mySchedule && (
        <Card>
          <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Jadwal Kerja</p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Masuk</p>
              <p className="text-xl font-semibold text-gray-900">{mySchedule.work_start?.slice(0, 5)}</p>
              <p className="text-[11px] text-amber-500 mt-0.5">+{mySchedule.late_tolerance} mnt</p>
            </div>
            <div className="text-gray-200">→</div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Pulang</p>
              <p className="text-xl font-semibold text-gray-900">{mySchedule.work_end?.slice(0, 5)}</p>
              <p className="text-[11px] text-orange-400 mt-0.5">-{mySchedule.early_leave_tolerance} mnt</p>
            </div>
          </div>
        </Card>
      )}

      {/* GPS */}
      {locationError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
          {locationError}
        </div>
      )}
      {location && !mode && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-100 px-4 py-3 rounded-xl flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          GPS aktif — {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </div>
      )}

      {/* Buttons */}
      {!mode && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setMode('checkin'); setResult(null); setError('') }}
            disabled={!!todayAttendance?.check_in_time}
            className="py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
          >
            Check In
          </button>
          <button
            onClick={() => { setMode('checkout'); setResult(null); setError('') }}
            disabled={!todayAttendance?.check_in_time || !!todayAttendance?.check_out_time}
            className="py-3.5 rounded-xl bg-gray-800 hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
          >
            Check Out
          </button>
        </div>
      )}

      {/* Liveness + capture flow */}
      {mode && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-800">
              {mode === 'checkin' ? 'Check In' : 'Check Out'}
            </p>
            <button onClick={handleCancel} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Batal
            </button>
          </div>

          {!livenessCleared && (
            <div>
              <div className="bg-violet-50 border border-violet-100 text-violet-700 text-sm px-4 py-3 rounded-lg mb-4">
                Kedipkan mata 2× untuk membuktikan kamu bukan bot — kamera akan aktif otomatis.
              </div>
              <LivenessCheck
                onPassed={() => { setError(''); setLivenessCleared(true) }}
                onFailed={() => setError('Verifikasi gagal. Coba lagi.')}
              />
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg mt-4">
                  {error}
                </div>
              )}
            </div>
          )}

          {livenessCleared && (
            <div>
              <div className="relative rounded-xl overflow-hidden bg-gray-900 mb-4">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full"
                  mirrored
                  videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                />
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <p className="text-7xl font-bold text-white">{countdown}</p>
                      <p className="text-white text-sm mt-2 opacity-80">Bersiap...</p>
                    </div>
                  </div>
                )}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-white text-sm">Memproses...</p>
                  </div>
                )}
                {!loading && !countdown && (
                  <div className="absolute top-3 left-3 bg-white/90 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    Liveness OK
                  </div>
                )}
              </div>
              {error && (
                <div className="space-y-3">
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">{error}</div>
                  <button
                    onClick={() => { setError(''); setLivenessCleared(false) }}
                    className="w-full text-sm py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="border-green-100 bg-green-50">
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="font-medium text-green-800">{result.message}</p>
            {result.confidence_score && (
              <p className="text-sm text-green-600">Akurasi: {result.confidence_score.toFixed(1)}%</p>
            )}
            {result.late_minutes > 0 && (
              <p className="text-sm text-amber-600">Terlambat {result.late_minutes} menit</p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
