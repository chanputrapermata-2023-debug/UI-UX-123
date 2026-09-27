# Poster Infografis: *Tujuh Layar Penggerak Ekspor Nasional*

Tema: **17 Tahun Indonesia Eximbank — Berkarya, Bermakna**
Sub-tema: **Peran Indonesia Eximbank sebagai *Policy Bank* dalam Mendorong Ekspor Nasional**

| File | Keterangan |
|---|---|
| `output/poster-17-tahun-eximbank-A3-300dpi.jpg` | Siap unggah/cetak. A3 potret, 3508 × 4961 px (300 dpi), ±2,3 MB (batas lomba 5 MB) |
| `output/poster-17-tahun-eximbank.png` | PNG 2480 × 3507 px, ±2,2 MB |
| `output/poster-17-tahun-eximbank-A3.pdf` | PDF vektor ukuran A3 untuk cetak |
| `index.html` | Sumber desain (HTML + ilustrasi SVG buatan tangan), bisa diedit |
| `render.mjs` | Skrip ekspor PNG/JPG/PDF (Playwright + Chromium) |

## Konsep

**Metafora Pinisi.** Pinisi, kapal warisan Bugis-Makassar, punya dua tiang dan **tujuh layar**, lambang
tekad mengarungi tujuh samudra. Di poster ini tiap layar mewakili satu instrumen Indonesia Eximbank (LPEI),
dikelompokkan dalam tiga peran:

| Kelompok | Layar | Instrumen |
|---|---|---|
| **Siapkan** (layar haluan, emas) | 1 · 2 · 3 | Jasa Konsultasi · Desa Devisa · CPNE |
| **Biayai** (layar utama, biru) | 4 · 5 | Pembiayaan Ekspor · Penugasan Khusus Ekspor (PKE) |
| **Lindungi** (layar puncak, navy) | 6 · 7 | Penjaminan · Asuransi |

Angka "7" juga menggemakan logo 17 tahun, yang pitanya mengalun seperti layar. Warna layar diambil langsung
dari gradasi logo (biru–sian–navy dan emas).

**Alur baca (masalah → solusi → perjalanan → dampak → makna):**
1. Judul dan definisi *policy bank*
2. *Mengapa perlu policy bank?* Celah pasar yang belum dijangkau lembaga keuangan komersial
3. Pinisi dan legenda 7 layar: cara kerja LPEI
4. *Jejak 17 tahun*: 1999 → 2026, ditata sebagai jalur pelayaran
5. *Karya yang bermakna*: empat angka dampak
6. Penutup: pepatah *"Sekali layar terkembang, surut kita berpantang"* dan sumber data

**Kaitan dengan kriteria penilaian**
- *Kejelasan pesan (40%)*: satu pesan utama, hierarki judul → subjudul → isi, nomor layar yang langsung
  cocok dengan legenda, angka besar yang disertai periode data, dan sumber tercantum.
- *Kualitas visual (30%)*: palet diturunkan dari kedua logo, grid 2 kolom yang konsisten, tipografi
  Plus Jakarta Sans (karya foundry Indonesia, Tokotype) dipadukan Fraunces untuk aksen.
- *Kreativitas (20%)*: metafora Pinisi 7 layar, matahari terbit, awan mega mendung, motif ombak, dan
  garis waktu sebagai jalur pelayaran. Semua ilustrasi digambar sendiri sebagai vektor, tanpa stok
  gambar atau AI image generator.
- *Kesesuaian tema (10%)*: "17 tahun", "berkarya", "bermakna", dan frasa sub-tema muncul eksplisit.

## Data & sumber

| Data di poster | Sumber |
|---|---|
| UU No. 2/2009; beroperasi 1 Sept 2009; cikal bakal PT Bank Ekspor Indonesia (1999) | UU No. 2 Tahun 2009; indonesiaeximbank.go.id; Wikipedia ID "Lembaga Pembiayaan Ekspor Indonesia" |
| 2.618 Desa Devisa (2019 s.d. Juli 2026); 1.983 capaian eksportir baru CPNE (2019–Juli 2026) | Investortrust.id, CNBC Indonesia (13/9/2026) |
| Dampak sosial-ekonomi 3,49× per Rp1 pembiayaan (Juni 2026) | CNBC Indonesia, detikFinance (Sept 2026) |
| Tata kelola 2025: SNI ISO 37001:2016, predikat Baik dari BPKP | CNBC Indonesia / detikFinance (Sept 2026) |
| Realisasi PKE Rp13,7 T; pemanfaat menjangkau 90+ negara | Katadata, Warta Ekonomi (April 2026) |
| PKE sejak PMK 134/PMK.08/2015; contoh CN-235 ke Senegal; PKE Kawasan (Afrika, Asia Selatan, Timur Tengah, dll.) | CNBC Indonesia (2024), siaran pers LPEI |
| CPNE digelar sejak 2015 | Antara (CPNE) |
| Desa Devisa pertama: Kakao Jembrana, Bali (2019), ekspor ke Eropa & Jepang | Pemkab Jembrana, CNBC Indonesia |
| Arahan Menkeu soal industri padat karya (tekstil, alas kaki, furnitur, baja) | Bisnis.com, Kompas.com (13–14/9/2026) |
| Pinisi: 2 tiang, 7 layar; seni pembuatannya Warisan Budaya Takbenda UNESCO 2017 | UNESCO; Museum Gumuk Pasir (BIG) |

> Sebelum mengirim karya, cocokkan lagi angka-angka di atas dengan artikel aslinya. Beberapa sumber
> hanya dapat diverifikasi lewat ringkasan hasil pencarian, dan angka PKE di media lain kadang berbeda
> tergantung periode.

## ⚠️ Catatan aturan lomba

Aturan Kompetisi Infografis 17 Tahun LPEI menyebut **AI hanya boleh dipakai untuk mencari ide, referensi,
dan informasi**, sedangkan **konsep utama, tata letak, dan pengolahan data wajib dikerjakan peserta
sendiri**. Karena poster ini dibuat dengan bantuan AI, gunakan sebagai **referensi/mockup**. Versi yang
dikirim sebaiknya disusun ulang dan disesuaikan sendiri, misalnya di Canva, Figma, atau Illustrator,
dengan keputusan desain dari peserta.

## Mengedit & merender ulang

```bash
cd poster-17-tahun
npm install            # memasang Playwright (browser Chromium sudah tersedia di environment)
npm run preview        # output/preview.png, 1200 × 1697 px, untuk cek cepat
npm run render         # JPG 300 dpi, PNG, dan PDF A3
```

Teks bisa diubah langsung di `index.html`. Ilustrasi Pinisi ada di elemen `<g id="ship">`.
Font berlisensi SIL Open Font License (lihat `fonts/OFL-*.txt`).
