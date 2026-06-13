import { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const MAX_PHOTOS = 3

export default function FaceEnrollPage() {
  const { user } = useAuth()
  const webcamRef = useRef(null)
  const [useCamera, setUseCamera] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [enrollStatus, setEnrollStatus] = useState(null)
  const [preview, setPreview] = useState(null)
  const [capturedImages, setCapturedImages] = useState([])
  const [instruction, setInstruction] = useState(`Ambil ${MAX_PHOTOS} foto dari sudut berbeda`)

  useEffect(() => {
    api.get(`/face/status/${user.user_id}`).then(r => setEnrollStatus(r.data)).catch(console.error)
  }, [user])

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return
    const imageSrc = webcamRef.current.getScreenshot()
    const newImages = [...capturedImages, imageSrc]
    setCapturedImages(newImages)
    setPreview(imageSrc)

    if (newImages.length < MAX_PHOTOS) {
      setInstruction(`Foto ${newImages.length}/${MAX_PHOTOS} — Gerakkan kepala sedikit, lalu ambil lagi`)
      return
    }

    setLoading(true); setError('')
    try {
      const formData = new FormData()
      for (const imgSrc of newImages) {
        const blob = await fetch(imgSrc).then(r => r.blob())
        formData.append('files', blob, 'enroll.jpg')
      }
      const res = await api.post(`/face/enroll/${user.user_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      setEnrollStatus({ enrolled: true, is_active: true })
      setCapturedImages([])
      setInstruction('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mendaftarkan wajah')
      setCapturedImages([])
    } finally { setLoading(false) }
  }, [webcamRef, capturedImages, user])

  const handleUpload = async e => {
    const file = e.target.files[0]; if (!file) return
    setLoading(true); setError(''); setResult(null)
    setPreview(URL.createObjectURL(file))
    try {
      const formData = new FormData(); formData.append('file', file)
      const res = await api.post(`/face/enroll/${user.user_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data); setEnrollStatus({ enrolled: true, is_active: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mendaftarkan wajah')
    } finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Hapus data wajah? Kamu perlu mendaftar ulang untuk bisa absen.')) return
    try {
      await api.delete(`/face/enroll/${user.user_id}`)
      setEnrollStatus({ enrolled: false }); setResult(null); setPreview(null)
    } catch (err) { setError(err.response?.data?.detail || 'Gagal menghapus data wajah') }
  }

  const resetMode = (cam) => {
    setUseCamera(cam); setPreview(null); setError(''); setResult(null); setCapturedImages([])
    setInstruction(`Ambil ${MAX_PHOTOS} foto dari sudut berbeda`)
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Daftarkan Wajah</h1>
        <p className="text-sm text-gray-400 mt-0.5">Wajah digunakan untuk verifikasi saat absensi</p>
      </div>

      {/* Enroll status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${enrollStatus?.enrolled ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div>
              <p className="text-sm font-medium text-gray-800">
                {enrollStatus?.enrolled ? 'Wajah terdaftar' : 'Belum mendaftar'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {enrollStatus?.enrolled
                  ? `Terdaftar ${enrollStatus.enrolled_at ? new Date(enrollStatus.enrolled_at).toLocaleDateString('id-ID') : ''}`
                  : 'Daftarkan wajah agar bisa absen'}
              </p>
            </div>
          </div>
          {enrollStatus?.enrolled && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Hapus
            </button>
          )}
        </div>
      </Card>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {[
          { cam: true, label: 'Kamera' },
          { cam: false, label: 'Upload Foto' },
        ].map(({ cam, label }) => (
          <button
            key={label}
            onClick={() => resetMode(cam)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              useCamera === cam ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Camera */}
      {useCamera && (
        <Card>
          <div className="rounded-xl overflow-hidden bg-gray-900 mb-4">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
              mirrored
              videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
            />
          </div>

          {/* Progress dots */}
          {capturedImages.length > 0 && capturedImages.length < MAX_PHOTOS && (
            <div className="flex items-center justify-center gap-2 mb-3">
              {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i < capturedImages.length ? 'bg-violet-600' : 'bg-gray-200'}`}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">{instruction}</span>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg mb-3">{error}</div>
          )}

          <button
            onClick={handleCapture}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium transition-all"
          >
            {loading
              ? 'Memproses...'
              : capturedImages.length === 0
              ? `Ambil Foto 1/${MAX_PHOTOS}`
              : `Ambil Foto ${capturedImages.length + 1}/${MAX_PHOTOS}`}
          </button>
        </Card>
      )}

      {/* Upload */}
      {!useCamera && (
        <Card>
          <div className="border-2 border-dashed border-gray-100 rounded-xl p-8 text-center mb-4">
            {preview ? (
              <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-xl mx-auto mb-4" />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
            <label className="cursor-pointer">
              <span className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
                Pilih Foto
              </span>
              <input type="file" accept="image/jpeg,image/png" onChange={handleUpload} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-2">JPG atau PNG, wajah jelas dan frontal</p>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">{error}</div>
          )}
        </Card>
      )}

      {/* Success */}
      {result && (
        <Card className="border-green-100 bg-green-50">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="font-medium text-green-800">{result.message}</p>
            <p className="text-sm text-green-600">Siap digunakan untuk absensi.</p>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Tips terbaik</p>
        <ul className="space-y-1.5 text-sm text-gray-500">
          {[
            'Pencahayaan cukup, tidak terlalu gelap',
            'Hadapkan wajah langsung ke kamera',
            'Hindari masker, kacamata hitam, atau topi',
            'Jaga jarak 30–60cm dari kamera',
            'Ekspresi netral, mata terbuka',
          ].map(tip => (
            <li key={tip} className="flex items-start gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" className="mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}