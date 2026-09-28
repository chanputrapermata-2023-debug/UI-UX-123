# 28UILD 2026: Desain T-shirt "Rumah Persatuan"

Karya untuk Lomba Desain T-shirt 28UILD 2026 (Habitat for Humanity Indonesia),
dengan tema Semangat Sumpah Pemuda. Konsep dan makna tiap elemen ada di
[DESKRIPSI-KARYA.md](DESKRIPSI-KARYA.md).

## File hasil (`export/`)

| File | Isi |
|---|---|
| `01-mockup-depan-belakang.png` | Papan mockup depan & belakang (3840 × 2160) |
| `02-desain-belakang-30x40cm-300dpi.png` | Desain belakang di atas warna kaos, lengkap dengan penanda area sponsor. **File utama untuk diunggah.** |
| `03-file-cetak-transparan-30x40cm-300dpi.png` | File produksi sablon: latar transparan, tanpa garis panduan |
| `04-konsep-desain.png` | Halaman filosofi desain & checklist ketentuan |
| `05-desain-belakang-30x40cm.pdf` | Desain belakang, PDF vektor ukuran asli 30 × 40 cm |
| `06-presentasi-28uild-2026.pdf` | Presentasi 2 halaman: mockup + konsep |

## Membuat ulang

Semua artwork berupa SVG yang dibangkitkan dari kode, lalu di-render lewat Chromium (Playwright):

```bash
node build.mjs            # semua file ke export/
node build.mjs preview    # pratinjau cepat ke export/preview/
```

- `src/back.mjs`: artwork punggung (koordinat dalam mm pada kanvas 300 × 400)
- `src/mockup.mjs`: papan mockup; siluet kaos hasil trace template panitia (`src/shirt-paths.json`)
- `src/concept.mjs`: halaman konsep
- `tools/trace_template.py`: men-trace `assets/template-mockup-panitia.jpg` menjadi path vektor (butuh `opencv-python-headless`, `numpy`, `pillow`)

Font: Barlow, Barlow Condensed, dan Special Elite (Google Fonts, SIL Open Font License).
Logo di `assets/` adalah milik penyelenggara dan hanya dipakai sesuai ketentuan lomba.
