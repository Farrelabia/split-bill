# Stack dan panduan menjalankan Split Bill

Split Bill memakai Express untuk API dan MongoDB untuk menyimpan tagihan. Next.js sudah disiapkan sebagai proyek frontend terpisah. Saat ini frontend menampilkan halaman awal polos dan alur host serta peserta masih menunggu desain.

## Stack

| Bagian | Teknologi | Fungsi |
|---|---|---|
| Runtime | Node.js 22+ dan npm | Menjalankan backend dan frontend. |
| Backend | JavaScript CommonJS dan Express 5 | Menyediakan REST API CRUD tagihan di port `3000`. |
| Database | MongoDB Community Server lokal dan driver resmi `mongodb` v6 | Menyimpan dokumen di database `split_bill`, collection `bills`. MongoDB lokal memakai port `27017`. |
| Frontend | Next.js 16.3.5, App Router, React dan React DOM 19.2.8 | Menyiapkan aplikasi web di port `3001`. |
| Pengujian | `node:test`, Postman, dan `curl.exe` | Menjalankan tes otomatis backend dan mencoba endpoint secara manual. |

Versi dependensi yang dipakai saat instalasi dikunci di `package-lock.json` dan `frontend/package-lock.json`.

## Struktur proyek

| Lokasi | Isi |
|---|---|
| `index.js`, `app.js` | Startup Express, konfigurasi aplikasi, dan respons error. |
| `config/database.js` | Koneksi MongoDB dan pembuatan indeks unik `shareCode`. |
| `routes/bills.js`, `controllers/bills.js` | Rute CRUD, pemeriksaan kode admin, dan respons API. |
| `models/bill.js` | Validasi data, pembagian rata, dan pembuatan kode akses. |
| `test/bills.test.js` | Tes logika pembagian, validasi, dan CRUD controller dengan penyimpanan tiruan. |
| `frontend/app/` | Root layout dan halaman awal Next.js. |

## Menjalankan backend di Windows

Jalankan perintah dari PowerShell. Cek status MongoDB Community Server lebih dahulu.

```powershell
Get-Service MongoDB
```

Kalau statusnya `Stopped`, jalankan `Start-Service MongoDB` dari PowerShell **Run as administrator**. Setelah statusnya `Running`, buka terminal proyek.

```powershell
Set-Location "C:\Users\farre\Documents\Abia\Semester3\finalProject"
npm.cmd ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm.cmd start
```

Jalankan `npm.cmd ci` saat pertama menyiapkan proyek atau ketika lockfile berubah. Konfigurasi lokal di `.env.example` adalah sebagai berikut.

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=split_bill
PORT=3000
```

Log `Split Bill berjalan di http://localhost:3000` muncul setelah koneksi database berhasil. Biarkan terminal backend terbuka selama menguji API. Kalau npm menampilkan `ENOENT` dan mencari `C:\Windows\System32\package.json`, kembali ke folder proyek dengan `Set-Location` di atas.

## Menjalankan frontend

Langkah ini opsional untuk pengujian API. Dari folder proyek, jalankan di terminal terpisah.

```powershell
npm.cmd --prefix frontend ci
npm.cmd --prefix frontend run dev
```

Buka `http://localhost:3001` untuk melihat halaman awal. Untuk memeriksa build produksi, jalankan `npm.cmd --prefix frontend run build`. Untuk menyajikan hasil build, jalankan `npm.cmd --prefix frontend start` ketika dev server sudah dihentikan.

## Menguji API

Base URL backend adalah `http://localhost:3000`.

| Method | Path | Input | Status sukses |
|---|---|---|---|
| POST | `/api/bills` | Body JSON | `201` |
| GET | `/api/bills/:shareCode` | Kode berbagi di URL | `200` |
| PUT | `/api/bills/:shareCode` | Header `x-admin-code` dan body JSON lengkap | `200` |
| DELETE | `/api/bills/:shareCode` | Header `x-admin-code`, body kosong | `200` |

Di Postman, pilih **Body → raw → JSON** untuk POST dan PUT. Contoh body ada di [README.md](README.md#api). Salin `shareCode` dari respons POST ke URL GET, PUT, atau DELETE. Untuk PUT dan DELETE, masukkan kode admin dari respons POST **tagihan yang sama** ke tab **Headers**.

Kode berbagi terdiri dari 8 karakter. Kode admin terdiri dari 16 karakter, hanya dikembalikan saat pembuatan, dan disimpan sebagai hash SHA-256. Server membagi total dalam rupiah bulat, lalu memberikan seluruh sisa ke peserta pertama. Contoh Rp100.000 untuk tiga peserta menghasilkan Rp33.334, Rp33.333, dan Rp33.333.

| Status | Arti |
|---|---|
| `400` | Data tagihan tidak valid. Periksa body JSON dan `Content-Type: application/json`. |
| `401` | Kode admin kosong atau salah. Periksa tab **Headers** dan cocokkan kode dengan respons POST. |
| `404` | Tagihan atau endpoint tidak ditemukan. GET membutuhkan `shareCode` di URL. |
| `500` | Server mengalami error internal. Periksa terminal backend. |

Untuk cek persistensi, buat tagihan, restart backend, lalu ulangi GET dengan kode yang sama. Jalankan DELETE terakhir jika tagihan contoh masih dibutuhkan untuk pengujian. Tes otomatis bisa dijalankan dengan `npm.cmd test` dari folder proyek.

## Status pengembangan

CRUD, dua kode akses, dan pembagian rata sudah diuji dengan MongoDB lokal. Frontend sudah bisa dibangun. Tahap MVP yang masih tersisa adalah menghubungkan alur buat dan buka tagihan ke API, lalu mencoba demo dari dua browser. Urutan fitur setelah MVP ada di [PRD.md](PRD.md).
