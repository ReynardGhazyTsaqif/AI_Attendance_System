import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="max-w-6xl mx-auto px-5 py-10 lg:py-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
        <div>
          <p className="text-sm font-medium text-violet-600 mb-3">
            Reynard Ghazy Tsaqif · 2311532014
          </p>
          <div className="mb-5">
            <img
              src="/LogoTitle.png"
              alt="PresenAI"
              className="w-64 sm:w-80 h-auto object-contain"
            />
          </div>

          
          <p className="mt-5 text-base sm:text-lg text-gray-500 leading-8 max-w-2xl">
            PresenAI adalah aplikasi absensi cerdas berbasis face recognition
            yang menggunakan webcam untuk mengenali wajah pengguna, menampilkan
            confidence score, mencatat kehadiran, serta menyediakan dashboard
            statistik dan analytics.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              className="px-5 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold text-center transition-colors"
            >
              Login
            </Link>
            <Link
              to="/attendance"
              className="px-5 py-3 rounded-lg bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold text-center border border-gray-200 transition-colors"
            >
              Mulai Absensi
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-3 rounded-lg bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold text-center border border-gray-200 transition-colors"
            >
              Lihat Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Face Verification
              </p>
              <p className="text-xs text-gray-400">Webcam · Liveness · GPS</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">
              Active
            </span>
          </div>
          <div className="aspect-video rounded-xl bg-gray-950 overflow-hidden relative">
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-28 h-28 rounded-full border-2 border-violet-400/80 relative">
                <div className="absolute inset-4 rounded-full border border-white/30" />
                <div className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="absolute left-4 bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="flex items-center justify-between text-xs">
                <span>Confidence Score</span>
                <span className="font-semibold">94.8%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/20">
                <div
                  className="h-1.5 rounded-full bg-green-400"
                  style={{ width: "94.8%" }}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-lg bg-violet-50 p-3">
              <p className="text-xs text-violet-500">Mode</p>
              <p className="text-sm font-semibold text-violet-900 mt-1">
                Check-in
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs text-green-600">Status</p>
              <p className="text-sm font-semibold text-green-900 mt-1">Hadir</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs text-amber-600">GPS</p>
              <p className="text-sm font-semibold text-amber-900 mt-1">Valid</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
