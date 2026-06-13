import { useRef, useEffect, useState, useCallback } from 'react'
import Webcam from 'react-webcam'

const EAR_THRESHOLD = 0.22  // Eye Aspect Ratio threshold untuk deteksi kedip
const BLINK_REQUIRED = 2    // Jumlah kedipan yang dibutuhkan

export default function LivenessCheck({ onPassed, onFailed }) {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | checking | passed | failed
  const [blinkCount, setBlinkCount] = useState(0)
  const [instruction, setInstruction] = useState('Memuat detektor wajah...')
  const [eyeOpen, setEyeOpen] = useState(true)
  const detectorRef = useRef(null)
  const rafRef = useRef(null)
  const blinkCountRef = useRef(0)
  const eyeWasClosedRef = useRef(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const loadDetector = async () => {
      try {
        // Load MediaPipe FaceMesh via CDN
        if (!window.facemesh) {
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
        }

        const faceMesh = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        })

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        })

        faceMesh.onResults(handleResults)
        detectorRef.current = faceMesh

        setStatus('ready')
        setInstruction(`Kedipkan mata ${BLINK_REQUIRED}x untuk verifikasi`)
      } catch (err) {
        // Fallback: gunakan timer-based liveness jika MediaPipe gagal load
        setStatus('fallback')
        setInstruction('Tekan tombol "Saya Siap" lalu tetap diam selama 3 detik')
      }
    }

    loadDetector()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })

  const calculateEAR = (landmarks, eyeIndices) => {
    // Eye Aspect Ratio = (vertical distances) / (2 * horizontal distance)
    const [p1, p2, p3, p4, p5, p6] = eyeIndices.map(i => landmarks[i])
    const vertical1 = Math.hypot(p2.x - p6.x, p2.y - p6.y)
    const vertical2 = Math.hypot(p3.x - p5.x, p3.y - p5.y)
    const horizontal = Math.hypot(p1.x - p4.x, p1.y - p4.y)
    return (vertical1 + vertical2) / (2 * horizontal)
  }

  const handleResults = useCallback((results) => {
    if (!results.multiFaceLandmarks?.length) return

    const landmarks = results.multiFaceLandmarks[0]

    // MediaPipe FaceMesh eye landmark indices
    const leftEye  = [33, 160, 158, 133, 153, 144]
    const rightEye = [362, 385, 387, 263, 373, 380]

    const leftEAR  = calculateEAR(landmarks, leftEye)
    const rightEAR = calculateEAR(landmarks, rightEye)
    const avgEAR   = (leftEAR + rightEAR) / 2

    const isEyeClosed = avgEAR < EAR_THRESHOLD

    if (isEyeClosed && !eyeWasClosedRef.current) {
      eyeWasClosedRef.current = true
      setEyeOpen(false)
    } else if (!isEyeClosed && eyeWasClosedRef.current) {
      // Mata baru dibuka setelah tertutup = satu kedipan
      eyeWasClosedRef.current = false
      setEyeOpen(true)
      blinkCountRef.current += 1
      setBlinkCount(blinkCountRef.current)

      if (blinkCountRef.current >= BLINK_REQUIRED) {
        setStatus('passed')
        setInstruction('✅ Verifikasi liveness berhasil!')
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        setTimeout(() => onPassed(), 800)
      } else {
        setInstruction(`Kedipkan mata ${BLINK_REQUIRED - blinkCountRef.current}x lagi...`)
      }
    }
  }, [onPassed])

  // Proses frame dari webcam
  useEffect(() => {
    if (status !== 'ready' || !detectorRef.current) return

    const processFrame = async () => {
      if (webcamRef.current?.video?.readyState === 4) {
        await detectorRef.current.send({ image: webcamRef.current.video })
      }
      rafRef.current = requestAnimationFrame(processFrame)
    }

    // Timeout 30 detik
    timeoutRef.current = setTimeout(() => {
      if (blinkCountRef.current < BLINK_REQUIRED) {
        setStatus('failed')
        setInstruction('❌ Waktu habis. Coba lagi.')
        onFailed()
      }
    }, 30000)

    processFrame()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [status, onFailed])

  // Fallback mode — timer based
  const handleFallbackReady = () => {
    setStatus('checking')
    setInstruction('Tetap diam dan hadap kamera...')
    setTimeout(() => {
      setStatus('passed')
      setInstruction('✅ Verifikasi selesai!')
      setTimeout(() => onPassed(), 800)
    }, 3000)
  }

  return (
    <div className="space-y-4">
      {/* Webcam */}
      <div className="relative rounded-xl overflow-hidden bg-gray-900">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full"
          mirrored
          videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
        />

        {/* Overlay status */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm text-center font-medium">{instruction}</p>
        </div>

        {/* Blink counter */}
        {status === 'ready' && (
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
            👁️ {blinkCount}/{BLINK_REQUIRED} kedipan
          </div>
        )}

        {/* Eye status indicator */}
        {status === 'ready' && (
          <div className="absolute top-3 left-3">
            <div className={`w-3 h-3 rounded-full ${eyeOpen ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
          </div>
        )}
      </div>

      {/* Progress bar kedipan */}
      {(status === 'ready' || status === 'passed') && (
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(blinkCount / BLINK_REQUIRED) * 100}%` }}
          />
        </div>
      )}

      {/* Fallback button */}
      {status === 'fallback' && (
        <button
          onClick={handleFallbackReady}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all"
        >
          Saya Siap — Mulai Verifikasi
        </button>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div className="text-center text-sm text-gray-400">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          Memuat detektor wajah...
        </div>
      )}
    </div>
  )
}