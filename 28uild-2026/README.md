# 28UILD 2026: Desain T-shirt

Karya untuk Lomba Desain T-shirt 28UILD 2026 (Habitat for Humanity Indonesia),
dengan tema Semangat Sumpah Pemuda. Setiap peserta boleh mengirim 3 karya.

| Karya | Judul | Deskripsi | File |
|---|---|---|---|
| 1 | Rumah Persatuan | [DESKRIPSI-KARYA-1.md](DESKRIPSI-KARYA-1.md) | `export/karya-1-rumah-persatuan/` |
| 2 | Seribu Atap, Satu Tanah Air | [DESKRIPSI-KARYA-2.md](DESKRIPSI-KARYA-2.md) | `export/karya-2-seribu-atap/` |

## Isi folder tiap karya

| File | Isi |
|---|---|
| `01-mockup-depan-belakang.png` | Papan mockup depan & belakang (3840 × 2160) |
| `02-desain-belakang-30x40cm-300dpi.png` | Desain belakang di atas warna kaos, lengkap dengan penanda area sponsor. **File utama untuk diunggah.** |
| `03-file-cetak-transparan-30x40cm-300dpi.png` | File produksi sablon: latar transparan, tanpa garis panduan |
| `04-konsep-desain.png` | Halaman filosofi desain & checklist ketentuan |
| `05-desain-belakang-30x40cm.pdf` | Desain belakang, PDF vektor ukuran asli 30 × 40 cm |
| `06-presentasi-<karya>.pdf` | Presentasi 2 halaman: mockup + konsep |

## Membuat ulang

Semua artwork berupa SVG yang dibangkitkan dari kode, lalu di-render lewat Chromium (Playwright):

```bash
node build.mjs              # semua karya ke export/<karya>/
node build.mjs 2            # hanya karya 2
node build.mjs preview      # pratinjau cepat ke export/preview/
```

- `src/common.mjs`: palet, font, logo, dan elemen wajib punggung (logo Let's Open The Door, area sponsor)
- `src/karya1.mjs`, `src/karya2.mjs`: artwork punggung + teks konsep tiap karya (koordinat dalam mm pada kanvas 300 × 400)
- `src/mockup.mjs`: papan mockup; siluet kaos hasil trace template panitia (`src/shirt-paths.json`)
- `src/concept.mjs`: halaman konsep
- `tools/trace_template.py`: men-trace `assets/template-mockup-panitia.jpg` menjadi path vektor (butuh `opencv-python-headless`, `numpy`, `pillow`)
- `tools/zoom.mjs`: render potongan artwork untuk dicek dari dekat

Font: Barlow, Barlow Condensed, Special Elite, Fraunces, dan Big Shoulders Display
(Google Fonts, SIL Open Font License). Logo di `assets/` adalah milik penyelenggara dan
hanya dipakai sesuai ketentuan lomba.
