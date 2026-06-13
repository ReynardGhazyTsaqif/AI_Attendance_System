# AI Attendance System — Project Brief

## 1. Judul Project

**AI Attendance System with Face Recognition, Liveness Detection, Location Validation, and Attendance Analytics**

Nama produk yang bisa digunakan:

**PresenAI — Smart Attendance & Workforce Analytics**

---

## 2. Deskripsi Singkat

AI Attendance System adalah sistem absensi cerdas berbasis **face recognition** yang digunakan untuk mencatat kehadiran pengguna secara otomatis melalui kamera/webcam. Sistem ini tidak hanya melakukan scan wajah, tetapi juga dilengkapi dengan **liveness detection**, validasi lokasi, dashboard kehadiran, rekap laporan, analytics, serta export laporan.

Project ini dikembangkan agar tidak hanya menjadi demo image processing sederhana, tetapi menjadi aplikasi web yang memiliki arah sebagai **produk yang dapat digunakan dan dijual** untuk sekolah, kampus, perusahaan, event, atau tempat magang.

---

## 3. Problem Statement

Sistem absensi manual seperti tanda tangan, Google Form, atau input kehadiran biasa memiliki beberapa kelemahan:

1. Mudah dimanipulasi atau dititipkan.
2. Membutuhkan waktu untuk rekap manual.
3. Sulit memantau keterlambatan secara real-time.
4. Tidak memiliki validasi identitas yang kuat.
5. Tidak menghasilkan insight atau analytics kehadiran.
6. Kurang efisien untuk organisasi dengan banyak pengguna.

Oleh karena itu, diperlukan sistem absensi berbasis AI yang dapat memverifikasi identitas pengguna melalui wajah, mencegah kecurangan dasar, serta menghasilkan laporan dan analisis kehadiran secara otomatis.

---

## 4. Tujuan Project

Tujuan utama project ini adalah membangun sistem absensi berbasis AI dan image processing yang mampu:

1. Melakukan registrasi wajah pengguna.
2. Melakukan check-in dan check-out menggunakan face recognition.
3. Mendeteksi kehadiran pengguna secara lebih aman dengan liveness detection.
4. Memvalidasi lokasi absensi menggunakan GPS/geofencing.
5. Menyimpan data absensi ke database MySQL.
6. Menampilkan dashboard kehadiran secara informatif.
7. Menyediakan rekap harian dan bulanan.
8. Menghasilkan export laporan dalam format Excel/PDF.
9. Memberikan analytics kehadiran untuk admin/HR/dosen.
10. Menjadi dasar produk komersial yang dapat dikembangkan lebih lanjut.

---

## 5. Target Pengguna

Project ini dapat ditujukan untuk beberapa jenis pengguna:

1. **Sekolah**
   - Absensi siswa.
   - Rekap kehadiran kelas.
   - Laporan ke wali kelas atau orang tua.

2. **Kampus**
   - Absensi mahasiswa.
   - Absensi praktikum.
   - Absensi seminar atau kegiatan akademik.

3. **Perusahaan**
   - Absensi karyawan.
   - Monitoring keterlambatan.
   - Rekap HR.

4. **Event Organizer**
   - Check-in peserta seminar/workshop.
   - Validasi peserta dengan wajah.

5. **Tempat Magang/PKL**
   - Monitoring kehadiran peserta magang.
   - Laporan kehadiran harian/bulanan.

---

## 6. Konsep Produk

Konsep utama project ini bukan hanya:

```text
scan wajah → hadir
```

Tetapi menjadi:

```text
face recognition
+ liveness detection
+ location validation
+ attendance management
+ dashboard analytics
+ report export
+ notification
```

Dengan begitu, sistem ini dapat diposisikan sebagai:

> Sistem absensi cerdas berbasis face recognition yang membantu organisasi mencatat kehadiran secara cepat, aman, akurat, dan informatif.

---

## 7. Scope Project

Project yang disarankan adalah **Skenario B+ — Product-Ready Web App**.

Skenario ini merupakan gabungan dari:

- Skenario B sebagai dasar utama.
- Fitur keamanan seperti liveness detection.
- Fitur validasi lokasi.
- Fitur analytics agar terlihat seperti produk AI.
- Fitur export laporan agar bisa digunakan dalam kebutuhan nyata.
- Rencana pengembangan enterprise sebagai future development.

---

## 8. Fitur Utama

### 8.1 Multi-User Login

Role yang digunakan:

#### Admin

Fitur admin:

- Login.
- Mengelola user.
- Mengelola lokasi/kelas/divisi.
- Melihat semua data absensi.
- Melihat dashboard analytics.
- Export laporan.

#### Staff / Dosen / HR

Fitur staff:

- Melihat data absensi kelompok tertentu.
- Melihat rekap kehadiran.
- Approve izin/sakit/lupa absen.
- Export laporan kelompok.

#### User / Mahasiswa / Karyawan

Fitur user:

- Login.
- Melakukan face enrollment.
- Melakukan check-in.
- Melakukan check-out.
- Melihat riwayat absensi pribadi.
- Mengajukan izin/sakit/lupa absen.

Untuk versi awal, role yang wajib dibuat terlebih dahulu adalah:

1. Admin
2. User

Role staff dapat ditambahkan setelah fitur inti stabil.

---

### 8.2 Face Registration / Face Enrollment

Sebelum melakukan absensi, user harus mendaftarkan wajah.

Fitur:

- Ambil foto wajah melalui webcam.
- Upload foto wajah jika diperlukan.
- Sistem mendeteksi apakah wajah terlihat jelas.
- Sistem memastikan hanya ada satu wajah.
- Sistem membuat face embedding.
- Face embedding disimpan ke database.
- Admin dapat melihat status user apakah sudah enroll wajah atau belum.

Catatan:

- Jangan hanya menyimpan foto mentah.
- Simpan face embedding dalam database.
- Foto dapat disimpan sebagai referensi opsional.

---

### 8.3 Face Recognition Check-In dan Check-Out

Fitur utama:

- User membuka halaman attendance.
- Webcam aktif.
- Sistem mendeteksi wajah.
- Sistem mengambil embedding wajah.
- Embedding dibandingkan dengan data di database.
- Jika wajah cocok, sistem menyimpan check-in atau check-out.
- Jika wajah tidak cocok, absensi ditolak.

Data yang disimpan:

- User ID.
- Waktu check-in.
- Waktu check-out.
- Status kehadiran.
- Confidence score.
- Liveness score.
- Lokasi latitude dan longitude.
- Bukti image path jika diperlukan.

---

### 8.4 Liveness Detection / Anti-Spoofing

Fitur ini digunakan untuk mencegah user melakukan absensi menggunakan:

- Foto wajah.
- Video wajah.
- Screenshot.
- Wajah dari layar HP.

Versi awal yang realistis:

1. Blink detection.
2. Head movement detection.
3. Random challenge sederhana.

Contoh challenge:

```text
Silakan kedipkan mata
Silakan senyum
Silakan toleh kanan
```

Untuk MVP, liveness detection tidak harus sempurna, tetapi harus menunjukkan bahwa sistem memiliki mekanisme anti-kecurangan dasar.

---

### 8.5 Location Validation

Fitur ini digunakan agar user hanya bisa absen dari lokasi tertentu.

Fitur:

- Mengambil lokasi pengguna melalui browser.
- Mengirim latitude dan longitude ke backend.
- Backend menghitung jarak user dengan lokasi yang terdaftar.
- Jika user berada dalam radius lokasi, absensi diterima.
- Jika user berada di luar radius, absensi ditolak.

Contoh aturan:

```text
Lokasi: Kampus / Kantor
Radius: 100 meter

Jika jarak <= 100 meter:
    absensi valid

Jika jarak > 100 meter:
    absensi ditolak
```

---

### 8.6 Attendance Rules

Aturan kehadiran yang disarankan:

```text
Jam masuk: 08.00
Toleransi keterlambatan: 15 menit

07.00 - 08.15 = hadir
> 08.15 = terlambat
Tidak check-in = tidak hadir
Check-out terlalu cepat = pulang cepat
```

Status attendance:

1. Hadir.
2. Terlambat.
3. Tidak hadir.
4. Izin.
5. Sakit.
6. Pulang cepat.

---

### 8.7 Dashboard Admin

Isi dashboard admin:

- Total user.
- Total hadir hari ini.
- Total terlambat hari ini.
- Total tidak hadir.
- Grafik kehadiran 7 hari terakhir.
- Grafik keterlambatan.
- Tabel absensi terbaru.
- Filter berdasarkan tanggal.
- Filter berdasarkan kelas/divisi/lokasi.
- Export laporan.

---

### 8.8 Dashboard User

Isi dashboard user:

- Status absensi hari ini.
- Tombol check-in.
- Tombol check-out.
- Riwayat absensi pribadi.
- Total hadir bulan ini.
- Total terlambat bulan ini.
- Form izin/sakit/lupa absen.

---

### 8.9 Attendance Analytics

Fitur analytics yang disarankan:

1. Attendance trend.
2. Late trend.
3. Peak attendance hour.
4. Attendance percentage.
5. Monthly attendance summary.
6. Heatmap kehadiran.
7. Anomaly detection sederhana.
8. AI insight summary.

Contoh insight:

> Minggu ini tingkat keterlambatan meningkat dibanding minggu sebelumnya. Hari Senin menjadi hari dengan jumlah keterlambatan tertinggi. Rata-rata check-in paling ramai terjadi pada pukul 07.45–08.10.

---

### 8.10 Export Laporan

Export yang disarankan:

1. Excel.
2. PDF.

Filter laporan:

- Tanggal.
- Bulan.
- User.
- Kelas/divisi.
- Lokasi.
- Status kehadiran.

Isi laporan:

- Nama.
- Email.
- Tanggal.
- Check-in.
- Check-out.
- Status.
- Late minutes.
- Confidence score.
- Liveness score.
- Lokasi.

---

### 8.11 Notifikasi Otomatis

Fitur ini bersifat bonus.

Notifikasi yang dapat dibuat:

- Email saat check-in berhasil.
- Email saat user terlambat.
- Email saat izin diajukan.
- Email saat izin disetujui/ditolak.
- Laporan harian otomatis ke admin.

Untuk versi awal, gunakan email terlebih dahulu. WhatsApp dapat menjadi fitur lanjutan.

---

## 9. Stack Teknologi

Stack final yang digunakan:

| Bagian | Teknologi |
|---|---|
| Frontend | React |
| Backend | FastAPI |
| Database | MySQL / MariaDB |
| Database Management | phpMyAdmin |
| Face Recognition | DeepFace / InsightFace |
| Image Processing | OpenCV |
| Chart / Analytics | Recharts |
| Export Excel | openpyxl / pandas |
| Export PDF | ReportLab / WeasyPrint |
| Authenticationder / Railway |
| Database Hosting | MySQL local / Railway / VPS |

Catatan:

- Untuk pengembangan awal, MySQL lokal melalui XAMPP/phpMyAdmin sudah cukup.
- phpMyAdmin bukan database, melainkan tools untuk mengelola MySQL/MariaDB.
- Face embedding dapat disimpan dalam format `LONGTEXT` atau `JSON`.

---

## 10. Struktur Folder Project

```text
ai-attendance-system/
│
├── backend/n | JWT / Session |
| Deployment Frontend | Vercel / Netlify |
| Deployment Backend | Re
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user_model.py
│   │   │   ├── face_model.py
│   │   │   ├── attendance_model.py
│   │   │   ├── location_model.py
│   │   │   └── department_model.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth_schema.py
│   │   │   ├── user_schema.py
│   │   │   ├── face_schema.py
│   │   │   ├── attendance_schema.py
│   │   │   └── location_schema.py
│   │   │
│   │   ├── routes/
│   │   │   ├── auth_routes.py
│   │   │   ├── user_routes.py
│   │   │   ├── face_routes.py
│   │   │   ├── attendance_routes.py
│   │   │   ├── location_routes.py
│   │   │   └── dashboard_routes.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── face_service.py
│   │   │   ├── attendance_service.py
│   │   │   ├── liveness_service.py
│   │   │   ├── location_service.py
│   │   │   ├── export_service.py
│   │   │   └── notification_service.py
│   │   │
│   │   └── utils/
│   │       ├── jwt_handler.py
│   │       ├── password_handler.py
│   │       ├── distance_calculator.py
│   │       └── file_handler.py
│   │
│   ├── uploads/
│   │   ├── enrollments/
│   │   └── attendances/
│   │
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── main.jsx
│   │
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## 11. Struktur Database MySQL

Database:

```sql
CREATE DATABASE ai_attendance;
```

### 11.1 Tabel departments

```sql
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11.2 Tabel locations

```sql
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    radius_meter INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11.3 Tabel users

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'user') DEFAULT 'user',
    department_id INT NULL,
    location_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);
```

### 11.4 Tabel face_profiles

```sql
CREATE TABLE face_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    face_embedding LONGTEXT NOT NULL,
    face_image_path VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 11.5 Tabel attendances

```sql
CREATE TABLE attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    check_in_time DATETIME NULL,
    check_out_time DATETIME NULL,
    status ENUM('hadir', 'terlambat', 'tidak_hadir', 'izin', 'sakit', 'pulang_cepat') DEFAULT 'hadir',
    late_minutes INT DEFAULT 0,
    location_lat DOUBLE NULL,
    location_lng DOUBLE NULL,
    confidence_score FLOAT NULL,
    liveness_score FLOAT NULL,
    check_in_image_path VARCHAR(255) NULL,
    check_out_image_path VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 11.6 Tabel attendance_logs

```sql
CREATE TABLE attendance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 12. Endpoint Backend

### 12.1 Auth

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### 12.2 Users

```text
GET    /users
GET    /users/{id}
POST   /users
PUT    /users/{id}
DELETE /users/{id}
```

### 12.3 Face

```text
POST /face/enroll
GET  /face/profile/{user_id}
POST /face/verify
```

### 12.4 Attendance

```text
POST /attendance/check-in
POST /attendance/check-out
GET  /attendance/today
GET  /attendance/history
GET  /attendance/report
GET  /attendance/export/excel
GET  /attendance/export/pdf
```

### 12.5 Locations

```text
GET    /locations
POST   /locations
PUT    /locations/{id}
DELETE /locations/{id}
```

### 12.6 Dashboard

```text
GET /dashboard/summary
GET /dashboard/attendance-trend
GET /dashboard/late-trend
GET /dashboard/recent-attendance
GET /dashboard/peak-hour
```

---

## 13. Halaman Frontend

Halaman yang disarankan:

```text
/auth/login
/auth/register

/dashboard
/users
/face/enroll
/attendance
/attendance/history
/attendance/report
/locations
/profile
```

Komponen penting:

```text
Navbar
Sidebar
ProtectedRoute
RoleBasedRoute
WebcamCapture
AttendanceCard
AttendanceTable
DashboardCard
DashboardChart
ExportButton
StatusBadge
```

---

## 14. Alur Sistem

### 14.1 Alur Face Enrollment

```text
User login
↓
User membuka halaman Face Enrollment
↓
Webcam aktif
↓
User mengambil foto wajah
↓
Frontend mengirim gambar ke backend
↓
Backend mendeteksi wajah
↓
Backend membuat face embedding
↓
Embedding disimpan ke database
↓
User berhasil mendaftarkan wajah
```

### 14.2 Alur Check-In

```text
User login
↓
User membuka halaman Attendance
↓
Webcam aktif
↓
User klik Check-In
↓
Frontend mengambil gambar wajah
↓
Frontend mengambil lokasi GPS
↓
Data dikirim ke backend
↓
Backend melakukan face recognition
↓
Backend melakukan liveness detection
↓
Backend melakukan location validation
↓
Backend menentukan status hadir/terlambat
↓
Data attendance disimpan ke database
↓
User mendapatkan hasil check-in
```

### 14.3 Alur Check-Out

```text
User login
↓
User membuka halaman Attendance
↓
User klik Check-Out
↓
Sistem melakukan verifikasi wajah ulang
↓
Jika valid, check_out_time diperbarui
↓
User mendapatkan hasil check-out
```

---

## 15. Prioritas Pengerjaan

Urutan pengerjaan yang disarankan:

```text
1. Setup MySQL dan database di phpMyAdmin
2. Setup backend FastAPI
3. Tes koneksi backend ke MySQL
4. Buat auth login/register
5. Buat frontend React
6. Hubungkan login frontend ke backend
7. Buat user management
8. Buat face enrollment
9. Buat face recognition check-in
10. Buat check-out
11. Buat attendance history
12. Buat dashboard admin
13. Buat export Excel
14. Tambahkan liveness detection
15. Tambahkan GPS validation
16. Tambahkan analytics grafik
17. Tambahkan export PDF
18. Tambahkan notifikasi email
19. Testing
20. Deployment
```

---

## 16. Timeline Pengerjaan

### Minggu 1 — Fondasi Aplikasi

Target:

- Setup project.
- Setup MySQL.
- Setup FastAPI.
- Setup React.
- Auth login/register.
- Role admin/user.
- Koneksi frontend-backend.

Output:

> Aplikasi sudah bisa login dan menyimpan user.

---

### Minggu 2 — Face Recognition Core

Target:

- Face enrollment.
- Face recognition.
- Check-in.
- Check-out.
- Attendance history.

Output:

> User sudah bisa melakukan absensi menggunakan wajah.

---

### Minggu 3 — Validation dan Dashboard

Target:

- Liveness detection.
- Location validation.
- Attendance rules.
- Dashboard admin.
- Filter attendance.
- Chart analytics.

Output:

> Sistem sudah memiliki fitur anti-kecurangan dasar dan dashboard informatif.

---

### Minggu 4 — Report dan Finishing

Target:

- Export Excel.
- Export PDF.
- Notifikasi email.
- UI polishing.
- Testing.
- Dokumentasi.
- Deployment.

Output:

> Project siap demo dan terlihat seperti produk.

---

## 17. Testing Checklist

### 17.1 Testing Face Recognition

- [ ] Wajah benar berhasil dikenali.
- [ ] Wajah salah ditolak.
- [ ] Tidak ada wajah ditolak.
- [ ] Lebih dari satu wajah ditolak.
- [ ] Foto dari HP ditolak atau diberi warning.
- [ ] Kamera gelap diberi warning.
- [ ] Wajah blur diberi warning.

### 17.2 Testing Attendance

- [ ] Check-in normal berhasil.
- [ ] Check-in terlambat tercatat sebagai terlambat.
- [ ] Check-out normal berhasil.
- [ ] Check-out tanpa check-in ditolak.
- [ ] Check-in dua kali pada hari yang sama ditolak.
- [ ] Data attendance tersimpan di database.

### 17.3 Testing Role

- [ ] Admin bisa melihat semua data.
- [ ] User hanya bisa melihat data sendiri.
- [ ] User tidak bisa membuka halaman admin.
- [ ] Token login berhasil digunakan.
- [ ] Logout menghapus session/token.

### 17.4 Testing Location

- [ ] User dalam radius lokasi berhasil check-in.
- [ ] User di luar radius lokasi ditolak.
- [ ] Jika GPS tidak diizinkan, sistem memberi pesan error.
- [ ] Latitude dan longitude tersimpan.

### 17.5 Testing Export

- [ ] Export Excel berhasil.
- [ ] Filter tanggal berjalan.
- [ ] Filter status berjalan.
- [ ] Data export sesuai dengan database.

---

## 18. Future Development

Fitur yang tidak wajib untuk versi awal, tetapi dapat menjadi pengembangan selanjutnya:

1. Mobile app Flutter.
2. Multi-tenant SaaS.
3. Subscription billing.
4. White-label untuk klien.
5. Public REST API.
6. On-premise deployment.
7. Integrasi WhatsApp API.
8. Payroll integration.
9. Advanced anomaly detection.
10. Advanced anti-spoofing model.
11. Docker deployment.
12. VPS production server.

---

## 19. Product Positioning

Kalimat positioning produk:

> PresenAI adalah sistem absensi cerdas berbasis face recognition yang dilengkapi liveness detection, validasi lokasi, dashboard analytics, dan export laporan. Sistem ini membantu sekolah, kampus, perusahaan, dan event organizer mencatat kehadiran secara cepat, aman, dan akurat.

---

## 20. Paket Produk

Jika dikembangkan sebagai produk komersial, sistem dapat dibagi menjadi beberapa paket:

| Paket | Fitur |
|---|---|
| Basic | Face attendance, dashboard, attendance history, export Excel |
| Pro | Liveness detection, GPS validation, analytics, export PDF, email notification |
| Enterprise | Multi-cabang, API, white-label, custom deployment, advanced analytics |

---

## 21. Catatan Penting

1. Gunakan MySQL sebagai database utama.
2. Gunakan phpMyAdmin hanya untuk mengelola database.
3. Simpan face embedding dalam `LONGTEXT` atau `JSON`.
4. Jangan langsung mengejar semua fitur.
5. Fokus pertama: auth, user, face enrollment, check-in, check-out.
6. Liveness detection dan GPS validation ditambahkan setelah core attendance berjalan.
7. Export dan dashboard penting agar project terlihat seperti produk nyata.
8. Dokumentasikan setiap endpoint dan fitur.
9. Buat demo yang jelas untuk presentasi.
10. Pastikan sistem memiliki pesan error yang mudah dipahami user.

---

## 22. Ringkasan Final

Project terbaik yang akan dibuat:

> **AI Attendance System berbasis face recognition dengan liveness detection, location validation, dashboard analytics, dan export laporan menggunakan React, FastAPI, MySQL, phpMyAdmin, DeepFace/OpenCV.**

Target utama:

> Membuat sistem absensi yang bukan hanya mencatat kehadiran, tetapi juga memverifikasi identitas, mencegah kecurangan dasar, menghasilkan laporan otomatis, dan siap dikembangkan menjadi produk komersial.
