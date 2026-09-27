# Poster 50 Tahun Tirta Mangutama — remaster

Poster A3 (1123 × 1587 px pada 96 dpi) "Tangan di Balik Setiap Tetes".

Versi yang bisa diedit ada di kanvas desain: https://claude.ai/artifact/3VyL1Y4rPjFQ4SW3RVymki

| File | Isi |
| --- | --- |
| `poster.html` | Poster lengkap: ilustrasi + teks + logo. Buka di browser. |
| `poster-art.svg` | Semua ilustrasi (vektor), tanpa teks judul/tagline dan tanpa logo. |
| `logo-air-minum.png`, `logo-50-tahun.png` | Logo, dipotong dari poster lama (resolusi rendah). Ganti dengan file logo asli sebelum cetak. |
| `poster-preview.jpg` | Pratinjau cepat. |
| `tools/` | Skrip untuk membuat ulang `poster-art.svg`. |

## Membuat ulang ilustrasi

Angka "50" dibuat dari huruf Bodoni Moda Black (opsz 96) yang diubah jadi path.

```sh
cd tools
npm install
mkdir -p fonts
curl -sS -o fonts/BodoniModa-96-900.ttf "$(curl -sS 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@96,900' | grep -o 'https://[^)]*\.ttf')"
node build-art.js          # menulis ../poster-art.svg
```

Font: Plus Jakarta Sans (judul, subjudul) dan Bodoni Moda (angka 50, tagline), keduanya dari Google Fonts.
