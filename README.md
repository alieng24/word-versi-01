# Lembar — Panduan membuat installer Mac & Windows

Proyek ini memakai perangkat sumber terbuka yang gratis:
**Electron** (kerangka aplikasi), **electron-builder** (pembuat installer),
dan **GitHub Actions** (komputer awan gratis untuk membangun installer).

Hasil akhirnya:

| Sistem | File | Untuk |
|---|---|---|
| Mac dengan chip Apple (M1–M4) | `Lembar-1.0.0-mac-arm64.dmg` | MacBook/iMac keluaran 2020 ke atas |
| Mac dengan prosesor Intel | `Lembar-1.0.0-mac-x64.dmg` | Mac lama |
| Windows 10/11 | `Lembar-Setup-1.0.0.exe` | PC Windows 64-bit |

Belum yakin jenis Mac Anda? Klik menu Apple → **About This Mac**. Jika tertulis
"Chip Apple M…", pakai yang **arm64**; jika "Processor Intel…", pakai yang **x64**.

---

## Bagian A — Membangun installer lewat GitHub (tanpa memasang apa pun)

Waktu: sekitar 15 menit untuk pertama kali.

### 1. Buat akun dan repositori GitHub
1. Daftar gratis di <https://github.com/signup> (lewati jika sudah punya akun).
2. Klik **+** di kanan atas → **New repository**.
3. Isi **Repository name**: `lembar`.
4. Pilih **Public**. Repositori publik mendapat menit pembangunan GitHub Actions
   tanpa batas secara gratis. (Repositori privat juga bisa, tetapi kuota gratisnya
   terbatas dan pembangunan di Mac menghabiskan kuota 10× lebih cepat.)
5. Klik **Create repository**.

### 2. Unggah file proyek
1. Ekstrak `lembar-desktop.zip` di komputer Anda.
2. Di halaman repositori baru, klik tautan **uploading an existing file**.
3. Buka folder `lembar-desktop` hasil ekstrak, pilih **semua isinya**
   (bukan foldernya), lalu seret ke halaman GitHub.

   > **Penting di Mac:** folder `.github` tersembunyi di Finder.
   > Tekan **Cmd + Shift + .** (titik) di Finder agar folder itu terlihat,
   > lalu ikut seret bersama file lainnya.
   > Di Windows, folder ini biasanya sudah terlihat.

4. Pastikan daftar unggahan memuat: `.github/workflows/build.yml`, `app/index.html`,
   `build/icon.png`, `build/adhoc-sign.js`, `main.js`, `preload.js`, `package.json`.
5. Klik **Commit changes**.

### 3. Tunggu proses pembangunan
1. Buka tab **Actions** di repositori.
2. Anda akan melihat proses **"Bangun installer Lembar"** berjalan (ikon kuning).
3. Tunggu sekitar 5–10 menit sampai ikonnya berubah hijau ✓.

### 4. Unduh installer
1. Klik proses yang sudah hijau.
2. Gulir ke bawah ke bagian **Artifacts**.
3. Unduh **Lembar-Mac** dan/atau **Lembar-Windows**.
   Keduanya berupa file .zip — ekstrak untuk mendapatkan .dmg atau .exe.

> **Opsional — halaman unduhan rapi:** buka **Releases** → **Draft a new release**
> → di "Choose a tag" ketik `v1.0.0` → **Create new tag** → **Publish release**.
> Beberapa menit kemudian file .dmg dan .exe otomatis muncul di halaman rilis itu,
> sehingga bisa dibagikan ke orang lain lewat satu tautan.

---

## Bagian B — Memasang Lembar

### Di Mac
1. Klik dua kali file `.dmg`, lalu seret ikon **Lembar** ke folder **Applications**.
2. Buka Lembar dari Applications. Pertama kali, macOS akan menolak karena aplikasi
   tidak ditandatangani pengembang berbayar. Cara membukanya:
   - Buka **System Settings → Privacy & Security**.
   - Gulir ke bawah; ada pesan *"Lembar was blocked…"*. Klik **Open Anyway**,
     lalu masukkan kata sandi Mac Anda.
   - Pada macOS versi lama: klik kanan Lembar → **Open** → **Open**.
3. Setelah itu, Lembar terbuka normal seperti aplikasi lain.

Jika muncul pesan **"Lembar is damaged and can't be opened"**, buka aplikasi
**Terminal**, tempel perintah berikut, lalu tekan Enter:

```
xattr -cr /Applications/Lembar.app
```

Setelah itu buka Lembar lagi.

### Di Windows
1. Klik dua kali `Lembar-Setup-1.0.0.exe`.
2. Jika muncul layar biru **"Windows protected your PC"**, klik **More info**
   → **Run anyway**.
3. Ikuti langkah pemasangan. Pintasan Lembar akan dibuat di Desktop dan Start Menu.

---

## Fitur versi desktop

- **Simpan (Ctrl/Cmd + S)** langsung ke file yang sedang dibuka, seperti Word.
  **Simpan sebagai (Ctrl/Cmd + Shift + S)** memilih nama dan folder baru.
- **Buka (Ctrl/Cmd + O)** file .docx, .html, .txt, dan .md. Bisa juga dengan
  menyeret file ke jendela Lembar, atau klik kanan file → **Open With / Buka dengan** → Lembar.
- **Ekspor PDF (Ctrl/Cmd + Shift + E)** dan **Cetak (Ctrl/Cmd + P)**.
- Seluruh fitur, termasuk .docx dan semua jenis huruf, berjalan **tanpa internet**.
- Draf tersimpan otomatis; jika aplikasi tertutup sebelum disimpan,
  isi terakhir muncul lagi saat dibuka kembali.

## Memperbarui aplikasi

Ubah file di repositori (misalnya naikkan `"version"` di `package.json`), lalu
commit. GitHub otomatis membangun installer baru di tab **Actions**.

## Bagian C — (Opsional) Membangun di komputer sendiri

Butuh Node.js 20 atau lebih baru dari <https://nodejs.org>. Buka Terminal /
Command Prompt di folder proyek, lalu jalankan:

```
npm install
npm start            # mencoba aplikasi tanpa membuat installer
npm run dist:mac     # membuat .dmg (hanya dari Mac)
npm run dist:win     # membuat .exe (paling mudah dari Windows)
```

Hasilnya ada di folder `dist`.

## Lisensi

Lembar memakai lisensi MIT. Komponen yang dipakai juga sumber terbuka:
Electron & electron-builder (MIT), mammoth (BSD-2), html-docx-js (MIT),
dan huruf dari Fontsource (SIL Open Font License).
# word-versi-01
