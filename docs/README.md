# Split Bill

Backend Express untuk membuat dan membagikan tagihan tanpa akun. Data disimpan di collection `bills` pada MongoDB. Server membuat indeks unik untuk kode berbagi saat startup.

## Menjalankan backend

Butuh Node.js 22+ dan koneksi ke MongoDB Atlas atau MongoDB lokal. Di Windows PowerShell jalankan:

```powershell
npm.cmd install
Copy-Item .env.example .env
```

Isi `MONGODB_URI` dengan connection string Atlas yang memiliki akses tulis, atau gunakan alamat contoh jika MongoDB lokal aktif. `MONGODB_DB` dan `PORT` masing-masing default ke `split_bill` dan `3000`.

```powershell
npm.cmd start
npm.cmd test
```

## Menjalankan frontend

Jalankan dari folder proyek di terminal terpisah.

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Buka `http://localhost:3001` untuk membuat, membuka, dan mengelola tagihan. Jalankan backend Express di port `3000` agar frontend bisa mengakses API. Jika alamat backend berbeda, atur `BILL_API_ORIGIN` sebelum menjalankan dev server atau membuat build frontend.

## API

| Method | Endpoint | Akses | Berhasil |
|---|---|---|---|
| POST | `/api/bills` | Publik | `201`, tagihan dan `adminCode` |
| GET | `/api/bills/:shareCode` | Kode berbagi | `200`, tagihan |
| PUT | `/api/bills/:shareCode` | Header `x-admin-code` | `200`, tagihan yang diperbarui |
| DELETE | `/api/bills/:shareCode` | Header `x-admin-code` | `200`, pesan konfirmasi |

Kirim JSON dengan `Content-Type: application/json` untuk POST dan PUT. PUT mengganti seluruh data yang bisa diedit, dengan format yang sama seperti POST.

```json
{
  "title": "Makan siang",
  "receiptDetails": "3 nasi goreng dan pajak",
  "total": 100000,
  "payerId": "ayu",
  "splitType": "equal",
  "participants": [
    { "id": "ayu", "name": "Ayu" },
    { "id": "bima", "name": "Bima" },
    { "id": "citra", "name": "Citra" }
  ]
}
```

Client mengirim ID peserta yang unik dalam tagihan dan menggunakan ID yang sama untuk peserta yang dipertahankan saat edit. `receiptDetails` opsional dan `splitType` default ke `equal`. Respons menambahkan `amount` ke setiap peserta. Contoh di atas menghasilkan Rp33.334, Rp33.333, dan Rp33.333 sesuai urutan array. Client dapat mencocokkan `payerId` dengan ID peserta untuk menampilkan tujuan pembayaran atau label **Sudah ditalangi**.

`shareCode` berisi delapan karakter dan bisa dimasukkan dengan huruf besar atau kecil. Simpan `adminCode` yang berisi 16 karakter dari respons POST. Database hanya menyimpan hash kode admin.

Respons gagal berbentuk `{"error":"..."}`. Input tidak valid menghasilkan `400`, kode admin kosong atau salah pada tagihan yang ada menghasilkan `401`, tagihan yang tidak ditemukan menghasilkan `404`, dan kegagalan internal menghasilkan `500`.

## Uji di Postman

1. Buat POST ke `http://localhost:3000/api/bills` dengan body contoh. Simpan `shareCode` dan `adminCode`.
2. Buka GET menggunakan `shareCode`. Periksa total pembagian dan pastikan respons bebas dari kode dan hash admin.
3. Jalankan ulang server, lalu ulangi GET untuk memeriksa persistensi.
4. Kirim PUT dengan JSON lengkap dan ubah total ke `100001`. Periksa bahwa respons tanpa header admin atau dengan kode salah adalah `401`, lalu kirim kode admin asli dan periksa bagian pertama Rp33.335.
5. Kirim DELETE dengan kode admin. Ulangi GET dan periksa `404`.
6. Kirim POST dengan total `0` dan periksa `400`.

Untuk demo, buat tagihan di satu browser, lalu buka link atau masukkan kode berbagi di jendela privat. Lihat [PRD](PRD.md) untuk urutan fitur setelah MVP.
