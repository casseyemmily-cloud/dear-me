# UI-SPEC — Dear Me

> Turunan dari `SPEC.md`. Fokus: tampilan, warna, tipografi, komponen, dan wireframe. **Belum ada kode.**

| Field | Nilai |
|---|---|
| Versi | 1.0 · 19 Nov 2026 |
| Prinsip | Tenang, hangat, lapang, tidak klinis, mobile-first |
| Target layar | 360–1440 px (minimum 360 px — AC-20) |
| Struktur | Satu halaman, 6 tab; satu aksi utama per kartu |

---

## 1. Design Tokens

### 1.1 Palet (pastel hangat & menenangkan)

| Token | Hex | Peran | Pakai sebagai teks? |
|---|---|---|---|
| `--cream` | `#FFF9F5` | Latar halaman, latar tombol primer | ✅ teks di atasnya = charcoal/mauve |
| `--blush` | `#F5DCE5` | Kartu sekunder, chip, bidang afirmasi | ❌ latar saja |
| `--rose` | `#D99AAF` | Garis, ikon cuaca, aksen tipis, progress | ❌ kontras < 3:1 di cream |
| `--mauve` | `#76566A` | Tombol primer, heading sekunder, link, fokus | ✅ ±6,4:1 di cream |
| `--charcoal` | `#39343A` |Body copy, heading utama, angka | ✅ ±12:1 di cream |
| `--lavender` | `#8E7AA8` | Aksen quote / badge | ⚠️ teks pakai `--lavender-ink` `#6E5A88` |
| `--sage` | `#7C9A82` | Aksen sukses/self-care | ⚠️ teks pakai `--sage-ink` `#4F6B57` |
| `--white` | `#FFFFFF` | Latar kartu utama di atas cream | ✅ |

Aturan kontras:
- **Charcoal / Mauve / Lavender-ink / Sage-ink** = satu-satunya warna teks.
- **Rose / Blush** hanya border, isian, ikon, dekorasi — jangan untuk teks kecil.
- Tombol primer: latar `--mauve`, teks `--cream` (≈ 6,4:1).
- Focus ring: `3px solid --mauve`, `offset 2px`; **jangan dihapus** (`outline: none` dilarang tanpa pengganti).
- Badge "Data contoh": latar `--blush`, teks `--mauve`, border 1px `--rose`.

### 1.2 Tipografi

| Peran | Font | Ukuran (desktop / mobile) | Catatan |
|---|---|---|---|
| Heading & quote | **Playfair Display**, fallback `Georgia, serif` | H1 40/30 · H2 26/22 · quote 22/20 | Letter-spacing −0,01em, line-height 1,25 |
| Body, nav, tombol, form | **DM Sans**, fallback `system-ui, sans-serif` | 16/15 · label 13 · caption 12 | Line-height 1,6, label 600, caption 400 |

**Keputusan font (penting):** dimuat dari **aset lokal** (`public/fonts/`) melalui `@font-face`. **Dilarang** Google Fonts/CDN — akan menambah request eksternal dan menggagalkan AC-19 (Network bersih). Jika file font belum tersedia, pakai fallback `Georgia` + `system-ui`; UI tetap rapi.

### 1.3 Spacing, bentuk, elevasi

- Skala: `4 / 8 / 12 / 16 / 24 / 32 / 48` px.
- Radius: kartu `16px`, input `10px`, chip/pill `999px`, badge `8px`.
- Border kartu: `1px solid --blush`; shadow lembut `0 4px 16px rgba(57,52,58,.06)`.
- Max content width `1080px`, padding sisi `16px` mobile → `32px` desktop.
- Jarak antar kartu `16px` mobile / `24px` desktop.
- Transisi `150ms ease` untuk hover/fokus; **tanpa animasi berat** (hormati `prefers-reduced-motion`).

### 1.4 State

| Elemen | Default | Hover | Fokus | Disabled |
|---|---|---|---|---|
| Tombol primer | Mauve + cream | Gelap 8% | Ring 3px mauve | Opacity .5, cursor not-allowed |
| Tombol sekunder | Cream + border rose | Latar blush | Ring 3px mauve | Opacity .5 |
| Chip mood | Cream + border blush | Latar blush | Ring mauve | — |
| Chip terpilih | Latar blush, border mauve, teks mauve, ✅ | — | Ring mauve | — |
| Input/textarea | White, border blush | Border rose | Border mauve + ring | Opacity .6 |

---

## 2. Komponen

| # | Komponen | Isi & aturan |
|---|---|---|
| C-01 | **Header / Navigasi** | Logo "◐ Dear Me" (Playfair) + tagline kecil. Desktop: tab horizontal sticky, tab aktif bergaris bawah mauve. Mobile: header tipis + **bottom tab bar** 6 tab, scroll-x bila perlu. Tab: Beranda · Jurnal · Reframing · Surat · Safe Space · Journey. |
| C-02 | **Hero** | H1 *"A Little Space to Heal, Grow, and Bloom"*, subcopy 1–2 baris, satu CTA "Mulai Check-In". Latar cream + blur blob blush di kanan (dekoratif, `aria-hidden`). |
| C-03 | **Daily Check-In** | Kartu berjudul "How are you, really?". 6 chip mood (Senang ☀️, Tenang 🌿, Lelah 😮‍💨, Cemas 🌀, Sedih 🌧️, Marah ⛈️) → grid 3×2 mobile / 6 desktop. Dua slider 1–5 (Tidur, Energi) dengan angka di ujung. Chip kebutuhan (wrap). Field opsional "Pikiran hari ini" + counter `0/140`. Tombol penuh "Simpan Check-In". |
| C-04 | **Emotional Report & Little Reminder** | Kartu hasil: ikon cuaca besar + label + tanggal lokal + kalimat non-diagnostik. Sub-kartu **"A Little Reminder For You"** latar blush dengan quote Playfair. Di bawah: 1–2 self-care chip dengan ikon sage. Caption disclaimer kecil. Cuaca: ☀️ Cerah · ⛅ Berawan · 🌧️ Hujan · ⛈️ Badai. |
| C-05 | **My Journal & Little Wins** | Tab Jurnal: dropdown topik + kotak pertanyaan reflektif (label jujur "pola sederhana di perangkatmu") + tombol "Pertanyaan lain". Form: judul, textarea isi, input little win, mood terisi otomatis. Tombol "Simpan Jurnal". Riwayat = kartu kronologis (terbaru atas) dengan judul, tanggal, isi, badge 🌱 little win, dan quote pertanyaan. Maks 10 kartu + "Tampilkan lebih banyak". Hapus = tombol teks "Hapus" + konfirmasi. |
| C-05b | **Reframing & Surat** *(tambahan wajib, pola sama)* | Reframing: 3 textarea bertumpuk (Pikiran → Fakta → Sudut pandang), tombol "Simpan Reframing", riwayat pasangan "Pikiran awal → Seimbang". Surat: judul, isi, `tanggal buka`, status `🔒 Terkunci` / `🌷 Terbuka`, dan tombol uji "Buka sekarang (uji)" + tooltip. |
| C-06 | **Safe Space & Daily Affirmation** | Dua kartu bersebelahan di desktop, bertumpuk di mobile. Kiri: latar blush, teks fase besar (Tarik 4s / Tahan 4s / Hembus 6s), progress "Siklus 1/3", lingkaran napas (dekoratif CSS), tombol "Mulai / Berhenti". Kanan: quote Playfair afirmasi + tombol "Afirmasi lain". |
| C-07 | **My Growth Journey** | 4 stat card 2×2 mobile / 4 kolom desktop: Total Check-In, Cuaca Terakhir, Jurnal, Little Wins. Angka besar Playfair, label DM Sans. Bonus kecil: reframe & surat terbuka. Badge "Data contoh (bukan data pribadi)" bila seed aktif. Tombol sekunder "Muat ulang data contoh" · "Hapus semua data". |
| C-08 | **Disclaimer permanen** | Footer every halaman + caption di C-04. Teks: *"Dear Me adalah ruang refleksi, bukan alat diagnosis medis dan bukan pengganti bantuan profesional."* Ukuran 12px, charcoal, latar cream, border atas blush. Tidak boleh disembunyikan. |
| C-09 | **Toast (feedback)** | Muncul 2,5 detik di bawah header: "Tersimpan 🌷" / "Gagal menyimpan, coba hapus entri lama." Latar charcoal, teks cream, radius pill. Dipakai juga untuk konfirmasi hapus. |

---

## 3. Wireframe Teks — Desktop (≥ 900 px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ◐ Dear Me   Beranda│Jurnal│Reframing│Surat│Safe Space│Journey        │ C-01
├──────────────────────────────────────────────────────────────────────┤
│  A Little Space to Heal, Grow, and Bloom        [ Mulai Check-In ]   │ C-02
│  Ruang kecil untuk merasa, bukan untuk dinilai.                      │
├────────────────────────────────┬─────────────────────────────────────┤
│ DAILY CHECK-IN         C-03    │ EMOTIONAL REPORT            C-04    │
│ How are you, really?           │ ⛅ Berawan · Rabu, 19 Nov           │
│ [☀️][🌿][😮‍💨][🌀][🌧️][⛈️]       │ "Hari ini terasa seperti berawan.  │
│ Tidur  ●●●●○    Energi ●●●○○   │  Itu tidak apa-apa."                │
│ Kebutuhan: [Istirahat][Fokus]  │ ┌─────────────────────────────────┐ │
│ Pikiran hari ini ______ 0/140  │ │ A Little Reminder For You       │ │
│ [      Simpan Check-In      ]  │ │ "Kamu tidak harus menyelesaikan │ │
│                                │  semuanya hari ini."              │ │
│                                │ └─────────────────────────────────┘ │
│                                │ 🌿 Jalan kaki 5 menit tanpa ponsel │
│                                │ ⓘ Refleksi, bukan diagnosis medis │
├────────────────────────────────┴─────────────────────────────────────┤
│ SAFE SPACE C-06                          │ DAILY AFFIRMATION C-06     │
│ [Mulai]  Tarik...        Siklus 1/3       │ "Aku boleh tumbuh pelan." │
│ (lingkaran napas)                        │ [Afirmasi lain]           │
├──────────────────────────────────────────────────────────────────────┤
│ MY GROWTH JOURNEY C-07                                               │
│ ┌────────┬────────┬────────┬────────┐  [Muat ulang data] [Hapus semua]│
│ │ 12     │ ⛅      │ 8      │ 5      │                                  │
│ │Check-In│Berawan │Jurnal  │Wins    │  badge: Data contoh              │
│ └────────┴────────┴────────┴────────┘                                  │
├──────────────────────────────────────────────────────────────────────┤
│ ⓘ Dear Me adalah ruang refleksi, bukan alat diagnosis medis dan      │ C-08
│   bukan pengganti bantuan profesional.                                │
└──────────────────────────────────────────────────────────────────────┘
```
Catatan: memilih tab **Jurnal / Reframing / Surat** mengganti area tengah dengan form + riwayat sesuai C-05/C-05b; header, journey ringkas, dan footer tetap.

---

## 4. Wireframe Teks — Mobile (360–600 px)

```
┌───────────────────────┐
│ ◐ Dear Me             │ C-01 (header tipis)
├───────────────────────┤
│ A Little Space to     │ C-02
│ Heal, Grow & Bloom    │
│ Ruang kecil untuk...  │
│ [  Mulai Check-In  ]  │
├───────────────────────┤
│ DAILY CHECK-IN        │ C-03
│ [☀️][🌿][😮‍💨]          │ 3×2 grid
│ [🌀][🌧️][⛈️]          │
│ Tidur   ●●●○○         │
│ Energi  ●●●●○         │
│ Kebutuhan             │
│ [Istirahat][Fokus]    │ wrap
│ Pikiran ______ 0/140  │
│ [    Simpan     ]     │ tombol penuh
├───────────────────────┤
│ ⛅ LAPORAN EMOSI      │ C-04
│ Berawan · 19 Nov      │
│ "Hari ini terasa..."  │
│ ┌ A Little Reminder ┐ │
│ │ "Kamu tidak harus"│ │
│ └───────────────────┘ │
│ 🌿 Jalan 5 menit      │
│ ⓘ Bukan diagnosis    │
├───────────────────────┤
│ SAFE SPACE            │ C-06
│ [Mulai] Tarik... 1/3  │
├───────────────────────┤
│ AFIRMASI HARIAN       │ C-06
│ "Aku boleh tumbuh..." │
│ [Afirmasi lain]       │
├───────────────────────┤
│ GROWTH JOURNEY   C-07 │
│ ┌────────┬────────┐   │ 2×2
│ │12      │⛅      │   │
│ │Check-In│Berawan │   │
│ ├────────┼────────┤   │
│ │8 Jurnal│5 Wins  │   │
│ └────────┴────────┘   │
│ [Data contoh] [Reset] │
├───────────────────────┤
│ Beranda│Jurnal│Refram…│ bottom tabs (scroll-x) C-01
├───────────────────────┤
│ ⓘ Bukan diagnosis medis│ C-08 permanen
└───────────────────────┘
```

---

## 5. Aturan UI Tambahan (interpretasi desain)

- **Hirarki:** satu H1 per halaman; setiap kartu punya maks. satu H2/H3 + satu aksi utama.
- **Bahasa:** copy Indonesia santai; judul Inggris hanya pada hero, "A Little Reminder For You", dan nama tab sesuai `SPEC.md`.
- **Ikon:** emoji untuk cuaca/mood/little win (tanpa library). Ikon dekoratif `aria-hidden="true"`.
- **Teks pengguna:** selalu dirender sebagai teks biasa, tidak pernah di-`innerHTML` (AC-18).
- **Target sentuh:** minimal `44×44px` untuk chip dan tombol di mobile.
- **Form:** label di atas input, placeholder sebagai contoh (bukan pengganti label), atribut `autocomplete` sesuai, error inline berwarna mauve (`--mauve`) bukan merah menyala.
- **Napas:** saat timer jalan, tombol Berhenti tetap terlihat; phase ditampilkan sebagai teks besar, bukan hanya warna.
- **Surat terkunci:** isi tidak dirender sama sekali sampai status terbuka (jangan sekadar disembunyikan dengan CSS).
- **Seed:** badge "Data contoh" muncul di Journey sampai pengguna menyimpan data sendiri.

---

## 6. Daftar Cek UI (5 menit)

| # | Cek | Lolos |
|---|---|---|
| 1 | Teks charcoal/mauve di atas cream/blush terbaca jelas | ☐ |
| 2 | Rose & blush tidak dipakai untuk teks kecil | ☐ |
| 3 | Focus ring mauve terlihat saat Tab | ☐ |
| 4 | Font lokal/fallback; Network tidak memuat domain eksternal | ☐ |
| 5 | 360 px: tanpa scroll horizontal, tombol ≥ 44px | ☐ |
| 6 | Satu aksi utama per kartu, tidak ada form bertumpuk | ☐ |
| 7 | Disclaimer terlihat di report **dan** footer | ☐ |
| 8 | Chip mood terpilih jelas (border + latar + centang) | ☐ |
| 9 | Ikon cuaca (cerah/berawan/hujan/badai) konsisten dengan label | ☐ |
| 10 | Surat terkunci tidak menampilkan isi di DOM | ☐ |
