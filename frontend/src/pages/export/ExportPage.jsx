import { useState } from 'react'
import api from '../../services/api'
import Card from '../../components/ui/Card'

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export default function ExportPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [message, setMessage] = useState('')

  const handleDownload = async type => {
    const setLoading = type === 'excel' ? setLoadingExcel : setLoadingPdf
    setLoading(true); setMessage('')
    try {
      const res = await api.get(`/export/${type}`, { params: { year, month }, responseType: 'blob' })
      const ext = type === 'excel' ? 'xlsx' : 'pdf'
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.setAttribute('download', `absensi_${year}_${String(month).padStart(2, '0')}.${ext}`)
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
      setMessage('success')
    } catch {
      setMessage('error')
    } finally { setLoading(false) }
  }

  const selectClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all bg-white'

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Export Laporan</h1>
        <p className="text-sm text-gray-400 mt-0.5">Download laporan absensi dalam format Excel atau PDF</p>
      </div>

      <Card>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Pilih Periode</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Tahun</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClass}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Bulan</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClass}>
              {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>

        {message === 'success' && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-2.5 rounded-lg mb-4">
            File berhasil diunduh.
          </div>
        )}
        {message === 'error' && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg mb-4">
            Gagal mengunduh. Pastikan ada data absensi di periode ini.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDownload('excel')}
            disabled={loadingExcel}
            className="flex flex-col items-center gap-2 p-5 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all disabled:opacity-40 text-center"
          >
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Excel</p>
              <p className="text-xs text-gray-400">.xlsx dengan warna</p>
            </div>
            {loadingExcel && <p className="text-xs text-gray-400">Mengunduh...</p>}
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            disabled={loadingPdf}
            className="flex flex-col items-center gap-2 p-5 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all disabled:opacity-40 text-center"
          >
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">PDF</p>
              <p className="text-xs text-gray-400">Siap cetak A4</p>
            </div>
            {loadingPdf && <p className="text-xs text-gray-400">Mengunduh...</p>}
          </button>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Informasi</p>
        <ul className="space-y-1.5 text-sm text-gray-500">
          {[
            'Mencakup seluruh data absensi di bulan yang dipilih',
            'Excel dilengkapi warna berdasarkan status kehadiran',
            'PDF dalam format landscape A4, siap cetak',
            'Hanya admin yang dapat mengakses fitur ini',
          ].map(info => (
            <li key={info} className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">–</span>
              {info}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}