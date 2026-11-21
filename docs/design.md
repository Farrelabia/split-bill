# Desain Frontend MVP Split Bill

Dokumen ini merinci tampilan dan alur frontend untuk demo KSM. [PRD.md](PRD.md) memuat aturan produk dan urutan rilis. [STACK.md](STACK.md) memuat cara menjalankan proyek.

## Tujuan dan ruang lingkup

Host dapat membuat tagihan pembagian rata dan membagikannya tanpa akun. Peserta bisa membuka tagihan di browser lain dan segera mengetahui berapa yang harus dibayar dan kepada siapa. Host juga bisa kembali untuk mengedit atau menghapus tagihan.

Demo memprioritaskan browser laptop. Pembagian custom, riwayat pembayaran dan cicilan, instruksi transfer dan bukti bayar, penutupan tagihan, OCR struk, serta desain khusus HP berada di luar lingkup demo MVP.

| Pengguna | Kebutuhan |
|---|---|
| Host | Mengisi tagihan, meninjau estimasi, membagikan link atau kode, serta mengelola tagihan dengan kode admin. |
| Peserta | Membuka tagihan lewat link atau kode, memilih nama, dan melihat nominal serta tujuan pembayaran. |

## Halaman awal

Halaman awal menampilkan nama **Split Bill**, maskot struk pixel, dan dua aksi utama. **Buat tagihan** membuka form host. **Buka dengan kode** menampilkan input kode berbagi dan tombol **Buka tagihan**. Peserta yang sudah punya link langsung masuk ke halaman tagihan.

Kode berbagi bisa diketik dengan huruf besar atau kecil. Input yang kosong atau formatnya salah mendapat pesan di dekat kolom. Jika formatnya valid tetapi tagihannya tidak ada, tampilkan **Tagihan tidak ditemukan** dan biarkan peserta mencoba lagi.

## Buat dan edit tagihan

Gunakan satu halaman dua kolom pada laptop. Alur bertahap sempat dipertimbangkan untuk mengurangi kepadatan form, tetapi dua kolom dipilih supaya host bisa melihat dampak setiap perubahan tanpa berpindah langkah.

| Kolom kiri | Kolom kanan |
|---|---|
| Judul, total rupiah, dan rincian struk opsional. | Ringkasan total dan jumlah peserta. |
| Kartu nama peserta, aksi tambah dan hapus peserta, serta pilihan siapa yang nalangin. | Pratinjau nominal per peserta dan penanda orang yang nalangin. |

- Mulai dengan dua kartu peserta kosong. Jumlah orang mengikuti kartu yang tersedia. Pilihan orang yang nalangin diambil dari peserta di form. Jika peserta terpilih dihapus, minta host memilih lagi.
- Untuk menghitung estimasi, bagi total dengan jumlah peserta, bulatkan ke bawah, dan tambahkan seluruh sisa ke peserta pertama. Misalnya Rp100.000 untuk tiga orang menghasilkan Rp33.334, Rp33.333, dan Rp33.333.
- Validasi judul, total rupiah positif dalam bilangan bulat, minimal dua peserta bernama, dan orang yang nalangin. Tampilkan pesan dekat kolom terkait dan pertahankan isian saat penyimpanan gagal.
- Saat host menekan **Buat tagihan** atau **Simpan perubahan**, tampilkan status proses dan cegah pengiriman ganda. Setelah sukses, pakai nominal final dari respons server.
- Form edit memakai susunan yang sama dengan isian tagihan sebelumnya. Simpan perubahan dengan kode admin dan pertahankan ID peserta yang masih ada.

## Bagikan dan kelola tagihan

Setelah tagihan berhasil dibuat, tampilkan ringkasan final serta tombol **Salin link** dan **Salin kode berbagi**. Beri umpan balik teks setelah clipboard berhasil disalin. Jika clipboard gagal, tampilkan link atau kode dalam bentuk yang bisa disalin manual.

Kode admin tampil dalam panel host yang terpisah dengan tombol **Salin kode admin**. Host dapat memilih **Ingat di browser ini**. Jika dipilih, simpan kode admin berdasarkan kode berbagi di `localStorage` agar tersedia setelah tab ditutup. Sediakan **Lupakan kode di browser ini** untuk menghapus kode tersimpan pada perangkat bersama.

Saat membuka ulang tagihan, host bisa memakai kode yang tersimpan atau memasukkan kode secara manual melalui **Kelola tagihan**. Kode hanya dikirim ke backend melalui header `x-admin-code` saat menyimpan edit atau menghapus. Express memeriksa kode saat aksi dikirim. Jika ditolak, minta host memasukkan ulang kode dan pertahankan perubahan yang sedang diisi. Link berbagi hanya memuat kode berbagi.

Aksi **Hapus tagihan** membuka dialog yang menyebut judul tagihan. Host mengisi kode admin di dialog setiap kali ingin menghapus, termasuk jika kodenya sudah tersimpan di browser. Setelah server mengonfirmasi penghapusan, lupakan kode admin tagihan itu dan kembali ke halaman awal dengan pesan keberhasilan.

## Lihat bagian peserta

Halaman menampilkan judul, total, nama orang yang nalangin, dan rincian struk bila diisi. Di laptop, kartu peserta berada di kiri dan panel **Bagian kamu** berada di kanan.

1. Saat halaman terbuka, panel menampilkan **Pilih namamu untuk melihat bagianmu**.
2. Peserta memilih kartu. Kartu aktif ditandai dengan perubahan visual dan status pilihan yang bisa dibaca teknologi bantu.
3. Panel langsung menampilkan nominal dari server serta tujuan pembayaran, misalnya **Rp33.333 · Bayar ke Ayu**. Jika nama yang dipilih adalah orang yang nalangin, tampilkan porsinya dengan label **Sudah ditalangi**.
4. Peserta bisa langsung memilih kartu lain. Pilihan hanya mengubah tampilan di browser dan tidak mengubah data tagihan.

Hasil tetap muncul di halaman yang sama supaya peserta bisa mengganti pilihan sambil melihat ringkasan tagihan. Halaman hasil terpisah bisa dipertimbangkan kembali jika nanti ada alur pembayaran dengan langkah tambahan.

## Arah visual

Gunakan **neo-brutalism dengan aksen pixel**. Panel pastel, garis hitam tebal, bayangan tegas, dan judul besar membentuk tampilan utama. Gunakan warna aksen untuk aksi penting, kartu terpilih, dan penanda orang yang nalangin. Label teks atau ikon ikut memperjelas perbedaan status.

Maskot **struk pixel** tampil di halaman awal dan bisa muncul sebentar sebagai umpan balik setelah kode atau link berhasil disalin. Tombol utama memadukan ikon pixel dengan bentuk panel neo-brutalist. Nama, kolom input, label tombol, dan nominal rupiah memakai huruf yang jelas dibaca. Gunakan format rupiah Indonesia, misalnya **Rp33.333**.

### Palet warna

Palet terang ini dipilih setelah ditinjau di mockup laptop. Krem memberi ruang bagi form dan informasi tagihan, sementara lavender dan lime menandai aksi utama serta pilihan aktif. Detail tata letak dan komponen bisa disesuaikan saat frontend mulai dikerjakan.

| Peran | Warna | OKLCH | Pemakaian |
|---|---|---|---|
| Latar halaman | Krem `#FFF6E5` | `97.6% 0.024 83.4` | Latar seluruh halaman. |
| Permukaan | Gading `#FFFBF3` | `98.9% 0.011 84.6` | Form, input, dan kartu peserta sebelum dipilih. |
| Teks dan garis | Ungu gelap `#231B2E` | `24.1% 0.037 303.1` | Teks utama, garis, bayangan, dan fokus keyboard. |
| Teks sekunder | Ungu abu-abu `#574B62` | `43.4% 0.040 308.4` | Petunjuk dan informasi tambahan pada permukaan terang. |
| Aksi utama | Lavender `#D8C3FA` | `85.3% 0.078 302.2` | Tombol **Buat tagihan**, **Simpan perubahan**, dan **Salin link** sesuai halaman. |
| Pilihan dan sukses | Lime `#E0F39E` | `93.1% 0.110 118.8` | Kartu terpilih, panel **Bagian kamu** setelah pemilihan, dan umpan balik salin. |
| Aksi hapus | Merah muda `#FFC7D1` | `88.2% 0.065 6.5` | Latar tombol konfirmasi hapus. |
| Pesan error | Merah anggur `#8A2641` | `43.3% 0.135 8.8` | Teks error dan garis input yang gagal validasi. |
| Aksi nonaktif | Lilac pucat `#E8DEEE` | `91.3% 0.024 313.1` | Latar tombol nonaktif dengan teks sekunder. |

Gunakan warna teks utama di atas lavender dan lime. Kedua kombinasi memberi rasio kontras masing-masing 10,34:1 dan 13,79:1. Tambahkan tanda centang dan status pilihan pada kartu aktif, serta teks **Tersalin** pada umpan balik clipboard.

### Tipografi

| Elemen | Font | Ukuran / tinggi baris | Bobot |
|---|---|---|---|
| Judul halaman awal | Bricolage Grotesque | 56 / 60 px | 800 |
| Judul halaman dalam | Bricolage Grotesque | 36 / 40 px | 800 |
| Judul panel | Bricolage Grotesque | 24 / 28 px | 700 |
| Total tagihan dan nominal di panel **Bagian kamu** | DM Sans | 40 / 44 px | 700 |
| Teks, input, dan tombol | DM Sans | 16 / 24 px | 400–700 |
| Petunjuk dan validasi | DM Sans | 14 / 20 px | 400–600 |
| Kode berbagi dan kode admin | Monospace sistem | 16 / 24 px | 600 |

Gunakan angka dengan lebar seragam untuk nominal agar daftar pembagian mudah dibandingkan. Bentuk pixel dipakai pada ikon dan maskot. Label tombol tetap memakai DM Sans.

### Layout dan komponen laptop

- Gunakan lebar konten maksimum **1.120 px**, margin tepi minimal **24 px**, dan jarak **32 px** antarkolom. Pada form, kolom kiri sedikit lebih lebar dari pratinjau. Di bawah **900 px**, susun kolom secara vertikal agar tetap bisa dipakai saat jendela laptop dipersempit.
- Gunakan jarak **8 px** antara label dan input, **16 px** antarbaris form, dan **24 px** antarbagian. Panel utama memakai padding **24–32 px**.
- Panel utama memakai garis **2 px**, sudut **16 px**, dan bayangan tegas **4 px ke kanan dan 4 px ke bawah**. Input dan tombol memakai garis **2 px**, sudut **8 px**, dan tinggi minimal **44 px**. Bayangan tombol utama lebih kecil dari panel.
- Tombol utama berwarna lavender dengan ikon pixel **16 × 16 px** bila membantu mengenali aksi. Tombol sekunder memakai gading dan garis gelap. Setelah ditekan, tombol utama bergeser **2 px** ke arah bayangannya. Tampilkan teks proses seperti **Menyimpan…** sampai respons diterima.
- Kartu peserta memuat nama dan badge **Menalangi** bila sesuai. Kartu terpilih memakai lime dan tanda centang. Nominal final peserta tetap menjadi elemen terbesar di panel kanan.
- Beri fokus keyboard garis **3 px** dengan jarak **3 px** dari komponen. Tampilkan error di dekat isian dan hubungkan pesan dengan input. Untuk daftar peserta panjang, biarkan halaman bergulir secara alami.

### Maskot dan gerak

Usulan maskot berupa struk kecil bergerigi dengan mata kotak. Gunakan grid **32 × 32 pixel** sebagai dasar sprite dan perbesar dengan kelipatan bulat agar tepinya tetap tajam. Maskot tampil di halaman awal dan bisa memberi satu reaksi singkat ketika link atau kode berhasil disalin.

Transisi tombol dan kartu berlangsung sekitar **150–180 ms**. Reaksi maskot berjalan sekali selama maksimal **250 ms**. Saat preferensi pengurangan gerak aktif, gunakan perubahan visual dan pesan **Tersalin**.

## Peta halaman dan API

Path berikut adalah usulan untuk implementasi Next.js App Router.

| Halaman | Path | API Express |
|---|---|---|
| Halaman awal dan input kode | `/` | Membuka halaman tagihan sesuai kode. |
| Buat tagihan | `/bills/new` | `POST /api/bills` |
| Detail, panel berbagi, pilihan peserta, dan pengelolaan host | `/bills/[shareCode]` | `GET /api/bills/:shareCode` dan `DELETE /api/bills/:shareCode` |
| Edit tagihan | `/bills/[shareCode]/edit` | `GET /api/bills/:shareCode` dan `PUT /api/bills/:shareCode` |

Komponen yang bisa dipakai ulang mencakup form tagihan, kartu peserta, panel estimasi, panel berbagi, panel **Bagian kamu**, dan dialog konfirmasi hapus. Frontend menangani input dan pratinjau. Express memvalidasi data, memeriksa kode admin, menghitung nominal akhir, dan menyimpan tagihan di MongoDB.

Untuk integrasi lokal, usulannya adalah meneruskan request `/api/bills` dari Next.js ke Express agar browser memakai origin frontend yang sama saat mengakses API. Konfigurasi tujuan API ditetapkan saat implementasi. Saat pengambilan data berjalan, tampilkan status memuat. Untuk kegagalan jaringan atau server, tampilkan pesan singkat dan opsi **Coba lagi**.

## Kriteria penerimaan demo KSM

- [ ] Di laptop, host bisa membuat tagihan valid melalui form dua kolom dan melihat estimasi berubah saat total atau jumlah peserta berubah.
- [ ] Setelah pembuatan sukses, host melihat nominal final serta bisa menyalin link dan kode berbagi.
- [ ] Peserta di browser lain bisa membuka tagihan via link maupun kode, memilih nama, dan melihat nominal serta tujuan pembayaran di halaman yang sama.
- [ ] Dengan total Rp100.000 dan tiga peserta, pembagian final adalah Rp33.334, Rp33.333, dan Rp33.333. Peserta yang nalangin melihat **Sudah ditalangi**.
- [ ] Host yang memilih **Ingat di browser ini** bisa membuka ulang kontrol tagihan setelah menutup tab. **Lupakan kode di browser ini** menghapus kode tersimpan dan host masih bisa memasukkannya manual.
- [ ] Host bisa edit dan hapus dengan kode yang benar. Kode salah menghasilkan pesan yang jelas, dan hapus meminta konfirmasi.
- [ ] Tagihan yang tidak ditemukan, input yang tidak valid, dan kegagalan jaringan punya pesan yang membantu pengguna melanjutkan.
- [ ] Aksi utama bisa dipakai dengan keyboard dan umpan balik salin tetap terbaca saat animasi dikurangi.

Uji demo dengan dua profil browser, misalnya jendela reguler untuk host dan jendela privat untuk peserta, agar keduanya tidak memakai penyimpanan kode admin yang sama.

## Setelah MVP: transfer, bukti bayar, dan penutupan

### Instruksi transfer

Di form pembuatan atau pengeditan, host mengisi nama bank, nomor rekening, dan nama pemilik rekening. Untuk peserta yang perlu membayar, panel **Bagian kamu** menampilkan nominal, detail rekening tujuan, dan tombol **Salin nomor rekening**. Orang yang nalangin tetap melihat **Sudah ditalangi**.

### Pengiriman bukti

1. Peserta membuka tagihan, memilih namanya, mencentang **Sudah bayar**, dan mengunggah foto bukti transfer.
2. Setelah pengiriman berhasil, peserta melihat **Bukti dikirim**. Status ini menunjukkan bahwa foto sudah diterima aplikasi.
3. Di panel admin, host melihat peserta yang sudah mengirim bukti dan membuka fotonya. Jika ada masalah, host menghubungi peserta di luar aplikasi, misalnya lewat WhatsApp.

Akses foto dibatasi ke panel admin dan setiap permintaan file diperiksa oleh server. Pemilihan nama tetap mengikuti model tanpa akun. Karena pemegang kode berbagi dapat memilih nama mana pun, status **Bukti dikirim** tidak membuktikan identitas pengirim atau bahwa uang sudah diterima.

### Penutupan tagihan

Host bisa menekan **Tutup tagihan** kapan saja dan mengonfirmasi aksi. Server segera menyimpan waktu penutupan. Halaman peserta yang baru dibuka atau dibuka ulang langsung menampilkan **Tagihan sudah ditutup**, sementara halaman yang masih terbuka ikut memperbarui status. Ringkasan tagihan tetap tersedia untuk dibaca dan kontrol pengiriman bukti berhenti.

Usulan untuk demo, halaman yang masih terbuka memeriksa status setiap lima detik dan saat tab kembali aktif. Server tetap menolak unggahan yang dikirim sesudah penutupan, termasuk jika tampilan peserta belum sempat diperbarui.
