# smk7-academic-system
# 📘 Sistem Monitoring Absensi QR & Ujian Online (SMK Negeri 7)

## 📌 Deskripsi Proyek
Proyek ini dikembangkan sebagai solusi digitalisasi administrasi akademik di SMK Negeri 7. Sistem ini mengintegrasikan absensi berbasis pemindaian QR Code fisik siswa, manajemen bank soal, ujian online, hingga rekapitulasi nilai otomatis ke dalam format Excel resmi sekolah.

**Masalah Utama:**
- Absensi manual yang rawan kecurangan (titip absen).
- Proses rekapitulasi nilai yang memakan waktu lama dan rawan kesalahan manusia.
- Sistem ujian yang belum terintegrasi dengan data kehadiran siswa.

## 🚀 Fitur Utama
- **QR Attendance (Teacher Scan):** Guru melakukan pemindaian pada kartu QR fisik yang dimiliki siswa menggunakan perangkat (HP/Laptop).
- **Online Examination:** Pelaksanaan ujian digital secara real-time dengan fitur timer dan auto-submit.
- **Automated Grading:** Koreksi otomatis untuk soal pilihan ganda dan penghitungan nilai akhir berdasarkan bobot.
- **Export to Excel:** Fitur unggulan untuk mengekspor nilai langsung ke template .xlsx resmi SMK Negeri 7.

## 👥 Tim Pengembang (Kelompok 23)
| Nama Anggota | NIM | Peran |
| :--- | :--- | :--- |
| **Rafika Nur Indriani** | F52123097 | Project Manager |
| **Dinar Fauziahl** | F52123078 | QA |
| **Arya Yudhistira Syafrul** | F55123079 | Back-End Developer |
| **Dwi Candra Andika** | F55123028 | Front-End Developer |
| **Moh. Faathir Ash Shaff** | F55123040 | Front-End Developer |
| **Muh. Zulhajir AR** | F55123052 | UI/UX Designer |

## 🛠️ Arsitektur Teknologi
- **Frontend:** React / Next.js (Tailwind CSS)
- **Backend:** Laravel (REST API)
- **Database:** MySQL / PostgreSQL
- **Tools:** GitHub, Trello, Figma

## 📅 Tahapan Pelaksanaan
1. **Perumusan Masalah & Proposal:** Minggu 1-2.
2. **Spesifikasi Sistem:** Minggu 3.
3. **Perancangan Sistem:** Minggu 4-6.
4. **Implementasi & Coding:** Minggu 7-14.
5. **Pengujian & Evaluasi:** Minggu 15-16.

## ▶️ Cara Menjalankan Project (Laravel)

### 1) Prasyarat
- PHP 8.3+
- Composer
- Node.js + npm
- Database MySQL/PostgreSQL

### 2) Setup cepat (disarankan)
Jalankan dari root project:

```bash
composer setup
composer run dev
```

Perintah `composer setup` di project ini akan otomatis:
- install dependency PHP (`composer install`)
- membuat file `.env` jika belum ada
- generate `APP_KEY`
- menjalankan migrasi database
- install dependency frontend (`npm install`)
- build aset awal (`npm run build`)

Lalu `composer run dev` akan menjalankan server Laravel + queue worker + log tail + Vite sekaligus.

### 3) Setup manual (opsional)
Jika ingin per langkah:

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Edit konfigurasi database di `.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`), lalu lanjutkan:

```bash
php artisan migrate
php artisan db:seed
npm install
composer run dev
```

Akun email / password  
Siswa : murid@example.com / password  
Guru : guru@example.com / password  

### 4) Akses aplikasi
- Buka `http://localhost:8000` di browser.

### 5) Menjalankan test
```bash
php artisan test --compact
```

