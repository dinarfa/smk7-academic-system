# Sistem Akademik SMK Negeri 7

Sistem manajemen akademik berbasis web untuk SMK Negeri 7. Meliputi absensi QR Code, ujian online, dan rekapitulasi kehadiran otomatis.

## Fitur

### Absensi
- **QR Code** — Guru membuka sesi, siswa scan kartu QR untuk absen
- **Manual** — Guru input kehadiran siswa langsung (dengan jadwal otomatis)
- **Export** — Unduh laporan kehadiran dalam format Excel (.xlsx) atau CSV

### Ujian Online
- Bank soal dengan tipe pilihan ganda, esai, dan true/false
- Ujian real-time dengan timer dan auto-submit
- Koreksi otomatis untuk pilihan ganda

### Manajemen
- **Pengguna** — Admin, guru, siswa dengan role-based access
- **Kelas** — Kelas dengan wali kelas dan siswa
- **Mata Pelajaran** — Multi-guru per mapel per kelas (pivot table)
- **Jadwal** — Jadwal pelajaran harian per kelas
- **Audit Log** — Lacak aksi admin

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, PHP 8.3+ |
| Frontend | React 19, Inertia.js v3, TypeScript |
| CSS | Tailwind CSS v4, shadcn/ui |
| Database | MySQL |
| Testing | Pest v4 |
| Auth | Laravel Sanctum (API) |

## Instalasi

### Prasyarat
- PHP 8.3+
- Composer
- Node.js 18+
- MySQL

### Setup Cepat

```bash
git clone <repo-url>
cd smk7-academic-system
composer setup
composer run dev
```

Buka `http://localhost:8000` di browser.

### Setup Manual

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` — sesuaikan `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

```bash
php artisan migrate
php artisan db:seed
npm install
npm run build
composer run dev
```

### Akun Default

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Guru | guru0@example.com s/d guru9@example.com | password |
| Siswa | murid@example.com | password |

## Perintah

```bash
# Development
composer run dev              # Laravel + queue + logs + Vite

# Build
npm run build                 # Production build

# Lint & Format
composer lint                 # PHP Pint
npm run lint                  # ESLint fix
npm run format                # Prettier

# Test
php artisan test --compact    # Semua test
php artisan test --filter=X   # Test spesifik

# Database
php artisan migrate           # Jalankan migrasi
php artisan db:seed           # Seed data
php artisan db:wipe --force && php artisan migrate --force  # Reset DB

# Routes
php artisan wayfinder:generate  # Regenerate TS route types
```

## Struktur Proyek

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/          # Dashboard, users, classes, subjects, schedules, reports
│   │   ├── Teacher/        # Attendance, exams, questions, students
│   │   └── Student/        # Scan QR, exams, excuses
│   ├── Requests/           # Form validation
│   └── Middleware/          # Role-based access control
├── Models/                  # Eloquent models
├── Services/                # Business logic
└── Enums/                   # PHP enums

resources/js/
├── pages/
│   ├── admin/              # Admin pages
│   ├── teacher/            # Teacher pages
│   └── student/            # Student pages
├── components/
│   └── ui/                 # shadcn/ui components
├── routes/                 # Wayfinder generated routes
└── layouts/                # App layouts

database/
├── migrations/             # Database schema
├── seeders/                # Sample data
└── factories/              # Test factories
```

## Konsep Kunci

### Multi-Teacher per Mata Pelajaran

Satu mata pelajaran bisa diajar oleh guru berbeda di kelas berbeda melalui pivot table `class_subjects`:

```
subjects: "Matematika"
class_subjects:
  ├── Kelas X IPA 1 → Guru A
  ├── Kelas X IPA 2 → Guru B
  └── Kelas X IPS 1 → Guru A
```

Teacher assignment ada di pivot `class_subjects.teacher_id`, bukan di `subjects` table.

### Jadwal & Absensi

Sistem absensi terintegrasi dengan jadwal:
- `SubjectSchedule` menentukan slot waktu (pagi/mapel/pulang)
- Guru hanya bisa buka absensi saat jadwal aktif
- Tipe sesi otomatis dari jadwal (morning/subject/dismissal)

### Wayfinder Routes

Route types di-generate otomatis dari Laravel routes:

```tsx
import admin from '@/routes/admin'
import teacher from '@/routes/teacher'

// URL generation
admin.subjects.edit.url({ subject: 1 })
teacher.attendance.manual.url()

// Form submission
router.post(teacher.attendance.manual.url(), { data })
```

Setelah ubah routes/controllers: `php artisan wayfinder:generate`

## Testing

```bash
php artisan test --compact
```

Test menggunakan Pest v4 dengan SQLite in-memory database. Factories di `database/factories/`, seeders di `database/seeders/`.

## Kontribusi

1. Buat branch dari `main`
2. Commit dengan pesan yang jelas
3. Push dan buat Pull Request
4. Pastikan semua test pass sebelum merge
