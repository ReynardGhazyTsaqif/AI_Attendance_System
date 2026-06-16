# AI Attendance System / PresenAI

## 1. Deskripsi Singkat Project

AI Attendance System / PresenAI adalah sistem absensi berbasis web yang menggunakan verifikasi wajah dan lokasi untuk mencatat kehadiran pengguna. Aplikasi ini dibuat dengan frontend React dan backend FastAPI, serta menyimpan data ke database MySQL.

Fitur utama yang tersedia:

- Face recognition untuk verifikasi wajah saat absensi.
- Face enrollment melalui kamera atau upload foto.
- Liveness check berbasis kedipan mata sebelum check-in/check-out.
- Validasi GPS dan radius lokasi absensi.
- Dashboard admin dan halaman user.
- Riwayat absensi.
- Laporan harian attendance via email.
- Manajemen user, department, location, schedule, dan export laporan.

Project ini juga memiliki landing page public dengan identitas:

- Nama project: PresenAI - AI Attendance System
- Nama mahasiswa: Reynard Ghazy Tsaqif
- NIM: 2311532014

## 2. Latar Belakang

Absensi manual sering kali kurang efisien, mudah terlambat direkap, dan berpotensi menimbulkan kecurangan seperti titip absen. Sistem absensi digital dibutuhkan agar proses pencatatan kehadiran lebih cepat, terstruktur, dan mudah dipantau.

PresenAI dibuat untuk menggabungkan beberapa lapisan validasi:

- Verifikasi wajah untuk memastikan user yang melakukan absensi adalah user yang benar.
- Liveness check untuk mengurangi risiko spoofing sederhana menggunakan foto.
- Validasi GPS agar user hanya bisa melakukan absensi di lokasi yang sudah ditentukan admin.
- Jadwal kerja per department agar status hadir, terlambat, dan pulang cepat bisa dihitung otomatis.
- Dashboard dan laporan harian agar admin dapat memantau attendance secara cepat.

## 3. Tujuan Project

Tujuan utama project ini adalah:

- Membuat sistem absensi digital berbasis web.
- Menggunakan AI/face recognition untuk identifikasi wajah.
- Menggunakan liveness check untuk mencegah spoofing sederhana.
- Menggunakan GPS untuk validasi radius lokasi.
- Menyediakan dashboard monitoring untuk admin.
- Menyediakan laporan harian attendance via email.
- Menyediakan histori absensi user.
- Menyediakan manajemen data user, department, location, dan schedule.

## 4. Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- react-webcam
- Recharts
- MediaPipe FaceMesh melalui CDN untuk liveness check

### Backend

- FastAPI
- Uvicorn
- SQLAlchemy
- Python
- JWT Authentication dengan `python-jose`
- Password hashing dengan `passlib` dan bcrypt
- Pydantic schema
- BackgroundTasks FastAPI untuk proses email harian

### Database

- MySQL
- PyMySQL
- phpMyAdmin dapat digunakan untuk inspeksi dan manajemen database

### AI / Face Recognition

- DeepFace
- Facenet512
- OpenCV
- MTCNN/RetinaFace dependency dari DeepFace
- Face enrollment
- Face verification
- Image upload dan webcam capture
- Preprocessing gambar: denoise, sharpen, CLAHE

### Email Service

- Resend Email API
- Pengirim default: `onboarding@resend.dev`
- SMTP Gmail pernah digunakan, tetapi diganti karena port SMTP 465/587 dapat timeout atau diblokir jaringan lokal/deploy.
- Endpoint laporan harian memakai background task agar frontend tidak menunggu proses email terlalu lama.

### Deployment

- Frontend: Vercel
- Backend: Railway
- Database: MySQL sesuai konfigurasi environment deploy
- Frontend menggunakan `VITE_API_URL` untuk mengarah ke backend production.

## 5. Struktur Folder Project

Struktur utama project:

```text
ai-attendance-system/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models/
│       │   ├── attendance_model.py
│       │   ├── department_model.py
│       │   ├── face_model.py
│       │   ├── location_model.py
│       │   ├── schedule_model.py
│       │   └── user_model.py
│       ├── routes/
│       │   ├── attendance_routes.py
│       │   ├── auth_routes.py
│       │   ├── dashboard_routes.py
│       │   ├── department_routes.py
│       │   ├── export_routes.py
│       │   ├── face_routes.py
│       │   ├── location_routes.py
│       │   ├── schedule_routes.py
│       │   └── user_routes.py
│       ├── schemas/
│       │   ├── attendance_schema.py
│       │   ├── auth_schema.py
│       │   ├── department_schema.py
│       │   ├── face_schema.py
│       │   ├── location_schema.py
│       │   ├── schedule_schema.py
│       │   └── user_schema.py
│       ├── services/
│       │   ├── attendance_service.py
│       │   ├── dashboard_service.py
│       │   ├── email_service.py
│       │   ├── export_service.py
│       │   ├── face_service.py
│       │   └── resend_email_service.py
│       └── utils/
│           ├── dependencies.py
│           ├── jwt_handler.py
│           ├── password_handler.py
│           └── schema_migrations.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   ├── public/
│   │   ├── Logo.png
│   │   ├── LogoTitle.png
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── assets/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── FormModal.jsx
│       │   │   ├── Layout.jsx
│       │   │   └── Sidebar.jsx
│       │   └── ui/
│       │       ├── Button.jsx
│       │       ├── Card.jsx
│       │       ├── ConfirmModal.jsx
│       │       └── LivenessCheck.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── attendance/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── department/
│       │   ├── export/
│       │   ├── face/
│       │   ├── landing/
│       │   ├── location/
│       │   ├── schedule/
│       │   └── users/
│       └── services/
│           └── api.js
│
├── AI_Attendance_System_Project_Brief.md
├── PROGRESS_REPORT.md
└── PROJECT_DOCUMENTATION.md
```

## 6. Fitur Utama

### A. Authentication

Authentication tersedia melalui endpoint `/auth/login`, `/auth/register`, dan `/auth/me`.

Fitur authentication:

- Login menggunakan email dan password.
- Register tersedia di backend.
- Token JWT dibuat setelah login/register.
- Token disimpan frontend di `localStorage`.
- Axios interceptor menambahkan header `Authorization: Bearer <token>` untuk request protected.
- Protected route di frontend membatasi akses halaman.
- Role yang digunakan: `admin`, `staff`, dan `user`.
- Admin memiliki akses ke dashboard, user management, department, location, schedule, export, dan email report.
- User/staff diarahkan ke halaman attendance.
- Logout menghapus token dan data user dari `localStorage`.

Catatan teknis:

- Frontend hanya auto logout pada error 401 yang benar-benar berkaitan dengan token invalid/expired.
- Error face mismatch tidak menyebabkan logout karena backend menggunakan status non-401 untuk kegagalan face verification biasa.

### B. Dashboard Admin

Dashboard admin menampilkan:

- Ringkasan kehadiran hari ini.
- Total karyawan aktif dengan role `user` atau `staff`.
- Hadir, terlambat, pulang cepat, tidak hadir.
- Attendance rate.
- Tren 7 hari terakhir.
- Aktivitas terbaru.
- Statistik model image processing.
- Section Email Notification.
- Tombol `Kirim Laporan Harian`.

Logic statistik dashboard:

- Total user hanya menghitung user aktif role `user` dan `staff`.
- Admin tidak dihitung sebagai karyawan absensi.
- Hadir dihitung berdasarkan distinct `user_id`.
- Tidak hadir = total user aktif - jumlah user yang sudah check-in hari ini.
- Nilai tidak hadir diamankan dengan `max(value, 0)` agar tidak negatif.

### C. User Management

Halaman `UsersPage` digunakan admin untuk mengelola user.

Fitur:

- Melihat daftar user.
- Tambah user.
- Edit user.
- Hapus user.
- Aktivasi/nonaktivasi user.
- Pilih role `user`, `staff`, atau `admin`.
- Pilih department untuk user.
- Tabel menampilkan nama department user.

Relasi penting:

- User memiliki `department_id`.
- Department user digunakan untuk mengambil schedule dan location saat check-in/check-out.
- Jika user belum memiliki department, backend dapat mengembalikan error jelas: `User belum memiliki departemen.`

### D. Department Management

Department digunakan sebagai penghubung antara user, location, dan schedule.

Fitur:

- CRUD department.
- Department dapat memiliki `location_id`.
- Response department menampilkan `location_name`.
- Department digunakan oleh schedule.
- Department digunakan saat validasi lokasi absensi user.

Alur relasi:

```text
User -> department_id -> Department -> location_id -> Location
User -> department_id -> WorkSchedule
```

### E. Location Management

Location Management digunakan admin untuk mengatur lokasi absensi.

Data utama:

- Nama lokasi.
- Latitude.
- Longitude.
- Radius dalam meter.

Fitur UI:

- Tambah lokasi.
- Edit lokasi.
- Hapus lokasi.
- Pakai lokasi GPS saat ini untuk mengisi koordinat.
- Buka koordinat di Google Maps.
- Radius dapat diatur dari UI.

Location digunakan backend sebagai lokasi validasi absensi berdasarkan department user.

### F. Schedule Management

Schedule Management digunakan admin untuk mengatur jadwal kerja per department.

Data utama:

- Department.
- Nama jadwal.
- Jam masuk.
- Jam pulang.
- Toleransi terlambat.
- Toleransi pulang cepat.
- Status aktif.

Catatan:

- Satu department hanya boleh memiliki satu jadwal kerja aktif/terdaftar pada tabel `work_schedules` karena `department_id` bersifat unique.
- Frontend menyaring department yang sudah memiliki schedule agar tidak dipilih ulang.
- Backend tetap memvalidasi bahwa department ada dan belum memiliki jadwal saat create.

### G. Face Enrollment

Face Enrollment tersedia di halaman `FaceEnrollPage`.

Fitur:

- User/admin dapat mendaftarkan wajah.
- Enrollment dapat menggunakan kamera.
- Enrollment dapat menggunakan upload foto.
- Saat upload foto, sistem tidak langsung enroll.
- Setelah memilih foto, preview ditampilkan terlebih dahulu.
- User harus menekan tombol `Daftarkan Wajah`.
- Ada tombol `Ganti Foto`.
- Ada loading state, misalnya `Memproses foto...`.
- Error FastAPI 422 atau error detail berbentuk object/array dikonversi menjadi string aman.
- Tidak ada object error yang dirender langsung sebagai React child.
- Hapus data wajah menggunakan custom confirmation modal.

Backend enrollment:

- Endpoint: `POST /face/enroll/{user_id}`.
- Field FormData: `files`.
- Mendukung beberapa file, maksimal 5 foto.
- Kamera frontend saat ini mengambil 3 foto dari sudut berbeda sebelum dikirim.
- Backend menghitung rata-rata embedding dari foto yang diterima.
- Jika face profile sudah ada, embedding diperbarui.

### H. Liveness Check

Liveness check tersedia pada halaman attendance sebelum capture wajah.

Implementasi:

- Komponen `LivenessCheck.jsx`.
- Menggunakan webcam.
- Menggunakan MediaPipe FaceMesh via CDN.
- Menghitung Eye Aspect Ratio (EAR).
- User diminta berkedip 2 kali.
- Jika MediaPipe gagal dimuat, tersedia fallback berbasis timer.
- Setelah liveness lolos, sistem melanjutkan countdown dan capture wajah otomatis.

Tujuan:

- Mengurangi risiko spoofing sederhana.
- Memastikan user benar-benar hadir di depan kamera sebelum absensi diproses.

### I. Attendance Check-in / Check-out

Halaman `AttendancePage` digunakan user untuk melakukan check-in dan check-out.

Alur validasi:

- Frontend meminta akses GPS.
- Tombol check-in/check-out aktif setelah GPS tersedia.
- User memilih check-in atau check-out.
- User melakukan liveness check.
- Frontend mengambil foto dari webcam.
- Frontend mengirim `user_id`, `latitude`, `longitude`, dan `file` ke backend.
- Backend memvalidasi user dan akses.
- Backend memvalidasi department user.
- Backend memvalidasi location department.
- Backend menghitung radius.
- Backend memvalidasi wajah.
- Backend menentukan status berdasarkan schedule department.
- Data attendance disimpan ke database.

Endpoint:

- `POST /attendance/check-in`
- `POST /attendance/check-out`

Status attendance:

- `hadir`
- `terlambat`
- `pulang_cepat`
- `tidak_hadir`
- `izin`
- `sakit`

Catatan error:

- Jika wajah tidak cocok atau confidence rendah, backend mengembalikan error 422.
- Frontend menampilkan pesan: `Wajah tidak cocok atau confidence terlalu rendah. Silakan coba lagi.`
- Token tidak dihapus dan user tidak diarahkan ke login untuk kegagalan face recognition biasa.

### J. Radius Location Validation

Validasi radius lokasi dilakukan di backend, bukan hanya di frontend.

Detail:

- Frontend mengirim latitude dan longitude user.
- Backend mengambil department user.
- Backend mengambil location dari department.
- Backend menghitung jarak user dengan lokasi admin menggunakan rumus Haversine.
- Jika jarak lebih besar dari `radius_meter`, request ditolak.
- Jika masih dalam radius, absensi diproses.

Contoh error:

```text
Anda berada di luar radius absensi. Jarak Anda 245 meter dari lokasi yang diizinkan.
```

Jika department belum memiliki lokasi, backend memberi error:

```text
Lokasi absensi departemen belum diset.
```

Jika user belum memiliki department, backend memberi error:

```text
User belum memiliki departemen.
```

### K. Attendance History

Halaman `HistoryPage` menampilkan riwayat absensi user.

Fitur:

- Riwayat absensi user.
- Summary card: hadir, terlambat, izin, sakit, tidak hadir, kehadiran.
- Tabel desktop dan card list mobile.
- Menampilkan tanggal, check-in, check-out, status, menit terlambat, dan confidence score.
- Data tampilan difilter berdasarkan bulan berjalan.

Catatan teknis:

- Frontend menghitung summary bulan berjalan berdasarkan hari kerja.
- Sabtu dan Minggu dihitung sebagai hari libur sehingga tidak dianggap tidak hadir pada summary UI.
- Backend endpoint `/dashboard/my-summary` juga tersedia untuk monthly summary, tetapi implementasi service backend saat ini menghitung total hari dalam bulan. Jika angka backend dan frontend berbeda, UI utama History memakai perhitungan frontend yang mengecualikan weekend.

### L. Daily Attendance Email Report

Admin dapat mengirim laporan harian attendance ke email melalui section `Email Notification` di Dashboard.

Alur saat ini:

- Admin klik tombol `Kirim Laporan Harian`.
- Frontend memanggil `POST /attendance/send-daily-summary` dengan body `null`.
- Backend menghitung summary attendance hari ini.
- Backend menjadwalkan pengiriman email via FastAPI BackgroundTasks.
- Backend langsung mengembalikan response cepat.
- Email dikirim melalui Resend API di background.
- Frontend menampilkan pesan bahwa laporan sedang diproses dan akan dikirim ke email.

Isi email minimal:

- Tanggal.
- Total Users.
- Hadir.
- Terlambat.
- Pulang Cepat.
- Tidak Hadir.
- Total Check-in.
- Attendance Rate.

Catatan Resend:

- Email pengirim default: `onboarding@resend.dev`.
- Pada mode testing Resend, email hanya bisa dikirim ke email akun Resend atau email yang diizinkan.
- Untuk production agar dapat mengirim ke email bebas, domain harus diverifikasi di Resend.
- API key Resend wajib disimpan di environment variable, bukan di source code.

## 7. Arsitektur Sistem

### Frontend React

Frontend bertanggung jawab untuk:

- Menampilkan UI aplikasi.
- Mengelola route public/protected.
- Menyimpan token dan data user di localStorage.
- Mengambil input user.
- Mengakses webcam dan GPS browser.
- Mengirim request ke backend menggunakan Axios.
- Menampilkan loading state, error state, dan notifikasi UI.

### Backend FastAPI

Backend bertanggung jawab untuk:

- Menyediakan REST API.
- Authentication JWT.
- Role-based authorization.
- CRUD data master.
- Face enrollment dan face verification.
- Validasi GPS/radius.
- Penentuan status attendance berdasarkan schedule.
- Dashboard summary.
- Export laporan.
- Pengiriman email harian via Resend.

### Database MySQL

Database menyimpan:

- User.
- Department.
- Location.
- Work schedule.
- Face profile.
- Attendance.
- Attendance log.

### Email API

Backend menggunakan Resend API untuk mengirim laporan harian attendance. Pengiriman dilakukan melalui background task agar request frontend tidak timeout saat deploy.

## 8. Alur Absensi

Alur check-in/check-out:

1. User login.
2. User memastikan wajah sudah terdaftar.
3. User membuka halaman Absensi.
4. Sistem meminta akses GPS.
5. User memilih Check In atau Check Out.
6. User melakukan liveness check.
7. Sistem mengambil foto wajah.
8. Frontend mengirim foto, `user_id`, `latitude`, dan `longitude` ke backend.
9. Backend memvalidasi token dan hak akses.
10. Backend mengambil data user.
11. Backend mengambil department user.
12. Backend mengambil location department.
13. Backend memvalidasi radius lokasi.
14. Backend mengambil face profile user.
15. Backend mengekstrak embedding wajah dari foto.
16. Backend membandingkan embedding dengan face profile.
17. Backend mengambil schedule department.
18. Backend menentukan status attendance.
19. Backend menyimpan attendance dan attendance log.
20. Frontend menampilkan hasil sukses/gagal.

## 9. Alur Face Enrollment

Alur enrollment:

1. User membuka halaman Face Enrollment.
2. User memilih mode Kamera atau Upload Foto.
3. Jika menggunakan kamera, user mengambil beberapa foto dari sudut berbeda.
4. Jika upload, user memilih file foto.
5. Preview foto ditampilkan terlebih dahulu.
6. User klik `Daftarkan Wajah`.
7. Frontend mengirim FormData field `files` ke backend.
8. Backend memvalidasi file JPG/PNG.
9. Backend memvalidasi apakah wajah terdeteksi.
10. Backend mengekstrak embedding wajah.
11. Backend menyimpan atau memperbarui face profile.
12. Jika berhasil, status wajah menjadi terdaftar.
13. Jika gagal, error tampil sebagai notifikasi UI.

## 10. Alur Email Laporan Harian

Alur email report:

1. Admin membuka Dashboard.
2. Admin klik tombol `Kirim Laporan Harian`.
3. Frontend memanggil `POST /attendance/send-daily-summary`.
4. Backend memvalidasi admin.
5. Backend membuat summary attendance hari itu.
6. Backend memvalidasi env Resend.
7. Backend menjadwalkan background task pengiriman email.
8. Backend langsung mengembalikan response cepat.
9. Frontend menampilkan pesan bahwa laporan sedang diproses.
10. Background task mengirim email melalui Resend API.
11. Status sukses/gagal pengiriman dapat dicek di log backend.
12. Email masuk ke alamat yang dikonfigurasi jika Resend berhasil.

## 11. Environment Variables

Contoh `.env.example` backend:

```env
# Database
DB_HOST=
DB_PORT=3306
DB_NAME=
DB_USER=
DB_PASSWORD=

# JWT
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# App
APP_HOST=0.0.0.0
APP_PORT=8000
DEBUG=True

# Email Provider
EMAIL_PROVIDER=resend
RESEND_API_KEY=
RESEND_FROM=onboarding@resend.dev
ADMIN_EMAIL=

# Deprecated SMTP config
# SMTP Gmail tidak lagi digunakan untuk fitur laporan harian.
SMTP_HOST=
SMTP_PORT=
SMTP_EMAIL=
SMTP_PASSWORD=
SMTP_TIMEOUT=30
```

Contoh `.env.example` frontend:

```env
VITE_API_URL=http://localhost:8000
```

Catatan keamanan:

- Jangan commit `.env` asli.
- Jangan menulis API key, password, token, atau secret di source code.
- Di Railway/Vercel, isi environment variables melalui dashboard platform.

## 12. Cara Menjalankan Project Lokal

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend lokal default:

```text
http://localhost:8000
```

Swagger/OpenAPI:

```text
http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend lokal default:

```text
http://localhost:5173
```

### Database

1. Buat database MySQL, misalnya `ai_attendance`.
2. Sesuaikan konfigurasi database di `.env`.
3. Jalankan backend.
4. Backend menjalankan `Base.metadata.create_all(bind=engine)`.
5. Backend juga menjalankan `ensure_schema(engine)` untuk migrasi kompatibilitas kecil pada database lama.
6. Gunakan phpMyAdmin jika ingin memeriksa tabel dan data.

## 13. Cara Deployment

### Frontend Vercel

Langkah umum:

1. Deploy folder `frontend`.
2. Pastikan build command:

```bash
npm run build
```

3. Pastikan output directory Vite:

```text
dist
```

4. Set environment variable:

```env
VITE_API_URL=https://url-backend-production
```

5. Project sudah memiliki `frontend/vercel.json` untuk rewrite React Router:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Rewrite ini penting agar refresh halaman seperti `/dashboard`, `/attendance`, atau `/history` tidak menjadi 404.

### Backend Railway

Langkah umum:

1. Deploy folder `backend`.
2. Pastikan `requirements.txt` lengkap.
3. Pastikan package `resend` sudah ada di requirements.
4. Set start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Set environment variables backend di Railway.
6. Pastikan database MySQL dapat diakses dari Railway.
7. Pastikan CORS backend mengizinkan domain frontend production.

### Docker Backend

Backend memiliki `backend/Dockerfile`.

Catatan Dockerfile:

- Menggunakan `python:3.11-slim-bookworm`.
- Menginstall library sistem untuk OpenCV/DeepFace.
- Menggunakan `opencv-python-headless`.
- Menjalankan Uvicorn.

### Email Resend

Environment deploy yang wajib:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=
RESEND_FROM=onboarding@resend.dev
ADMIN_EMAIL=
```

Catatan:

- Jika Resend masih testing mode, `ADMIN_EMAIL` harus email akun Resend sendiri atau email yang sudah diizinkan.
- Jika ingin mengirim ke email bebas, verifikasi domain di Resend.
- Jangan log API key Resend.

## 14. API Endpoint Ringkasan

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| GET | `/` | Health root API | Public |
| GET | `/health` | Health check backend | Public |
| POST | `/auth/register` | Register user | Public |
| POST | `/auth/login` | Login user dan mendapatkan JWT | Public |
| GET | `/auth/me` | Ambil user login | User/Admin |
| GET | `/users/` | Ambil semua user | Admin |
| GET | `/users/me` | Ambil profil user login | User/Admin |
| GET | `/users/{user_id}` | Ambil detail user | User sendiri/Admin |
| POST | `/users/` | Tambah user | Admin |
| PUT | `/users/{user_id}` | Update user | User sendiri/Admin, field role/status admin only |
| DELETE | `/users/{user_id}` | Hapus user | Admin |
| GET | `/departments/` | Ambil semua department | User/Admin |
| GET | `/departments/{department_id}` | Ambil detail department | User/Admin |
| POST | `/departments/` | Tambah department | Admin |
| PUT | `/departments/{department_id}` | Update department | Admin |
| DELETE | `/departments/{department_id}` | Hapus department | Admin |
| GET | `/locations/` | Ambil semua lokasi | User/Admin |
| GET | `/locations/{location_id}` | Ambil detail lokasi | User/Admin |
| POST | `/locations/` | Tambah lokasi | Admin |
| PUT | `/locations/{location_id}` | Update lokasi | Admin |
| DELETE | `/locations/{location_id}` | Hapus lokasi | Admin |
| GET | `/schedules/` | Ambil semua jadwal | User/Admin |
| GET | `/schedules/my` | Ambil jadwal department user login | User/Admin |
| GET | `/schedules/department/{department_id}` | Ambil jadwal by department | User/Admin |
| POST | `/schedules/` | Tambah jadwal | Admin |
| PUT | `/schedules/{schedule_id}` | Update jadwal | Admin |
| DELETE | `/schedules/{schedule_id}` | Hapus jadwal | Admin |
| POST | `/face/enroll/{user_id}` | Daftarkan wajah | User sendiri/Admin |
| POST | `/face/recognize` | Recognize wajah dari file | User/Admin |
| DELETE | `/face/enroll/{user_id}` | Hapus face profile | User sendiri/Admin |
| GET | `/face/status/{user_id}` | Cek status enrollment wajah | User/Admin |
| POST | `/attendance/check-in` | Check-in attendance | User sendiri/Admin |
| POST | `/attendance/check-out` | Check-out attendance | User sendiri/Admin |
| GET | `/attendance/today/{user_id}` | Absensi hari ini user | User sendiri/Admin |
| GET | `/attendance/history/{user_id}` | Riwayat absensi user | User sendiri/Admin |
| GET | `/attendance/all` | Semua absensi hari ini | Admin |
| POST | `/attendance/send-daily-summary` | Kirim laporan harian via Resend background task | Admin |
| GET | `/dashboard/summary` | Summary dashboard hari ini | Admin |
| GET | `/dashboard/image-processing-stats` | Statistik model image processing | Admin |
| GET | `/dashboard/trend` | Tren attendance 7 hari | Admin |
| GET | `/dashboard/my-summary` | Summary bulanan user login | User/Admin |
| GET | `/dashboard/user-summary/{user_id}` | Summary bulanan user tertentu | Admin |
| GET | `/dashboard/recent-logs` | Attendance terbaru hari ini | Admin |
| GET | `/export/excel` | Export laporan Excel | Admin |
| GET | `/export/pdf` | Export laporan PDF | Admin |

## 15. Database / Model Ringkasan

### users

Fungsi:

- Menyimpan data akun user/admin/staff.
- Menyimpan email dan password hash.
- Menyimpan role.
- Menyimpan status aktif.
- Menyimpan relasi ke department dan location.

Kolom penting:

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `department_id`
- `location_id`
- `is_active`
- `created_at`

### departments

Fungsi:

- Menyimpan data department.
- Menjadi penghubung user dengan location dan schedule.

Kolom penting:

- `id`
- `name`
- `location_id`
- `created_at`

### locations

Fungsi:

- Menyimpan lokasi absensi yang dibuat admin.
- Digunakan untuk validasi GPS user.

Kolom penting:

- `id`
- `name`
- `latitude`
- `longitude`
- `radius_meter`
- `created_at`

### work_schedules

Fungsi:

- Menyimpan jadwal kerja per department.
- Digunakan untuk menentukan status hadir, terlambat, dan pulang cepat.

Kolom penting:

- `id`
- `department_id`
- `name`
- `work_start`
- `work_end`
- `late_tolerance`
- `early_leave_tolerance`
- `is_active`
- `created_at`
- `updated_at`

Catatan:

- `department_id` bersifat unique, sehingga satu department memiliki satu jadwal.

### face_profiles

Fungsi:

- Menyimpan data enrollment wajah user.
- Menyimpan embedding wajah sebagai JSON string.
- Menyimpan path gambar enrollment.

Kolom penting:

- `id`
- `user_id`
- `face_embedding`
- `face_image_path`
- `is_active`
- `created_at`

### attendances

Fungsi:

- Menyimpan data absensi check-in/check-out.
- Menyimpan status attendance.
- Menyimpan koordinat user saat absen.
- Menyimpan confidence score hasil face verification.
- Menyimpan path gambar check-in/check-out.

Kolom penting:

- `id`
- `user_id`
- `check_in_time`
- `check_out_time`
- `status`
- `late_minutes`
- `location_lat`
- `location_lng`
- `confidence_score`
- `liveness_score`
- `check_in_image_path`
- `check_out_image_path`
- `created_at`

### attendance_logs

Fungsi:

- Menyimpan log aktivitas attendance.
- Berguna untuk audit dan debugging.

Kolom penting:

- `id`
- `user_id`
- `action`
- `status`
- `message`
- `created_at`

## 16. UI/UX Notes

Catatan UI/UX:

- Desain menggunakan Tailwind CSS.
- Tema dominan clean, modern, dengan violet sebagai warna utama.
- Layout menggunakan sidebar untuk halaman authenticated.
- Landing page public tidak memakai sidebar.
- Dashboard menggunakan summary card dan chart.
- Attendance page tetap fokus pada workflow check-in/check-out.
- History page responsive desktop/mobile.
- Form menggunakan modal custom.
- Konfirmasi hapus menggunakan `ConfirmModal`, bukan `window.confirm`.
- Notifikasi sukses/gagal memakai UI card/alert custom, bukan `alert()` bawaan browser.
- Loading state tersedia pada proses penting seperti submit form, upload foto, enrollment, absensi, export, dan email report.
- Error backend berbentuk string/object/array ditampilkan aman sebagai string.

## 17. Security Notes

Catatan keamanan:

- Authentication menggunakan JWT.
- Protected route diterapkan di frontend.
- Authorization admin diterapkan di backend melalui `require_admin`.
- User biasa hanya boleh mengakses data dirinya untuk endpoint tertentu.
- Secret key JWT tidak boleh di-hardcode.
- API key Resend harus ada di environment variable.
- Password disimpan sebagai hash, bukan plaintext.
- Validasi radius dilakukan di backend.
- Validasi wajah dilakukan di backend.
- File upload divalidasi berdasarkan tipe file JPG/PNG.
- Endpoint face mismatch tidak memakai 401 agar tidak memicu logout otomatis.
- Jangan menyimpan `.env`, API key, password, token, atau secret di repository.
- CORS harus dibatasi ke origin frontend yang digunakan.

## 18. Testing Checklist

### Authentication

- [ ] Login admin berhasil.
- [ ] Login user berhasil.
- [ ] Token tersimpan setelah login.
- [ ] Protected route berjalan.
- [ ] Admin-only route menolak user biasa.
- [ ] Logout berhasil.
- [ ] Token expired/invalid mengarahkan user ke login.

### Face Enrollment

- [ ] Enroll via kamera berhasil.
- [ ] Kamera mengambil beberapa foto sebelum enroll.
- [ ] Enroll via upload foto berhasil.
- [ ] Preview muncul sebelum upload enroll.
- [ ] Tombol `Daftarkan Wajah` bekerja.
- [ ] Tombol `Ganti Foto` bekerja.
- [ ] Loading muncul saat proses.
- [ ] Error 422 tampil rapi.
- [ ] Tidak ada error `Objects are not valid as a React child`.
- [ ] Hapus wajah memakai modal custom.

### Attendance

- [ ] GPS berhasil didapat.
- [ ] Tombol absensi disabled saat GPS belum tersedia.
- [ ] Liveness check berjalan.
- [ ] Check-in berhasil dalam radius.
- [ ] Check-in ditolak di luar radius.
- [ ] Check-in ditolak jika wajah tidak cocok.
- [ ] User tetap login saat confidence rendah.
- [ ] Check-out berhasil.
- [ ] Check-out ditolak jika belum check-in.
- [ ] Status terlambat mengikuti schedule department.
- [ ] Status pulang cepat mengikuti schedule department.
- [ ] Attendance log tersimpan.

### History

- [ ] Riwayat bulan berjalan tampil.
- [ ] Summary card tampil.
- [ ] Sabtu/Minggu tidak dihitung tidak hadir pada summary UI.
- [ ] Confidence score tampil.
- [ ] Tampilan mobile dan desktop rapi.

### Admin

- [ ] CRUD user berjalan.
- [ ] User dapat dipilihkan department.
- [ ] Nama department tampil di tabel user.
- [ ] CRUD department berjalan.
- [ ] Department dapat dipilihkan location.
- [ ] CRUD location berjalan.
- [ ] Radius lokasi bisa diatur.
- [ ] CRUD schedule berjalan.
- [ ] Schedule hanya dibuat untuk department yang ada.
- [ ] Department yang sudah punya schedule tidak bisa dibuatkan schedule duplikat.
- [ ] Dashboard tampil sesuai data.

### Email

- [ ] Tombol `Kirim Laporan Harian` muncul di Dashboard Admin.
- [ ] Frontend memanggil `POST /attendance/send-daily-summary`.
- [ ] Endpoint cepat mengembalikan response.
- [ ] Tidak terjadi timeout Axios 30 detik.
- [ ] Email dikirim via Resend.
- [ ] Email masuk ke ADMIN_EMAIL.
- [ ] Log backend menampilkan status background task.
- [ ] Tidak ada error SMTP Gmail.
- [ ] Jika Resend env kosong, error backend jelas.

### Export

- [ ] Export Excel berhasil.
- [ ] Export PDF berhasil.
- [ ] Filter bulan/tahun bekerja.
- [ ] File hasil export dapat dibuka.

### Deployment

- [ ] Frontend Vercel bisa diakses.
- [ ] Refresh halaman frontend tidak 404.
- [ ] Backend Railway running.
- [ ] API production bisa diakses.
- [ ] CORS mengizinkan domain frontend production.
- [ ] Environment variables production lengkap.
- [ ] Database production dapat diakses backend.
- [ ] Resend env terbaca di Railway.

## 19. Known Issues / Catatan

Catatan teknis penting:

- SMTP Gmail tidak digunakan lagi untuk fitur laporan harian karena port 465/587 dapat diblokir jaringan atau timeout.
- Resend testing mode hanya dapat mengirim ke email tertentu yang diizinkan.
- Untuk production email bebas, perlu verifikasi domain di Resend.
- Endpoint email harian menggunakan background task. Response sukses berarti task sudah dijadwalkan, bukan jaminan email sudah masuk. Hasil akhir perlu dicek di log backend dan inbox.
- Frontend Axios memiliki timeout 30 detik. Karena email diproses background, endpoint tidak seharusnya menunggu sampai timeout.
- Service backend monthly summary saat ini menghitung semua hari bulan, sedangkan summary UI History menghitung hari kerja dan mengecualikan weekend.
- DeepFace/OpenCV dapat membutuhkan dependency sistem tambahan saat deploy. Dockerfile backend sudah menyiapkan beberapa library yang diperlukan.
- MediaPipe FaceMesh dimuat melalui CDN di frontend. Jika CDN gagal, liveness check memakai fallback timer-based.

## 20. Future Improvements

Saran pengembangan berikutnya:

- Verifikasi domain Resend untuk production email.
- Tambah monitoring delivery email dari Resend webhook.
- Tambah scheduler otomatis untuk email laporan harian.
- Tambah export PDF/Excel dengan filter advanced.
- Tambah pagination dan filter advanced pada history.
- Tambah audit log admin untuk CRUD data master.
- Tambah face anti-spoofing yang lebih kuat.
- Tambah role HR/admin/superadmin.
- Tambah approval workflow untuk izin/sakit.
- Tambah notifikasi otomatis untuk user terlambat.
- Tambah unit test dan integration test backend.
- Tambah E2E test frontend untuk flow login, enroll, attendance, dan email report.
- Sinkronkan logic monthly summary backend dan frontend agar sama-sama menghitung hari kerja.

## 21. Final Summary

AI Attendance System / PresenAI sudah mencakup fitur inti sistem absensi modern:

- Absensi berbasis wajah.
- Face enrollment via kamera dan upload foto.
- Liveness check.
- GPS radius validation.
- Schedule per department.
- Dashboard admin.
- Statistik image processing.
- History attendance user.
- Export laporan Excel/PDF.
- Email daily report via Resend.
- Deployment frontend/backend.

Sistem ini dirancang agar admin dapat mengelola data master, memantau absensi, dan mengirim laporan harian, sementara user dapat melakukan absensi dengan validasi wajah, liveness, lokasi, dan jadwal kerja.
