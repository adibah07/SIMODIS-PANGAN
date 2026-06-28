# SIMODIS-Pangan Terpadu

> **Sistem Monitoring Distribusi Pangan Terpadu Berbasis Website Untuk Wilayah Terpencil**
> Proyek UAS Manajemen Proyek Sistem Informasi - STT Terpadu Nurul Fikri (2026).

Aplikasi berbasis web untuk mempermudah Dinas Ketahanan Pangan Kabupaten dan petugas dalam mengelola, memantau, dan melaporkan penyaluran komoditas pangan (Beras, Gula, Minyak Goreng, Tepung) secara terpusat dan real-time.

---

## 🌟 Fitur Utama
1. **Dasbor Pemantauan (Dashboard)**: Statistik terpadu cakupan wilayah, gudang, titik distribusi, status logistik, bagan visual (Chart.js), dan notifikasi cerdas jika stok gudang menipis.
2. **Kelola Data Wilayah (CRUD)**: Pendataan wilayah jangkauan lengkap dengan titik koordinat GPS.
3. **Kelola Data Gudang (CRUD)**: Manajemen gudang penyimpanan logistik beserta penyesuaian stok komoditas pangan secara real-time.
4. **Kelola Titik Distribusi (CRUD)**: Manajemen titik sasaran penyaluran pangan di daerah terpencil.
5. **Penyaluran Pangan (CRUD)**: Registrasi riwayat pengiriman logistik pangan dengan validasi ketersediaan stok di gudang asal.
6. **Laporan & Cetak**: Filter data logistik berdasarkan rentang tanggal, status, gudang asal, dan ekspor instan dengan layout resmi untuk dicetak.
7. **Pengaturan Akun & Sistem**: Pengubahan data profil admin, pengaturan instansi, dan fitur setel ulang basis data (Reset Database).

---

## 🛠️ Spesifikasi Teknologi
- **Antarmuka (UI/UX)**: HTML5, CSS3 (Vanilla Responsive Grid/Flexbox), Google Fonts (Poppins), Font Awesome Icon CDN.
- **Logika & Database**: Vanilla JavaScript (ES6+), Web Local Storage API (Client-Side Persistence).
- **Visualisasi Grafik**: Chart.js Library.
- *Bebas dari dependensi React, Vue, Angular, Laravel, PHP, Bootstrap, Tailwind, maupun JQuery.*

---

## 🚀 Cara Menjalankan
1. Ekstrak file `SIMODIS-PANGAN.zip`.
2. Klik ganda (atau buka via peramban web) file `index.html`.
3. Gunakan kredensial login bawaan:
   - **Username / Email**: `admin@simodis.id`
   - **Password**: `admin`
4. Selamat mengeksplorasi seluruh fitur web!

---

## 📁 Struktur Berkas Proyek
```text
SIMODIS-PANGAN/
├── index.html                  (Halaman Login Admin)
├── dashboard.html              (Dashboard Monitoring & Grafik)
├── wilayah.html                (Kelola Data Wilayah)
├── gudang.html                 (Kelola Data Gudang Penyimpanan)
├── titik-distribusi.html       (Kelola Titik Distribusi Penyaluran)
├── distribusi.html             (Catatan Logistik Penyaluran Pangan)
├── laporan.html                (Laporan Resmi & Cetak)
├── pengaturan.html             (Ubah Profil & Reset Database)
├── README.md                   (Panduan Informasi Proyek)
└── assets/
    ├── css/
    │   └── style.css           (Sistem Desain & Gaya Layout Global)
    └── js/
        ├── app.js              (Validasi Sesi Auth, DB local, Injeksi Template, Toast, Dialog)
        ├── dashboard.js        (Logika Metrik Dasbor & Visualisasi Chart.js)
        ├── wilayah.js          (Pengendali CRUD Wilayah & Proteksi Penghapusan)
        ├── gudang.js           (Pengendali CRUD Gudang & Proteksi Penghapusan)
        ├── titik-distribusi.js (Pengendali CRUD Titik Penyaluran & Proteksi)
        ├── distribusi.js       (Pengendali CRUD Logistik & Validasi Pengurangan Stok)
        ├── laporan.js          (Penyaring Laporan, Cetak Format Print, & Penghitungan Total)
        └── pengaturan.js       (Ubah Akun, Update Instansi, & Reset Basis Data)
```

---

## 📋 Tim Proyek (Scrum Simulation)
* **Product Owner / Scrum Master**: Adibah Sholihah
* **Backend Developer**: Rahma Hervina
* **Frontend Developer**: Izzah Himmatul
* **Database Designer**: Zahra Zulyani
