import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/dashboard" : "/attendance");
    } catch (err) {
      setError(err.response?.data?.detail || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#F7F7F6]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />

      <div className="relative flex h-full items-center justify-center px-4 py-4 sm:px-6">
        <div className="grid h-full max-h-[680px] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_22px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left Panel */}
          <section className="relative hidden overflow-hidden bg-[#17102f] p-7 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />

            <div className="relative">
              <Link
                to="/"
                className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 ring-1 ring-white/10 transition hover:bg-white/15"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500 shadow-lg shadow-violet-950/30">
                  <FaceIcon className="h-4.5 w-4.5 text-white" />
                </span>
                PresenAI
              </Link>

              <h1 className="text-3xl font-black leading-tight tracking-tight xl:text-4xl">
                Absensi cerdas berbasis pengenalan wajah.
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
                Masuk untuk mencatat kehadiran secara cepat, aman, dan
                terverifikasi menggunakan teknologi face recognition.
              </p>

              <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
                <FeatureCard
                  icon={<ScanIcon className="h-4.5 w-4.5" />}
                  title="Face Verify"
                  desc="Verifikasi wajah"
                />
                <FeatureCard
                  icon={<LocationIcon className="h-4.5 w-4.5" />}
                  title="Location Check"
                  desc="Validasi lokasi"
                />
                <FeatureCard
                  icon={<ChartIcon className="h-4.5 w-4.5" />}
                  title="Attendance"
                  desc="Riwayat kehadiran"
                />
                <FeatureCard
                  icon={<ShieldIcon className="h-4.5 w-4.5" />}
                  title="Protected"
                  desc="Akses terlindungi"
                />
              </div>
            </div>
          </section>

          {/* Right Form */}
          <section className="flex min-h-0 items-center overflow-y-auto p-6 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-md">
              {/* Mobile brand */}
              <Link
                to="/"
                className="mb-7 inline-flex items-center gap-3 self-start rounded-2xl bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700 lg:hidden"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
                  <FaceIcon className="h-4.5 w-4.5 text-white" />
                </span>
                PresenAI
              </Link>

              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                  Selamat datang kembali
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Masukkan email dan password yang telah terdaftar untuk
                  melanjutkan ke halaman PresenAI.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                      !
                    </span>
                    <p>{error}</p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Email
                  </label>

                  <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 transition-all focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10">
                    <MailIcon className="h-5 w-5 shrink-0 text-gray-400 group-focus-within:text-violet-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="nama@presenai.com"
                      className="w-full bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Password
                  </label>

                  <div className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 transition-all focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10">
                    <LockIcon className="h-5 w-5 shrink-0 text-gray-400 group-focus-within:text-violet-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Masukkan password"
                      className="w-full bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-300"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(124,58,237,0.22)] transition-all hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk ke Sistem
                      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-violet-100">
        {icon}
      </div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-0.5 text-xs text-white/50">{desc}</p>
    </div>
  );
}

function FaceIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6 20v-1a6 6 0 0 1 12 0v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 10h14v10H5V10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScanIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 11a3 3 0 0 1 6 0M8 16a4 4 0 0 1 8 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ChartIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
