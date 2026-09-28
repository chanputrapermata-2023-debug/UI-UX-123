# Poster "Batu Kunci Kepercayaan"

**Tema:** Meneguhkan Profesionalisme, Menguatkan Kepercayaan
**Subtema:** (f) Lembaga Alternatif Penyelesaian Sengketa Sektor Jasa Keuangan

![Pratinjau poster](output/poster-preview.png)

## File

| File | Kegunaan |
| --- | --- |
| `output/poster-A3-300dpi.jpg` | Untuk diunggah; ukurannya lebih kecil (A3, 3509 × 4959 px, ±300 dpi) |
| `output/poster-A3-300dpi.png` | Versi tanpa kompresi, ukuran sama |
| `output/poster-A3.pdf` | Siap cetak, A3 (297 × 420 mm), vektor, font tertanam |
| `output/poster-preview.png` | Pratinjau ringan |
| `poster.html` | Sumber desain (HTML + SVG), bisa diedit |
| `render.js` | Membuat ulang file di `output/` |

## Deskripsi karya

Poster ini memakai metafora **batu kunci** (*keystone*), yaitu batu di puncak lengkung
yang menahan semua batu lainnya. Tanpa batu kunci, lengkung akan runtuh. Kalau batu
kunci terpasang kokoh, kedua sisi lengkung bisa berdiri tegak dan saling menopang.

Lengkung digambarkan sebagai **gerbang dari malam menuju fajar**. Di luar gerbang
suasananya malam, melambangkan sengketa dan ketidakpastian. Di dalam gerbang, fajar
kepercayaan terbit, dan jalan terang mengarah ke sana.

- **Batu kunci emas = LAPS SJK.** LAPS SJK berdiri di tengah dan bertumpu pada
  profesionalisme. Tiga garis tekan di atasnya menandai batu yang baru saja
  *diteguhkan*, sesuai frasa **"Meneguhkan Profesionalisme"**.
- **Batu lengkung = prinsip LAPS SJK.** Prinsip aksesibilitas, independensi, keadilan,
  serta efisiensi dan efektivitas dipahatkan pada batu-batu yang menyusun lengkung.
- **Dua tiang = Konsumen dan PUJK.** Keduanya ditopang secara setara oleh lengkung yang sama.
- **Fajar = kepercayaan.** Kepercayaan terbit kembali ketika sengketa diselesaikan
  secara adil, sesuai frasa **"Menguatkan Kepercayaan"**. Warna emas pada kata
  "Profesionalisme" dan "Kepercayaan" di judul sengaja disamakan dengan warna batu
  kunci dan fajar.
- **Motif kawung** samar di latar dan pada batu dasar adalah batik Nusantara yang
  dimaknai sebagai lambang integritas dan keadilan.

Bagian bawah poster berisi **alur penyelesaian sengketa**:
(1) adukan ke PUJK, (2) jika belum ada titik temu, ajukan ke LAPS SJK secara daring
melalui APPK atau datang langsung, (3) pilih layanan mediasi, arbitrase, atau pendapat
mengikat, (4) sengketa tuntas dan kepercayaan kembali menguat. Poster ditutup dengan
slogan *"Adil di tengah, kokoh di kedua sisi."*

**Warna:** biru tua melambangkan profesionalisme dan stabilitas, emas melambangkan nilai
dan kepercayaan, dan krem batu melambangkan keteguhan. Warna fajar (lavender dan
persik) hanya dipakai di dalam gerbang.
**Tipografi:** Fraunces (judul) dan Plus Jakarta Sans (teks). Plus Jakarta Sans adalah
huruf rancangan desainer Indonesia. Keduanya berlisensi SIL Open Font License.
Seluruh ilustrasi digambar sendiri dengan SVG, tanpa foto atau aset stok.

## Catatan revisi (v2)

- Gerbang malam → fajar menggantikan latar seragam, sehingga metafora bercerita
  tanpa perlu legenda.
- Pita legenda tiga kolom diganti satu kalimat keterangan, sehingga alur baca menjadi
  judul → ilustrasi → alur → slogan.
- Kartu, *pill*, dan badge bergaya aplikasi diganti *timeline* bernomor dengan garis
  putus-putus yang menggemakan marka jalan di ilustrasi.
- Langit keruh (oranye di atas navy) diganti gradasi fajar yang bersih. Siluet kota
  berbentuk kotak diganti gedung beragam atap yang tampak jauh, ditambah bukit berlembah
  yang membingkai matahari.
- Batu diberi tekstur butiran dan bevel, dan nama prinsip dibuat seperti dipahat.
- Ukuran huruf dirampingkan menjadi satu skala tipografi. Teks terkecil sekarang
  11,5 px (sebelumnya 10 px).
- Klaim "bebas biaya mediasi" yang belum terverifikasi dihapus.

## Mengedit dan membuat ulang

Ubah teks di `poster.html`, lalu jalankan:

```bash
NODE_PATH=$(npm root -g) node poster/render.js
```

Perintah ini membutuhkan Playwright dengan Chromium.
