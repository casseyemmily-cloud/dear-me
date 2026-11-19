/**
 * logic.js — fungsi murni untuk pengolahan data Dear Me.
 *
 * Semua fungsi di sini:
 * - tidak menyentuh DOM
 * - tidak menyentuh localStorage
 * - tidak mengubah array/objek yang diterima (immutable)
 * - bisa dipanggil langsung dari Console untuk pengujian manual
 */

/** Urutkan entri terbaru lebih dulu tanpa mengubah array asli. */
export function sortByNewest(entries, key = 'tanggal') {
  return [...entries].sort((a, b) =>
    String(b?.[key] ?? '').localeCompare(String(a?.[key] ?? '')),
  );
}

/** Ambil n entri pertama (dipakai untuk batas tampilan riwayat). */
export function takeFirst(entries, count) {
  return entries.slice(0, Math.max(0, count));
}

/** Cek apakah sebuah entri jurnal memiliki little win. */
export function hasLittleWin(entry) {
  return Boolean(entry?.littleWin && String(entry.littleWin).trim() !== '');
}

/** Hitung jumlah little win dari sekumpulan jurnal. */
export function countLittleWins(entries) {
  return entries.filter(hasLittleWin).length;
}

/** Ambil suasana hati dari check-in terakhir untuk mengisi form jurnal. */
export function latestMood(checkins) {
  return checkins?.[0]?.suasanaHati ?? '';
}

/**
 * Pilih daftar pertanyaan reflektif berdasarkan topik, lalu mood.
 * Fallback ke topik "Umum" bila keduanya tidak ditemukan.
 */
export function questionsFor({ topik, mood, sources, fallback = 'Umum' }) {
  const dariMood = mood ? sources?.[mood] : null;
  const dariTopik = topik && topik !== fallback ? sources?.[topik] : null;
  if (dariTopik?.length) return dariTopik;
  if (dariMood?.length) return dariMood;
  return sources?.[fallback] ?? [];
}

/**
 * Ambil item berikutnya secara melingkar.
 * Dipakai tombol "Pertanyaan lain" dan "Afirmasi lain".
 */
export function nextItem(list, currentIndex) {
  if (!list.length) return { item: '', index: -1 };
  const index = (((currentIndex + 1) % list.length) + list.length) % list.length;
  return { item: list[index], index };
}

/** Filter jurnal berdasarkan mood (disiapkan sebagai fungsi murni). */
export function filterJournalsByMood(entries, mood) {
  if (!mood) return [...entries];
  return entries.filter((entry) => entry.mood === mood);
}

/** Cari jurnal berdasarkan judul atau isi, case-insensitive (fungsi murni). */
export function searchJournals(entries, query) {
  const kata = String(query ?? '').trim().toLocaleLowerCase('id-ID');
  if (!kata) return [...entries];
  return entries.filter((entry) =>
    `${entry.judul ?? ''} ${entry.isi ?? ''}`.toLocaleLowerCase('id-ID').includes(kata),
  );
}

/** F-05: gabungkan pikiran awal + fakta ringkas menjadi satu field model. */
export function combineReframe(pikiran, fakta) {
  const awal = String(pikiran ?? '').trim();
  const ringkas = String(fakta ?? '').trim();
  if (!awal) return ringkas;
  if (!ringkas) return awal;
  return `${awal} · Fakta: ${ringkas}`;
}

/** F-06: surat terbuka bila ditandai terbuka ATAU tanggal buka sudah tiba. */
export function isLetterOpen(letter, todayISO) {
  if (!letter) return false;
  const tanggal = String(letter.tanggalBuka ?? '');
  return Boolean(letter.terbuka) || (tanggal !== '' && tanggal.localeCompare(String(todayISO)) <= 0);
}

/** F-08: data masih berupa contoh bila semua entri ber-ID "seed-". */
export function hasUserData(data) {
  return Object.values(data ?? {}).some(
    (items) => Array.isArray(items) && items.some((item) => !String(item?.id ?? '').startsWith('seed-')),
  );
}

/** F-08: ringkasan angka Journey dihitung penuh dari data (fungsi murni). */
export function buildJourneySummary(data, todayISO) {
  const checkins = sortByNewest(data?.checkins ?? []);
  const journals = data?.journals ?? [];
  const reframes = data?.reframes ?? [];
  const letters = data?.letters ?? [];
  const terakhir = checkins[0] ?? null;
  const totalEntri = checkins.length + journals.length + reframes.length + letters.length;

  return {
    totalCheckIns: checkins.length,
    cuacaTerakhir: terakhir?.cuacaEmosi ?? null,
    tanggalTerakhir: terakhir?.tanggal ?? null,
    totalJurnal: journals.length,
    totalLittleWins: countLittleWins(journals),
    totalReframe: reframes.length,
    totalSuratTerbuka: letters.filter((letter) => isLetterOpen(letter, todayISO)).length,
    dataContoh: totalEntri > 0 && !hasUserData(data),
  };
}
