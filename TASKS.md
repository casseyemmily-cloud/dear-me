# TASKS — Dear Me

> Diturunkan dari `SPEC.md` (fitur F-01…F-08, AC-01…AC-20) dan `UI-SPEC.md` (C-01…C-09).
> Target: **≤ 8 jam efektif + 30 menit buffer**, 3 iterasi. **Dokumen ini bukan kode.**

**Legenda:** `AC-n` = acceptance criteria di `SPEC.md` §8 · `UI-n` = daftar cek di `UI-SPEC.md` §6.
**Aturan:** tanda `[x]` hanya dicentang setelah dicek manual di browser. Dilarang menambah fitur di luar daftar ini (R-01).

---

## M0 — Scaffold (0,5 jam)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-001 | Inisialisasi Vite vanilla | `npm install && npm run dev` membuka halaman tanpa error di Console | `package.json`, `package-lock.json`, `index.html` |
| T-002 | Struktur folder & entry point | Halaman kosong bertema cream tampil; tidak ada 404 aset | `index.html`, `src/main.js`, `src/style.css` |
| T-003 | Design tokens CSS | Warna, font fallback, radius, focus ring sesuai UI-SPEC; cek UI-1, UI-2, UI-3 | `src/style.css`, `public/fonts/` |
| T-004 | Header + 6 tab & bottom nav | Klik tiap tab mengganti konten; tab aktif jelas; mobile 360 px tidak scroll horizontal (AC-20, UI-5) | `index.html`, `src/main.js`, `src/style.css` |
| T-005 | Hero + disclaimer footer | H1 "A Little Space to Heal, Grow, and Bloom" tampil; disclaimer permanen terlihat di semua tab (AC-05, UI-7) | `index.html`, `src/style.css` |
| T-006 | Utility DOM & format tanggal | Tanggal tampil `id-ID`, bukan UTC mentah (NFR-11); input dirender via `textContent` (NFR-05) | `src/utils/dom.js`, `src/utils/format.js` |

---

## M1 — Daily Check-In & Emotional Report (1,75 jam)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-007 | Form check-in 4 pertanyaan | 6 chip mood, slider tidur/energi 1–5, chip kebutuhan, field opsional 0/140 tampil (C-03) | `src/features/checkin.js`, `src/style.css` |
| T-008 | Konstanta mood & kebutuhan | Pilihan sesuai F-01; chip terpilih jelas (UI-8) | `src/constants.js` |
| T-009 | Hitung cuaca rule-based | Marah+energi1+tidur1 → ⛈️ Badai; Senang+energi3 → ☀️ Cerah (AC-04, UI-9) | `src/features/checkin.js` |
| T-010 | Kartu laporan & reminder | Setelah Simpan muncul ikon cuaca, kalimat non-diagnostik, kartu "A Little Reminder For You", 1–2 saran self-care (AC-02, C-04) | `src/features/checkin.js`, `src/constants.js`, `src/style.css` |
| T-011 | Upsert satu entri per hari | Isi ulang tanggal sama → tetap 1 entri, nilainya berubah (AC-03) | `src/features/checkin.js`, `src/storage.js` |
| T-012 | Toast simpan | Muncul "Tersimpan 🌷" ~2,5 detik setelah simpan (C-09) | `src/ui/toast.js`, `src/style.css` |

---

## M2 — Journal & Little Wins (1,25 jam)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-013 | Companion rule-based | Pilih topik "Rasa Lelah" → pertanyaan berubah; klik "Pertanyaan lain" → berubah lagi; **Network kosong** (AC-06) | `src/constants.js`, `src/features/journal.js` |
| T-014 | Label jujur companion | Terlihat teks "pola sederhana di perangkatmu", bukan klaim AI generatif (F-04) | `src/features/journal.js` |
| T-015 | Form jurnal + little win | Judul, isi, little win, mood terisi otomatis dari check-in terakhir; simpan → kartu muncul (AC-07) | `src/features/journal.js`, `src/style.css` |
| T-016 | Riwayat kronologis & hapus | Terbaru di atas, maks 10 + "Tampilkan lebih banyak"; klik Hapus + konfirmasi → hilang (AC-08) | `src/features/journal.js` |
| T-017 | Badge 🌱 little win | Entri dengan little win menampilkan badge; yang kosong tidak (C-05, F-08) | `src/features/journal.js`, `src/style.css` |

---

## M2b — Reframing & Letters to Future Me (1,25 jam) — *tambahan wajib F-05/F-06*

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-018 | Form reframing 3 bagian | Tiga textarea; simpan → riwayat "Pikiran awal → Sudut pandang seimbang" (AC-09) | `src/features/reframe.js`, `src/style.css` |
| T-019 | Form surat + validasi tanggal | Input tanggal buka minimal besok; simpan → status 🔒 Terkunci, isi **tidak ada di DOM** (AC-10, UI-10) | `src/features/letters.js` |
| T-020 | Status & tombol uji buka | Klik "Buka sekarang (uji)" → 🌷 Terbuka, isi tampil, `terbuka: true` tersimpan (AC-11) | `src/features/letters.js` |
| T-021 | Surat lewat waktu | Surat dengan tanggal buka kemarin otomatis terbuka tanpa klik (AC-12) | `src/features/letters.js` |
| T-022 | Hapus reframe & surat | Konfirmasi → entri hilang dari tampilan dan storage | `src/features/reframe.js`, `src/features/letters.js` |

---

## M3 — Safe Space & Affirmation (0,5 jam)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-023 | Timer napas 4-4-6 × 3 | Klik Mulai → teks Tarik→Tahan→Hembus, progress 1/3→3/3, selesai otomatis (AC-13) | `src/features/safe-space.js` |
| T-024 | Stop aman & anti-bocor | Klik Berhenti di tengah fase → timer mati, teks balik ke instruksi; tidak ada fase lanjut (AC-14, R-03) | `src/features/safe-space.js` |
| T-025 | Kartu afirmasi | Kalimat Playfair tampil; klik "Afirmasi lain" → berubah dari daftar statis (AC-15) | `src/features/safe-space.js`, `src/constants.js`, `src/style.css` |

---

## M4 — Growth Journey (0,5 jam)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-026 | Stat card 2×2 / 4 kolom | Total check-in, cuaca terakhir, jurnal, little wins tampil sesuai grid (C-07, UI-5) | `src/features/journey.js`, `src/style.css` |
| T-027 | Hitung angka dari storage | Tambah 1 jurnal + 1 check-in → angka bertambah, cuaca terakhir mengikuti (AC-16) | `src/features/journey.js`, `src/storage.js` |
| T-028 | Bonus & kontrol data | Jumlah reframe/surat terbuka tampil; tombol "Muat ulang data contoh" & "Hapus semua data" berfungsi (AC-17) | `src/features/journey.js` |
| T-029 | Badge data contoh | Badge "Data contoh (bukan data pribadi)" muncul saat seed aktif, hilang setelah data sendiri (AC-01, F-08) | `src/features/journey.js`, `src/style.css` |

---

## M5 — localStorage & Seed Data (0,25 jam verifikasi; dibangun sejak M0/M1)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-030 | Helper load/save/uid | Kunci `dearme:checkins`, `dearme:journals`, `dearme:reframes`, `dearme:letters` terlihat di DevTools → Application → Local Storage | `src/storage.js` |
| T-031 | Seed nonpribadi saat first-run | Hapus semua data + refresh → seed 1 check-in, 1 jurnal, 1 reframe, 1 surat terbuka kembali (AC-01, AC-17) | `src/constants.js`, `src/storage.js` |
| T-032 | Fallback JSON rusak | Ubah nilai `dearme:journals` jadi teks acak di DevTools, refresh → aplikasi tidak crash, tampil kosong (NFR-06) | `src/storage.js` |
| T-033 | Gagal simpan | Penuhkan kuota / simulasikan error → toast "Gagal menyimpan, coba hapus entri lama." (NFR-06, C-09) | `src/storage.js`, `src/ui/toast.js` |

---

## M6 — Manual Testing (0,5 jam)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-034 | Eksekusi AC-01…AC-20 | Ke-20 kriteria di `SPEC.md` §8 lolos, dicentang | `TASKS.md`, `README.md` |
| T-035 | Daftar cek UI UI-1…UI-10 | Semua centang; kontras, fokus, 360 px, font lokal, disclaimer (UI-SPEC §6) | `src/style.css`, `TASKS.md` |
| T-036 | Console & Network bersih | DevTools Console 0 error; Network tidak ada request domain eksternal (AC-19) | `index.html`, `src/main.js` |
| T-037 | Uji XSS dasar | Masukkan `<img src=x onerror=alert(1)>` di jurnal → tampil sebagai teks, tanpa alert (AC-18) | `src/utils/dom.js`, `src/features/journal.js` |

---

## M7 — Security & Privacy (0,5 jam)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-038 | Audit API key & credential | `grep` tidak menemukan `apiKey`, `sk-`, `token`, URL `http` di source; tidak ada form login (NFR-02/03) | seluruh `src/`, `index.html` |
| T-039 | Audit `innerHTML` | Tidak ada `innerHTML` untuk data pengguna; semua pakai `textContent` (NFR-05, AC-18) | seluruh `src/` |
| T-040 | Audit jaringan & font | Tidak ada `<link>` ke CDN; font dari `public/fonts` atau fallback (NFR-02, UI-4) | `index.html`, `src/style.css` |
| T-041 | Disclaimer & privasi | Teks disclaimer di footer + kartu laporan; tidak ada cookie/tracking (NFR-10, NFR-04) | `index.html`, `src/features/checkin.js`, `README.md` |

---

## M8 — Build (0,25 jam)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-042 | Build produksi | `npm run build` sukses, folder `dist/` berisi `index.html` + aset | `package.json`, `dist/` |
| T-043 | Preview produksi | `npm run preview` → semua tab & AC utama masih berfungsi (tidak hanya di dev server) | `vite.config.js`, `src/main.js` |
| T-044 | Relative base path | `vite.config.js` memakai `base: './'` agar aset tidak 404 di subpath GitHub Pages | `vite.config.js` |
| T-045 | Dokumentasi | `README.md` berisi install, run, build, struktur data, disclaimer; `.gitignore` mengabaikan `node_modules/`, `dist/` | `README.md`, `.gitignore` |

---

## M9 — Deployment GitHub Pages (0,25 jam)

| ID | Tugas | Acceptance criteria (manual) | Berkas yang mungkin berubah |
|---|---|---|---|
| T-046 | Repo & push | Kode ter-push ke branch `main`; tidak ada file `.env` atau kredensial ter-commit | `.git/` (remote), seluruh berkas |
| T-047 | Aktifkan Pages | Settings → Pages → Source "GitHub Actions" atau "Deploy from a branch / main / root" | pengaturan repo (non-berkas) |
| T-048 | Workflow deploy | Tambah workflow build + upload artifact + deploy; atau fallback `deploy.sh` dengan `gh-pages`. Pastikan `base: './'` | `.github/workflows/deploy.yml`, `package.json` |
| T-049 | Verifikasi URL publik | Buka `https://<user>.github.io/dear-me/` di browser & di ponsel: semua tab jalan, refresh tidak 404, Network tetap bersih | `public/.nojekyll`, `vite.config.js` |

---

## Pemetaan ke 3 Iterasi (`SPEC.md` §9)

| Iterasi | Milestone | Estimasi |
|---|---|---|
| 1 — Fondasi + Check-In + Laporan | M0, M1, T-030, T-031 | ~2,5 jam |
| 2 — Tulis-menulis & riwayat | M2, M2b, T-032, T-037 | ~3 jam |
| 3 — Safe Space, Journey, verifikasi & rilis | M3, M4, M5, M6, M7, M8, M9 | ~2,5 jam |
| Buffer (bug tak terduga saja) | — | 30 menit |

## Definition of Done

- [ ] 49 tugas selesai & dicentang (T-001…T-049, dengan M2b sebagai tambahan wajib).
- [ ] AC-01…AC-20 dan UI-1…UI-10 lolos.
- [ ] Console 0 error, Network 0 request eksternal, build sukses, URL GitHub Pages aktif.
- [ ] Disclaimer terbaca di aplikasi maupun README.
- [ ] **Tidak ada fitur baru** di luar `SPEC.md` F-01…F-08 (lihat R-01 scope creep).
