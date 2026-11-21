# PRD — Split Bill

**Versi** 0.1 · Draft  
**Target pengumpulan** Sabtu, 21 November 2026, pukul 23.59 WIB

## Tujuan produk

Split Bill adalah aplikasi web untuk membagi tagihan tanpa akun. Host membuat tagihan, memasukkan nama peserta, dan membagikan kode. Peserta membuka tagihan lewat kode tersebut, memilih nama, lalu melihat berapa bagian mereka dan harus bayar ke siapa.

Demo minimum berhasil kalau host bisa membuat tagihan di satu browser dan temannya bisa membuka tagihan yang sama di browser lain, memilih nama, dan melihat nominal yang benar.

## Pengguna dan akses

| Peran | Cara masuk | Yang bisa dilakukan |
|---|---|---|
| Host | Membuat tagihan atau membuka tagihan dengan `adminCode` | Melihat, mengedit, menghapus, dan mencatat pembayaran jika fitur pembayaran sudah tersedia |
| Peserta | Memasukkan `shareCode` atau membuka link yang dibagikan | Melihat rincian tagihan dan memilih nama untuk menampilkan bagiannya |

Setiap tagihan punya dua kode. `shareCode` terdiri dari 8 karakter dan bisa dibagikan sebagai kode atau link. `adminCode` terdiri dari 16 karakter, ditampilkan saat tagihan dibuat, dan hanya hash-nya yang disimpan di database. Browser host bisa menyimpan kode admin untuk membuka kembali kontrol host. Kalau kode hilang, kode tersebut tidak bisa dipulihkan.

Pemilihan nama hanya mengubah tampilan. Siapa pun yang punya `shareCode` bisa memilih nama mana saja dan melihat bagiannya. Perubahan tagihan tetap membutuhkan `adminCode`, yang dikirim lewat header `x-admin-code`.

## Alur utama

### Host membuat tagihan

1. Di landing page, host memilih **Create split bill**.
2. Host mengisi judul, total tagihan dalam rupiah, dan rincian struk opsional. Untuk MVP, rincian bisa diisi sebagai teks, misalnya `3 nasi goreng, 3 es teh, dan pajak`.
3. Host menambahkan nama peserta. Setiap nama muncul sebagai card, dan jumlah orang mengikuti jumlah card. Host memilih siapa yang nalangin dari daftar tersebut.
4. Host memilih tipe pembagian yang tersedia. Pada MVP, pembagian rata langsung menampilkan estimasi di tiap card. Setelah meninjau hasilnya, host menekan **Buat tagihan**.
5. Server menyimpan tagihan dan menghitung bagian final. Halaman hasil menampilkan **Salin kode**, **Salin link**, dan instruksi untuk menyimpan kode admin.

### Peserta melihat bagiannya

1. Peserta memilih **Enter split bill code** atau langsung membuka link dari host.
2. Halaman tagihan menampilkan judul, total, nama yang nalangin, rincian struk jika diisi, dan card peserta.
3. Peserta memilih namanya. Bagian **Bagian kamu** menampilkan nominal dan tujuan pembayaran. Peserta bisa memilih **Ganti nama** kalau salah pilih.
4. Kalau peserta memilih nama orang yang nalangin, halaman menampilkan porsi orang tersebut dengan label **Sudah ditalangi**. Kalau pencatatan pembayaran sudah tersedia, peserta lain juga bisa melihat jumlah yang tercatat dan sisa yang perlu dibayar.

## Lingkup rilis

| Prioritas | Fitur | Hasil yang harus terlihat |
|---|---|---|
| **MVP** | CRUD tagihan dan dua kode | Host bisa membuat, mengedit, dan menghapus tagihan. Peserta bisa membuka tagihan lewat kode. |
| **MVP** | Pembagian rata dan card peserta | Setiap card menunjukkan bagian yang dihitung server. Jumlah semua bagian sama dengan total. |
| **MVP** | Alur buat dan buka tagihan | Alur host dan peserta berjalan dari dua browser. Rincian struk bisa diisi manual. |
| **Setelah MVP** | Pembagian custom | Host mengisi nominal per peserta. Form menunjukkan sisa alokasi dan server menolak pembagian yang jumlahnya berbeda dari total. |
| **Setelah MVP** | Riwayat pembayaran dan cicilan | Host bisa mencatat beberapa pembayaran per peserta. Server menghitung sisa, status peserta, dan status tagihan. |
| **Setelah MVP** | Instruksi transfer, bukti bayar, dan penutupan tagihan | Host mengisi detail rekening tujuan. Peserta bisa menandai sudah bayar dan mengirim foto bukti. Host bisa melihat bukti dan menutup tagihan kapan saja. |
| **Lanjutan** | OCR struk | Host mengunggah foto, meninjau dan mengoreksi hasil baca, lalu mengonfirmasi rincian sebelum membuat tagihan. |

Login, notifikasi, pembagian per item, dan daftar publik semua tagihan berada di luar lingkup rilis awal.

## Aturan bisnis

- Nominal disimpan sebagai bilangan bulat dalam rupiah. Total harus lebih dari nol dan tagihan harus punya minimal dua peserta. Orang yang nalangin termasuk dalam daftar peserta.
- Pembagian rata dibulatkan ke bawah. Seluruh sisa diberikan ke peserta pertama sesuai urutan saat tagihan dibuat. Contoh untuk Rp100.000 dan tiga orang adalah Rp33.334, Rp33.333, dan Rp33.333.
- Saat fitur pembayaran aktif, porsi orang yang nalangin langsung dianggap lunas. Untuk peserta lain, server menjumlahkan pembayaran yang tercatat. Nominal pembayaran harus lebih dari nol dan maksimal sebesar sisa tagihan peserta.
- Pada fitur riwayat pembayaran, tagihan berstatus `open` selama masih ada peserta dengan sisa pembayaran dan `settled` saat semuanya lunas. Setelah ada pembayaran, host masih bisa mengubah judul dan rincian, sementara total, peserta, orang yang nalangin, dan pembagian dikunci agar riwayat tetap sesuai.
- Detail rekening tujuan berisi nama bank, nomor rekening, dan nama pemilik rekening. Peserta dengan kode berbagi bisa melihat detail tersebut untuk transfer.
- Peserta dapat menandai **Sudah bayar** dan mengirim foto bukti. Status **Bukti dikirim** mencatat laporan peserta. Foto hanya bisa diakses dengan kode admin. Host bisa memeriksa foto dan menindaklanjuti di luar aplikasi. Pelaporan bukti belum menambah nominal ke riwayat pembayaran.
- Host dapat menutup tagihan kapan saja. Penutupan manual independen dari status pelunasan. Setelah tagihan ditutup, halaman peserta menampilkan **Tagihan sudah ditutup**, termasuk saat kode dimasukkan kembali, dan server menolak pengiriman bukti baru.

## API dan penyimpanan

| Method | Endpoint | Akses | Fase |
|---|---|---|---|
| `POST` | `/api/bills` | Publik | MVP |
| `GET` | `/api/bills/:shareCode` | Kode berbagi | MVP |
| `PUT` | `/api/bills/:shareCode` | Admin | MVP |
| `DELETE` | `/api/bills/:shareCode` | Admin | MVP |
| `POST` | `/api/bills/:shareCode/payments` | Admin | Setelah MVP |
| `GET` | `/api/bills/:shareCode/payments` | Kode berbagi | Setelah MVP |

Express menyimpan tagihan di collection `bills` pada MongoDB Atlas. Data inti mencakup judul, rincian opsional, total, ID peserta yang nalangin, tipe pembagian, peserta beserta nominalnya, `shareCode` unik, `adminCodeHash`, dan timestamps. Riwayat pembayaran dan status pelunasan ditambahkan saat fitur pembayaran dikerjakan. Respons yang bisa dibuka peserta tidak memuat kode admin maupun hash-nya.

Untuk fitur bukti bayar, API publik dapat mengembalikan detail rekening, status penutupan, dan status pengiriman bukti tanpa isi atau lokasi file bukti. Membuka foto dan menutup tagihan memerlukan kode admin. Status penutupan disimpan di server agar berlaku untuk semua browser.

## Kriteria penerimaan MVP

- Host bisa membuat tagihan, menerima kode berbagi, dan melihat pembagian yang jumlahnya tepat sama dengan total.
- Peserta di browser lain bisa masuk lewat kode, memilih nama, dan melihat bagian, tujuan pembayaran, serta rincian tagihan jika diisi.
- Kode berbagi yang tidak ditemukan memunculkan pesan yang jelas dan mengembalikan `404`. Input tagihan yang tidak valid mengembalikan `400`.
- Host bisa mengedit dan menghapus tagihan dengan kode admin yang valid. Kode admin kosong atau salah mengembalikan `401`.
- Tagihan tetap bisa dibuka setelah server dijalankan ulang karena datanya tersimpan di MongoDB.

## Selesai untuk dikumpulkan

- Backend Express memakai `config/`, `models/`, `controllers/`, `routes/`, dan `index.js` atau `app.js`, dengan `async/await` serta status HTTP `200`, `201`, `404`, dan `500` sesuai kasus.
- Empat endpoint CRUD sudah diuji di Postman. Repo GitHub publik memiliki README berisi cara menjalankan server dan client serta daftar endpoint.
- Slide memuat judul dan nama, arsitektur aplikasi, link GitHub, dan HTTP method yang digunakan. Slide diekspor sebagai `Nama_TemaProjek.pdf` dan dikumpulkan lewat Dignition sebelum deadline.
