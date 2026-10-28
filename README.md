# Website SMAN 2 Batang Anai

Website sekolah berbasis React, TypeScript, Vite, Express, dan SQLite. Tampilan memakai identitas biru navy, putih, dan aksen emas.

## Fitur
- Beranda, profil, visi-misi, statistik sekolah, guru/tendik, berita dan pengumuman.
- Galeri foto dan pusat unduhan dokumen.
- Dashboard admin untuk pengelolaan guru, artikel, statistik, pengaturan sekolah, galeri, dan dokumen.
- Database SQLite (`school.db`) serta unggahan pada folder `uploads/`.

## Persyaratan
- Node.js 20 atau versi LTS yang kompatibel.
- npm.

## Menjalankan lokal
1. Ekstrak ZIP dan buka terminal pada folder proyek.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env` dan atur `ADMIN_USERNAME` serta `ADMIN_PASSWORD` dengan kata sandi kuat.
4. Jalankan `npm run dev`.
5. Buka `http://localhost:3000`.

Admin awal menggunakan nilai dari `.env`. Jika `.env` tidak disiapkan, pengembangan lokal memakai username `admin` dan password `GantiPasswordIni123!`. Ubah kredensial sebelum digunakan publik.

## Build produksi
Jalankan `npm run build`, lalu set `NODE_ENV=production` dan jalankan `npm run dev` untuk melayani hasil build. Pastikan folder `school.db` dan `uploads/` berada pada penyimpanan persisten.

## Catatan keamanan dan publikasi
- Website ini adalah titik awal pengembangan; lakukan audit keamanan sebelum dipublikasikan. Login awal menggunakan penyimpanan password sederhana dan belum setara sistem autentikasi produksi. Tambahkan hashing password, sesi server yang aman, pembatasan percobaan login, dan otorisasi seluruh endpoint tulis sebelum penggunaan publik.
- Endpoint upload perlu pembatasan ukuran/jenis file dan autentikasi server sebelum dipublikasikan.
- Data siswa individual tidak ditampilkan secara publik. Gunakan statistik agregat saja dan hindari mempublikasikan data pribadi siswa.
- Nama, alamat, visi-misi, kontak, foto, berita, dan dokumen harus diverifikasi sekolah. Foto galeri bawaan adalah contoh visual, bukan dokumentasi resmi sekolah.
