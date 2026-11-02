# Digital Wedding Invitation — Fina & Huda

Website undangan responsif bertema adat Jawa klasik (ivory, cokelat, gold). Berkas ini disiapkan untuk dipublikasikan gratis menggunakan Cloudflare Pages + Supabase.

## Fitur yang tersedia
- Halaman pembuka dan undangan lengkap sesuai data yang diberikan.
- Link personal tamu: `https://alamat-website-anda/?to=Nama%20Tamu`.
- Dashboard admin: `/admin.html` dengan login email/password Supabase.
- Tambah, cari, hapus, ekspor CSV daftar tamu; salin link personal dan buat pesan WhatsApp.
- RSVP: nama, telepon, status hadir/tidak hadir, jumlah tamu.
- Ucapan/doa dengan moderasi setujui/sembunyikan/hapus.
- Tombol Google Maps, salin nomor rekening/DANA, countdown, kontrol musik.

## 1. Buat database gratis di Supabase
1. Buka https://supabase.com/ lalu buat akun dan **New project**.
2. Pilih region terdekat yang tersedia, simpan password database dengan aman.
3. Buka **SQL Editor**, tempel seluruh isi `supabase.sql`, lalu Run.
4. Buka **Project Settings → API** (atau API Keys). Salin Project URL dan `anon` / publishable key.
5. Buka `config.js`, ganti `YOUR-PROJECT` dengan URL project dan `YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY` dengan anon/publishable key.
6. Di Supabase **Authentication → Users**, tambahkan user admin dengan email dan password Anda.
7. Di **Authentication → Settings / Sign In**, nonaktifkan **Allow new users to sign up** (pendaftaran publik). Dashboard admin hanya untuk akun yang Anda buat. Jika fitur pendaftaran tetap aktif, kebijakan `authenticated` di SQL ini memungkinkan akun yang berhasil mendaftar mengakses data admin.
8. Pastikan tabel `guests`, `rsvps`, `wishes` terlihat di Table Editor.

> Penting: hanya gunakan anon/publishable key pada `config.js`. Jangan pernah menaruh `service_role` / secret key di website atau membagikannya.

## 2. Publikasikan gratis dengan Cloudflare Pages
1. Buat akun https://github.com/ dan repository baru, misalnya `fina-huda-wedding`.
2. Upload seluruh isi folder proyek ini ke root repository (bukan folder pembungkusnya).
3. Buat akun https://pages.cloudflare.com/ lalu pilih **Create a project → Connect to Git**.
4. Pilih repository tadi. Framework preset: **None**. Build command: kosongkan. Build output directory: `/` (atau `.` sesuai tampilan dashboard). Deploy.
5. Cloudflare akan memberikan alamat `https://....pages.dev`. Ini menjadi domain publik undangan.
6. Coba buka alamat tersebut dan `/admin.html`. Login memakai user admin Supabase.

## 3. Dua jenis link
Misalnya domain Cloudflare Anda `https://fina-huda.pages.dev`:
- Link undangan umum: `https://fina-huda.pages.dev/`
- Link personal: `https://fina-huda.pages.dev/?to=Nama%20Tamu`
- Link dashboard admin: `https://fina-huda.pages.dev/admin.html`

Di dashboard, masukkan nama dan nomor WhatsApp tamu. Tombol **WhatsApp** menyiapkan pesan beserta link personal. Link tersebut dapat dikirim ke WhatsApp tamu.

## 4. Musik latar “Akad” — Payung Teduh
Browser HP umumnya memblokir autoplay. Musik baru dapat diputar setelah pengunjung menekan **Buka Undangan** atau **Putar Musik**. Untuk menghormati hak cipta, file lagu tidak disertakan di paket ini. Jika Anda memiliki file audio yang penggunaannya sah, simpan salinan MP3 bernama `akad.mp3` ke folder `assets/`. Kontrol musik sudah disiapkan. Jangan mengunggah atau mendistribusikan rekaman tanpa izin/lisensi yang diperlukan.

## 5. Uji sebelum dibagikan
- Buat satu tamu uji di dashboard dan buka link personalnya.
- Kirim RSVP uji dan pastikan tampil di dashboard.
- Kirim ucapan uji, setujui di dashboard, dan cek tampil di undangan.
- Tes tombol Maps, salin rekening, dan WhatsApp dari HP.
- Bagikan link hanya setelah semua tes berhasil.

## Catatan kapasitas & privasi
Daftar tamu tidak dibatasi oleh kode aplikasi (jumlah aktual mengikuti kuota gratis dan batas layanan Supabase). Link tamu memakai parameter nama yang dapat diteruskan; siapa pun yang memiliki link dapat membukanya. Jangan memasukkan informasi sensitif dalam nama tamu. RSVP dapat berisi nomor telepon, jadi batasi akses dashboard dan lindungi akun admin dengan password kuat. Untuk produksi, tinjau kebijakan retensi dan privasi data sesuai kebutuhan.

## Struktur folder
- `index.html`, `styles.css`, `app.js`: undangan publik.
- `admin.html`, `admin.js`: dashboard pengelola.
- `config.js`: konfigurasi publik Supabase (isi sendiri).
- `supabase.sql`: skema tabel dan kebijakan akses.
- `assets/akad.mp3`: tempat menaruh audio berlisensi milik Anda (tidak disertakan).
