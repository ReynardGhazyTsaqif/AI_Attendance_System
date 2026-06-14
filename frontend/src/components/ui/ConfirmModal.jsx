export default function ConfirmModal({
  open,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  loading = false,
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  const confirmClass =
    variant === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-violet-600 hover:bg-violet-700 text-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40">
      <div className="w-full max-w-sm rounded-xl bg-white border border-gray-100 shadow-lg p-5">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {message && (
          <p className="text-sm text-gray-500 mt-2 leading-6">{message}</p>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-sm font-medium text-gray-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg disabled:opacity-50 text-sm font-medium transition-colors ${confirmClass}`}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
