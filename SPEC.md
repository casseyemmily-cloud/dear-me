# SPECifikasi Aplikasi "Dear Me"

> **A Little Space to Heal, Grow, and Bloom**

| Field | Nilai |
|---|---|
| Versi dokumen | 1.0 |
| Tanggal | 19 November 2026 |
| Status | Draft final — siap untuk implementasi 1 hari |
| Peran penulis | System Analyst & Software Engineer |
| Target pengiriman | 1 hari latihan (≤ 8 jam efektif), dapat diuji manual di browser |

---

## 1. Tujuan

"Dear Me" adalah aplikasi web statis (client-side) untuk membantu individu melakukan **refleksi emosional harian** dan **pertumbuhan diri** dengan cara yang ringan, tenang, dan tidak mengintimidasi. Aplikasi ini menyediakan satu ruang aman untuk:

1. Memeriksa kondisi emosional harian melalui kuis singkat.
2. Membaca ringkasan emosi dalam bentuk metafora cuaca plus pengingat dan saran self-care.
3. Menulis jurnal, mencatat kemenangan kecil (*little wins*), dan melihat riwayatnya.
4. Mendapatkan pertanyaan reflektif otomatis dari simulasi AI lokal (rule-based).
5. Melatih reframing pikiran dengan format 3 bagian.
6. Menulis surat untuk masa depan dengan status terkunci/terbuka.
7. Beristirahat melalui latihan pernapasan dan afirmasi harian.
8. Melihat ringkasan perjalanan pertumbuhan dari data lokal.

**Prinsip desain utama:** sederhana, cepat selesai, tidak medis, tidak bergantung pada layanan eksternal, dan seluruh data tetap berada di perangkat pengguna (`localStorage`).

---

## 2. Pengguna

| Karakteristik | Detail |
|---|---|
| Persona | Individu (pengguna tunggal pada satu perangkat/browser) |
| Kebutuhan | Cek emosi harian, menulis refleksi, reframing pikiran, surat masa depan, istirahat sejenak |
| Konteks penggunaan | 3–10 menit per sesi, bisa dibuka kapan saja, tanpa akun |
| Kemampuan teknis | Nyaman menggunakan browser modern; tidak perlu tahu istilah teknis |
| Privasi | Data bersifat pribadi dan tidak pernah dikirim ke server mana pun |

Asumsi: tidak ada multi-user, tidak ada sinkronisasi antar-perangkat, tidak ada peran/admin.

---

## 3. Fitur MVP (Prioritas Selesai 1 Hari)

Semua fitur dibuat ringkas dan fungsional. Satu halaman utama (dashboard) dengan navigasi tab/section, tanpa form yang berlapis-lapis.

### F-01 — Daily Emotional Check-In
- Kuis singkat **4 pertanyaan** (dapat dikembangkan ke 5 bila waktu memungkinkan):
  1. **Suasana hati hari ini** → pilihan: Senang, Tenang, Lelah, Cemas, Sedih, Marah.
  2. **Kualitas tidur** → skala 1–5 (slider atau tombol bintang).
  3. **Tingkat energi** → skala 1–5.
  4. **Kebutuhan hari ini** → pilihan ganda: Istirahat, Ditemani, Fokus, Momentum, Tidak tahu.
- (Opsional ke-5) **Pikiran yang paling sering muncul** → teks bebas singkat, maks. 140 karakter.
- Tombol **Simpan Check-In** → menulis `CheckInEntry` ke `localStorage`.
- Setelah simpan, langsung menampilkan hasil (lihat F-02). Satu entri per tanggal; bila pengguna mengisi ulang hari yang sama, entri diperbarui (bukan duplikat).

### F-02 — Emotional Report, Weather & Little Reminder
- Hitung `cuacaEmosi` secara rule-based dari mood + energi + tidur:
  - `cerah` → mood Senang/Tenang **dan** energi ≥ 3.
  - `berawan` → mood Tenang/Lelah dengan energi 2–3, atau nilai netral.
  - `hujan` → mood Sedih/Cemas, atau tidur ≤ 2.
  - `badai` → mood Marah/Cemas **dan** energi ≤ 2 (prioritas tertinggi).
- Tampilkan kartu ringkasan: ikon cuaca (emoji), label cuaca, tanggal, dan kalimat ringkas non-diagnostik, mis. *"Hari ini terasa seperti berawan. Itu tidak apa-apa."*
- Kartu **A Little Reminder For You** (1 kalimat acak dari daftar statis, mis. *"Kamu tidak harus menyelesaikan semuanya hari ini."*).
- 1–2 saran aktivitas self-care singkat dari peta statis per cuaca:
  - Cerah → "Tulis satu hal yang kamu syukuri hari ini."
  - Berawan → "Jalan kaki 5 menit tanpa ponsel."
  - Hujan → "Minum air hangat dan tarik napas pelan 3 kali."
  - Badai → "Ambil jeda 2 menit dari layar, lalu coba latihan napas di Safe Space."
- Teks disclaimer kecil: *"Ringkasan ini adalah refleksi, bukan diagnosis medis."*

### F-03 — My Journal & Little Wins
- Form ringkas: **judul** (opsional), **isi jurnal** (textarea), **little win hari ini** (input pendek, opsional), dan **mood** (bisa terisi otomatis dari check-in terakhir, masih bisa diubah).
- Tombol **Simpan Jurnal** → menulis `JournalEntry`.
- Riwayat ditampilkan sebagai kartu-kartu kronologis (terbaru atas) berisi tanggal, judul, isi, little win, dan pertanyaan reflektif yang dipakai.
- Tombol **Hapus** per entri (dengan konfirmasi sederhana).
- Batas tampilan: 10 entri terakhir dengan tombol "Tampilkan lebih banyak" bila perlu (hindari DOM berat).

### F-04 — AI Journal Companion (Simulasi Lokal / Rule-Based)
- Tidak ada backend, tidak ada API, tidak ada API key.
- Dropdown **topik refleksi**: Umum / Hubungan / Kerja & Studi / Rasa Lelah / Rasa Cemas / Syukur.
- Saat topik dipilih (atau mood berubah), sistem menampilkan **1 pertanyaan reflektif** dari peta statis `topik/mood → daftar pertanyaan`, dipilih secara berurutan atau acak deterministik.
  - Contoh: topik "Rasa Lelah" → *"Apa yang paling menguras energimu hari ini, dan apa yang bisa kamu tunda?"*
  - Contoh mood "Cemas" → *"Apa bagian dari rasa cemas ini yang bisa kamu beri nama?"*
- Tombol **Pertanyaan lain** → mengambil pertanyaan berikutnya dari daftar.
- Pertanyaan yang terpilih ikut tersimpan di `JournalEntry.pertanyaanReflektif`.
- Label UI jujur: *"Pertanyaan ini dibuat otomatis dari pola sederhana di perangkatmu."* (tidak mengklaim AI generatif).

### F-05 — Thought Reframing
- Form 3 bagian:
  1. **Pikiran yang muncul** (textarea)
  2. **Fakta / evaluasi singkat** (textarea) — *catatan: model data menyimpan ringkasan ini yang digabung ke `pikiranAwal` atau field opsional `faktaSingkat`*
  3. **Sudut pandang yang lebih seimbang** (textarea)
- Tombol **Simpan Reframing** → menulis `ReframeEntry` (`pikiranAwal` = teks bagian 1 + ringkasan bagian 2, `sudutPandangSeimbang` = bagian 3).
- Riwayat menampilkan pasangan "Pikiran awal → Sudut pandang seimbang" dengan tanggal, plus tombol hapus.

### F-06 — Letters to Future Me
- Form: **judul**, **isi surat**, **tanggal buka** (`<input type="date">`, minimal besok).
- Tombol **Simpan Surat** → menulis `FutureLetter` dengan `terbuka: false`.
- Daftar surat menampilkan status:
  - `🔒 Terkunci` + tanggal buka bila `terbuka === false`.
  - `🌷 Terbuka` + isi surat bila `terbuka === true` atau tanggal buka ≤ hari ini.
- **Tombol uji/buka surat** pada setiap kartu: "Buka sekarang (uji)" yang menandai `terbuka: true` — disediakan khusus agar mudah diverifikasi manual dalam 1 hari, diberi label jelas sebagai mode uji.
- Tombol hapus surat.

### F-07 — Safe Space & Daily Affirmation
- Latihan pernapasan sederhana dengan panduan teks + timer:
  - Pola default **Tarik (4 detik) → Tahan (4 detik) → Hembus (6 detik)**, 3 siklus.
  - Tombol **Mulai / Berhenti**. Teks besar berubah mengikuti fase; progress "Siklus 1/3".
  - Implementasi dengan `setInterval` + `clearInterval` di JS vanilla; tidak boleh berjalan terus saat pindah tab (dihentikan saat tombol Berhenti).
- Kartu **Afirmasi Harian**: 1 kalimat acak dari daftar statis (mis. *"Aku boleh tumbuh dengan pelan."*) + tombol **Afirmasi lain**.

### F-08 — My Growth Journey
- Ringkasan angka dari `localStorage`:
  - Total check-in.
  - Cuaca emosi terakhir (ikon + label).
  - Jumlah jurnal.
  - Jumlah *little wins* (entri jurnal dengan `littleWin` tidak kosong).
  - (Bonus murah) Jumlah reframing & surat terbuka.
- **Data contoh nonpribadi** (seed) otomatis dibuat saat aplikasi pertama dibuka (belum ada kunci `localStorage`), misalnya:
  - 1 check-in "Tenang / berawan" dengan energi 3, tidur 4.
  - 1 jurnal berjudul "Hari yang pelan" dengan little win "Berhasil bangun tepat waktu".
  - 1 reframe contoh dan 1 surat contoh dengan tanggal buka sudah lewat (status terbuka).
- Tombol **Muat ulang data contoh** dan **Hapus semua data** (dengan konfirmasi) untuk keperluan uji manual.
- Penanda jelas di UI: *"Data contoh (bukan data pribadi)"* sehingga pengguna tidak mengira itu riwayat aslinya.

---

## 4. Model Data

Seluruh data disimpan di `localStorage` browser dengan kunci namespace `dearme:*`. Format: array JSON per entitas, diurutkan terbaru lebih dulu saat ditampilkan.

### 4.1 `CheckInEntry`
```js
{
  id: string,            // crypto.randomUUID() atau fallback Date.now()+random
  tanggal: string,       // ISO "YYYY-MM-DD" (lokal)
  suasanaHati: string,   // "Senang"|"Tenang"|"Lelah"|"Cemas"|"Sedih"|"Marah"
  cuacaEmosi: string,    // "cerah"|"berawan"|"hujan"|"badai"
  energi: number,        // 1..5
  tidur: number,         // 1..5
  kebutuhan: string,     // "Istirahat"|"Ditemani"|"Fokus"|"Momentum"|"Tidak tahu"
  pikiranRingkas?: string, // maks 140 karakter (opsional)
  saranAktivitas: string // teks saran dari peta statis
}
```
Kunci penyimpanan: `dearme:checkins`. **Aturan:** unik per `tanggal` (upsert).

### 4.2 `JournalEntry`
```js
{
  id: string,
  tanggal: string,          // ISO datetime lokal
  mood: string,             // dari check-in terakhir atau pilihan pengguna
  judul: string,            // boleh kosong → fallback "Refleksi tanpa judul"
  isi: string,
  littleWin: string,        // boleh kosong
  pertanyaanReflektif: string // dari F-04
}
```
Kunci: `dearme:journals`.

### 4.3 `ReframeEntry`
```js
{
  id: string,
  tanggal: string,
  pikiranAwal: string,          // pikiran + ringkasan fakta/evaluasi
  sudutPandangSeimbang: string
}
```
Kunci: `dearme:reframes`.
> Catatan analisis: spesifikasi field hanya memuat `pikiranAwal` dan `sudutPandangSeimbang`. Input "fakta/evaluasi singkat" digabung ke `pikiranAwal` agar model tetap sesuai kontrak. Jika ingin memisahkan, tambahkan `faktaSingkat?: string` sebagai field opsional — keputusan ini diambil di Iterasi 2 bila waktu memungkinkan.

### 4.4 `FutureLetter`
```js
{
  id: string,
  tanggalBuat: string,  // ISO datetime
  tanggalBuka: string,  // ISO "YYYY-MM-DD"
  judul: string,
  isiSurat: string,
  terbuka: boolean      // true manual (uji) atau setelah tanggal buka
}
```
Kunci: `dearme:letters`.

### 4.5 Konstanta internal (kode, bukan data pengguna)
- `WEATHER_RULES`, `WEATHER_META` (ikon, label, kalimat, saran).
- `REMINDERS[]`, `AFFIRMATIONS[]`, `REFLECTIVE_QUESTIONS` (peta topik/mood).
- `SEED_DATA` (data contoh nonpribadi).
- `STORAGE_KEYS`, helper `load(key)`, `save(key, value)`, `uid()`.

---

## 5. Nonfunctional Requirements

| ID | Kategori | Requirement |
|---|---|---|
| NFR-01 | Arsitektur | Vite + JavaScript vanilla (HTML/CSS/JS). Tanpa framework, tanpa backend, tanpa build step rumit. |
| NFR-02 | Jaringan | **Nol pemanggilan API eksternal** (termasuk LLM, analytics, font/CDN berbayar). Aplikasi tetap berfungsi offline setelah halaman dimuat. |
| NFR-03 | Keamanan | Tidak menyimpan API key, token, atau kredensial apa pun di kode maupun `localStorage`. Tidak ada autentikasi/login palsu. |
| NFR-04 | Privasi | Semua data hanya di browser pengguna. Tidak ada pengiriman data ke server. Tidak ada cookie pelacakan. |
| NFR-05 | Keamanan UI | Seluruh teks pengguna dirender sebagai **teks** (`textContent`), bukan `innerHTML`, untuk mencegah XSS dari input jurnal/surat. |
| NFR-06 | Ketahanan data | `localStorage` dibaca dengan `try/catch` + fallback array kosong bila JSON rusak. Simpan gagal (kuota penuh) ditampilkan sebagai pesan ramah. |
| NFR-07 | UI/UX | Bersih, tenang, palet warna lembut (mis. hangat/lembut), responsif minimal di layar ≥ 360 px. Maksimal 1 aksi utama per kartu. Tidak lebih dari ~6 kartu per layar sebelum scroll. |
| NFR-08 | Aksesibilitas | Label pada semua input, kontras teks memadai, fokus keyboard terlihat, tombol punya teks jelas (bukan ikon saja). |
| NFR-09 | Performa | Initial load < 2 detik di localhost. Tidak ada library berat. Timer napas dibersihkan saat berhenti. |
| NFR-10 | Disclaimer | Disclaimer "bukan alat diagnosis medis / bukan pengganti bantuan profesional" tampil permanen di footer dan di kartu laporan emosi. |
| NFR-11 | Konsistensi | Semua tanggal diformat lokal (mis. `Intl.DateTimeFormat('id-ID')`), bukan UTC mentah. |
| NFR-12 | Bahasa | Seluruh copy UI berbahasa Indonesia, santai, tidak menghakimi, tidak menggunakan jargon klinis. |

---

## 6. Risiko

| ID | Risiko | Dampak | Prob. | Mitigasi |
|---|---|---|---|---|
| R-01 | **Scope creep**: keinginan menambah grafik tren, kalender mood, export PDF, atau "AI" sungguhan | Waktu habis, MVP tidak selesai | Tinggi | Kunci daftar F-01..F-08 sebagai satu-satunya acceptance. Fitur baru masuk backlog **setelah** semua kriteria lolos. |
| R-02 | Overengineering rule-based companion jadi "AI" (prompt, embedding, model) | Melanggar batasan tanpa API key | Sedang | Gunakan peta pertanyaan statis + rotasi; beri label jujur "pola sederhana". |
| R-03 | Timer napas berjalan ganda / bocor saat pindah tab | UI phase kacau | Sedang | Simpan handle interval, `clearInterval` sebelum start ulang & saat Berhenti/unmount. |
| R-04 | Data contoh tertimpa data nyata sehingga pengguna bingung | Kepercayaan turun | Sedang | Seed hanya jika kunci belum ada; beri badge "Data contoh"; sediakan tombol hapus/muat ulang. |
| R-05 | Upsert check-in harian salah (duplikat entri) | Angka journey dobel | Sedang | Cari berdasarkan `tanggal`, ganti elemen bila ada, bukan `push`. |
| R-06 | XSS lewat isi surat/jurnal | Risiko keamanan | Rendah | Wajib `textContent` / `createElement`, dilarang `innerHTML` untuk data pengguna. |
| R-07 | `localStorage` penuh / mode privat browser | Simpan gagal tanpa feedback | Rendah | Try/catch + toast "Gagal menyimpan, coba hapus entri lama." |
| R-08 | Interpretasi cuaca dianggap diagnosis | Pelanggaran disclaimer | Sedang | Kalimat selalu non-klinis + disclaimer di dua tempat (NFR-10). |
| R-09 | Terlalu banyak form di satu layar | Pengguna overwhelmed, lama selesai | Sedang | Section tersembunyi di balik tab; satu form aktif per tab; gunakan detail/summary untuk riwayat. |
| R-10 | Tombol "Buka sekarang (uji)" disalahartikan sebagai fitur produksi | Surat terbuka sebelum waktunya | Rendah | Label eksplisit "(uji)" + tooltip "Untuk verifikasi manual". |

---

## 7. Out of Scope

Dilarang masuk dalam implementasi 1 hari ini:

1. **Integrasi LLM / AI API eksternal** (OpenAI, Gemini, Anthropic, dll.), API key, atau pemanggilan jaringan berbayar.
2. **Backend / database server** (Node API, Firebase, Supabase, SQLite server, dll.).
3. **Sistem login / autentikasi** (termasuk login palsu, register, reset password, multi-user).
4. **Notifikasi email / push otomatis** (service worker, Web Push, email scheduler).
5. Analitik, tracking, iklan, atau telemetry.
6. Grafik tren multi-hari, kalender mood, ekspor PDF/CSV, berbagi ke media sosial.
7. Mode gelap, internasionalisasi multi-bahasa, PWA/offline caching yang kompleks.
8. Penerapan psikoterapi formal (CBT penuh, penilaian risiko bunuh diri, dll.) — aplikasi hanya refleksi ringan.

---

## 8. Acceptance Criteria (Dapat Diuji Manual di Browser)

Prasyarat: `npm install && npm run dev`, buka URL lokal di Chrome/Edge/Firefox. Bersihkan `localStorage` atau gunakan tombol "Hapus semua data" untuk memulai.

| ID | Fitur | Langkah Uji | Hasil Diharapkan |
|---|---|---|---|
| AC-01 | Seed data | Buka aplikasi pertama kali | Muncul badge "Data contoh"; Journey menampilkan angka > 0; tidak ada data pribadi. |
| AC-02 | Check-in | Isi 4 pertanyaan, klik Simpan Check-In | Muncul kartu laporan dengan ikon cuaca, reminder, dan saran; entri tersimpan di `dearme:checkins`. |
| AC-03 | Check-in dedup | Isi lagi tanggal sama, simpan | Jumlah entri untuk tanggal itu tetap 1 (nilai diperbarui). |
| AC-04 | Cuaca badai | Pilih Marah + energi 1 + tidur 1 | Cuaca tampil `badai` bukan `berawan`. |
| AC-05 | Disclaimer | Lihat card laporan & footer | Teks "bukan diagnosis medis / bukan pengganti bantuan profesional" terlihat. |
| AC-06 | Companion | Pilih topik "Rasa Lelah", klik "Pertanyaan lain" | Pertanyaan berubah dari daftar statis; tidak ada request jaringan di tab Network. |
| AC-07 | Jurnal | Tulis judul, isi, little win; simpan | Kartu muncul di riwayat beserta pertanyaan reflektif; tersimpan di `dearme:journals`. |
| AC-08 | Jurnal hapus | Klik Hapus pada kartu + konfirmasi | Kartu hilang dari tampilan dan storage. |
| AC-09 | Reframing | Isi 3 bagian, simpan | Riwayat menampilkan "Pikiran awal → Sudut pandang seimbang"; tersimpan di `dearme:reframes`. |
| AC-10 | Surat | Buat surat dengan tanggal buka besok, simpan | Status `🔒 Terkunci`, isi surat belum tampil. |
| AC-11 | Surat uji | Klik "Buka sekarang (uji)" | Status berubah `🌷 Terbuka`, isi surat tampil, `terbuka: true` tersimpan. |
| AC-12 | Surat lewat waktu | Muat data contoh / buat surat dengan tanggal buka kemarin | Otomatis tampil terbuka tanpa klik uji. |
| AC-13 | Napas | Klik Mulai, amati 3 siklus 4-4-6 | Teks fase berganti Tarik→Tahan→Hembus, progress 1/3→3/3, lalu selesai. |
| AC-14 | Napas berhenti | Klik Berhenti di tengah siklus | Timer berhenti, teks kembali ke instruksi awal, tidak ada fase yang terus berjalan. |
| AC-15 | Afirmasi | Klik "Afirmasi lain" | Kalimat berubah dari daftar statis. |
| AC-16 | Journey | Tambah 1 jurnal + 1 check-in, buka Journey | Angka total check-in & jurnal bertambah; cuaca terakhir mengikuti check-in terakhir. |
| AC-17 | Reset data | Klik "Hapus semua data" + konfirmasi | Semua kartu kosong; klik "Muat ulang data contoh" → seed kembali. |
| AC-18 | XSS dasar | Masukkan `<img src=x onerror=alert(1)>` di isi jurnal | Teks tampil apa adanya sebagai string, tidak ada alert / gambar rusak dieksekusi. |
| AC-19 | Offline/network | Matikan network di DevTools, refresh, pakai aplikasi | Aplikasi tetap berfungsi (aset lokal), tab Network kosong dari domain eksternal. |
| AC-20 | Responsif | Ubah lebar jendela ke 375 px | Tidak ada scroll horizontal; tombol masih bisa diketuk. |

**Definisi Selesai (DoD):** AC-01 sampai AC-20 lolos, tidak ada error di Console, dan `README.md` berisi cara menjalankan serta catatan disclaimer.

---

## 9. Implementation Plan (Maksimal 3 Iterasi — 1 Hari)

### Iterasi 1 — Fondasi + Check-In + Laporan (≈ 2,5 jam)
**Tujuan:** Aplikasi bisa dijalankan, pengguna bisa check-in dan melihat hasilnya.

- Inisialisasi proyek Vite vanilla (`npm create vite@latest dear-me -- --template vanilla`), struktur `index.html`, `src/main.js`, `src/style.css`.
- Bangun layout dashboard + tab navigasi (Home / Jurnal / Reframing / Surat / Safe Space / Journey).
- Implementasi helper storage (`load`, `save`, `uid`), `STORAGE_KEYS`, dan seed data nonpribadi.
- F-01 form check-in + validasi ringan + upsert per tanggal.
- F-02 hitung cuaca (rule-based), kartu laporan, reminder, saran aktivitas, disclaimer.
- NFR-10, NFR-11, NFR-12 (copy Bahasa Indonesia) sejak awal.
- **Keluar Iterasi 1:** AC-01..AC-05 lolos.

### Iterasi 2 — Jurnal, Companion, Reframing, Surat (≈ 3 jam)
**Tujuan:** Seluruh fitur tulis-menulis dan riwayat berfungsi.

- F-04 peta `REFLECTIVE_QUESTIONS` + tombol "Pertanyaan lain" (deterministik/acak lokal).
- F-03 form jurnal + little win + riwayat kartu + hapus (pakai `textContent`).
- F-05 form reframing 3 bagian + riwayat + hapus (keputusan `faktaSingkat` opsional diambil di sini).
- F-06 form surat, perhitungan status terkunci/terbuka, tombol uji/buka, hapus.
- Terapkan NFR-05 (anti-XSS) dan NFR-06 (try/catch storage) secara menyeluruh.
- **Keluar Iterasi 2:** AC-06..AC-12, AC-18 lolos.

### Iterasi 3 — Safe Space, Journey, Polish & Verifikasi (≈ 2,5 jam)
**Tujuan:** Tutup fitur yang tersisa, rapikan UI, dan pastikan semua AC lolos.

- F-07 timer napas 4-4-6 ×3 dengan start/stop yang aman + kartu afirmasi.
- F-08 ringkasan angka + tombol reset/muat ulang seed + badge data contoh.
- NFR-07/08/09: kerapian visual, fokus keyboard, label, responsive 360–375 px.
- Tambah disclaimer footer permanen (bila belum).
- Tulis `README.md` (cara install/run, struktur data, catatan "bukan diagnosis medis").
- Uji manual menyeluruh AC-01..AC-20; perbaiki bug Console.
- **Keluar Iterasi 3:** DoD terpenuhi, siap demonstrasi.

### Buffer (≈ 30 menit)
Cadangan untuk bug tak terduga. **Tidak boleh** dipakai untuk menambah fitur baru (lihat R-01).

---

## 10. Disclaimer (Wajib Ditampilkan)

> **Dear Me adalah ruang refleksi pribadi, bukan alat diagnosis medis dan bukan pengganti bantuan profesional.** Ringkasan cuaca emosi, pertanyaan reflektif, dan latihan di dalamnya hanya berupa panduan sederhana berbasis aturan yang dibuat di perangkatmu. Jika kamu sedang mengalami kesulitan berat atau membutuhkan dukungan, silakan hubungi tenaga kesehatan mental atau layanan bantuan di wilayahmu.

---

## 11. Lampiran — Keputusan Desain Ringkas

| Keputusan | Alasan |
|---|---|
| 4 pertanyaan check-in (opsional ke-5) | Cepat diisi < 2 menit, mengurangi friction harian. |
| Cuaca dihitung, bukan dipilih | Konsisten dengan nama fitur "Emotional Weather" dan menjaga ukuran tetap ringan. |
| Satu entri check-in per hari | Mencegah angka Journey dobel; sesuai ritme harian. |
| Companion = peta pertanyaan statis | Memenuhi "simulasi lokal / rule-based", nol API key. |
| Tombol buka surat diberi label "(uji)" | Memungkinkan verifikasi manual tanpa menunggu tanggal. |
| Seed data otomatis + badge | Dashboard tidak kosong saat pertama dibuka, tapi tetap jujur. |
| Tanpa framework | Sesuai stack Vite + vanilla JS, lebih cepat selesai 1 hari. |
