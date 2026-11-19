/**
 * constants.js — satu-satunya sumber data statis & konfigurasi aplikasi.
 * Tidak ada data pribadi di sini. Semua teks contoh bersifat nonpribadi.
 */

export const APP_NAME = 'Dear Me';
export const APP_TAGLINE = 'A Little Space to Heal, Grow, and Bloom';

/** Kunci namespace localStorage (lihat SPEC.md §4). */
export const STORAGE_KEYS = {
  checkins: 'dearme:checkins',
  journals: 'dearme:journals',
  reframes: 'dearme:reframes',
  letters: 'dearme:letters',
  seeded: 'dearme:seeded',
};

/** Navigasi utama — 6 tab, urutan mengikuti UI-SPEC.md C-01. */
export const TABS = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'jurnal', label: 'Jurnal' },
  { id: 'reframing', label: 'Reframing' },
  { id: 'surat', label: 'Surat' },
  { id: 'safe-space', label: 'Safe Space' },
  { id: 'journey', label: 'Journey' },
];

/** F-01: pilihan suasana hati. */
export const MOODS = [
  { value: 'Senang', emoji: '☀️' },
  { value: 'Tenang', emoji: '🌿' },
  { value: 'Lelah', emoji: '😮‍💨' },
  { value: 'Cemas', emoji: '🌀' },
  { value: 'Sedih', emoji: '🌧️' },
  { value: 'Marah', emoji: '⛈️' },
];

/** F-01: kebutuhan hari ini. */
export const NEEDS = ['Istirahat', 'Ditemani', 'Fokus', 'Momentum', 'Tidak tahu'];

/**
 * F-02: metadata cuaca emosi + saran self-care statis.
 * Urutan prioritas aturan ada di WEATHER_RULES (dicek dari atas).
 */
export const WEATHER_META = {
  cerah: {
    icon: '☀️',
    label: 'Cerah',
    line: 'Hari ini terasa ringan. Simpan sedikit kehangatan ini.',
    advice: ['Tulis satu hal yang kamu syukuri hari ini.'],
  },
  berawan: {
    icon: '⛅',
    label: 'Berawan',
    line: 'Hari ini terasa seperti berawan. Itu tidak apa-apa.',
    advice: ['Jalan kaki 5 menit tanpa ponsel.'],
  },
  hujan: {
    icon: '🌧️',
    label: 'Hujan',
    line: 'Hari ini terasa seperti hujan. Pelan-pelan saja.',
    advice: ['Minum air hangat dan tarik napas pelan 3 kali.'],
  },
  badai: {
    icon: '⛈️',
    label: 'Badai',
    line: 'Hari ini terasa berat. Kamu tidak harus beres sekarang.',
    advice: ['Ambil jeda 2 menit dari layar, lalu coba latihan napas di Safe Space.'],
  },
};

/** Rule-based, tanpa AI/API. Prioritas badai → hujan → cerah → berawan. */
export const WEATHER_RULES = [
  { type: 'badai', test: ({ mood, energi }) => ['Marah', 'Cemas'].includes(mood) && energi <= 2 },
  { type: 'hujan', test: ({ mood, tidur }) => ['Sedih', 'Cemas'].includes(mood) || tidur <= 2 },
  { type: 'cerah', test: ({ mood, energi }) => ['Senang', 'Tenang'].includes(mood) && energi >= 3 },
  { type: 'berawan', test: () => true },
];

/** F-02: A Little Reminder For You. */
export const REMINDERS = [
  'Kamu tidak harus menyelesaikan semuanya hari ini.',
  'Pelan juga sedang bergerak.',
  'Rasa hari ini tidak menentukan siapa kamu selamanya.',
  'Boleh berhenti sejenak sebelum melanjutkan.',
];

/** F-04: pertanyaan reflektif rule-based (peta topik/mood). */
export const REFLECTIVE_TOPICS = ['Umum', 'Hubungan', 'Kerja & Studi', 'Rasa Lelah', 'Rasa Cemas', 'Syukur'];

export const REFLECTIVE_QUESTIONS = {
  Umum: [
    'Apa yang paling kamu rasakan hari ini?',
    'Apa satu hal yang kamu butuhkan dari dirimu sendiri sekarang?',
  ],
  Hubungan: [
    'Siapa yang membuatmu merasa lebih ringan akhir-akhir ini?',
    'Apa yang ingin kamu sampaikan, tapi belum sempat?',
  ],
  'Kerja & Studi': [
    'Bagian mana dari hari ini yang paling memakan energimu?',
    'Apa yang bisa kamu tunda tanpa merasa bersalah?',
  ],
  'Rasa Lelah': [
    'Apa yang paling menguras energimu hari ini, dan apa yang bisa kamu tunda?',
    'Kapan terakhir kamu benar-benar beristirahat?',
  ],
  'Rasa Cemas': [
    'Apa bagian dari rasa cemas ini yang bisa kamu beri nama?',
    'Apa satu hal kecil yang masih bisa kamu kendalikan sekarang?',
  ],
  Syukur: [
    'Apa hal kecil yang ingin kamu syukuri hari ini?',
    'Siapa yang membuat harimu sedikit lebih hangat?',
  ],
};

/** F-07: afirmasi harian. */
export const AFFIRMATIONS = [
  'Aku boleh tumbuh dengan pelan.',
  'Aku cukup, apa adanya hari ini.',
  'Aku mengizinkan diriku beristirahat.',
  'Langkah kecil tetap bernilai.',
];

/** F-07: pola napas 4-4-6, 3 siklus. */
export const BREATHING = {
  phases: [
    { key: 'tarik', label: 'Tarik', seconds: 4 },
    { key: 'tahan', label: 'Tahan', seconds: 4 },
    { key: 'hembus', label: 'Hembus', seconds: 6 },
  ],
  cycles: 3,
};

/** Util tanggal lokal (bukan UTC) — dipakai seed & render. */
export function toISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shiftISODate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/**
 * F-08: data contoh NONPRIBADI. Dibuat sekali saat first-run.
 * Tidak mengandung nama, email, atau informasi identitas apa pun.
 */
export function createSeedData() {
  return {
    checkins: [
      {
        id: 'seed-checkin-1',
        tanggal: shiftISODate(-1),
        suasanaHati: 'Tenang',
        cuacaEmosi: 'berawan',
        energi: 3,
        tidur: 4,
        kebutuhan: 'Fokus',
        pikiranRingkas: '',
        saranAktivitas: 'Jalan kaki 5 menit tanpa ponsel.',
      },
    ],
    journals: [
      {
        id: 'seed-journal-1',
        tanggal: `${shiftISODate(-1)}T09:30:00`,
        mood: 'Tenang',
        judul: 'Hari yang pelan',
        isi: 'Aku menyempatkan duduk sebentar sebelum mulai bekerja. Tidak ada yang harus dipercepat.',
        littleWin: 'Berhasil bangun tepat waktu',
        pertanyaanReflektif: 'Apa yang paling kamu rasakan hari ini?',
      },
    ],
    reframes: [
      {
        id: 'seed-reframe-1',
        tanggal: `${shiftISODate(-2)}T20:15:00`,
        pikiranAwal: 'Aku selalu terlambat. Fakta: hari ini aku tidur 20 menit lebih lama dari biasanya.',
        sudutPandangSeimbang: 'Aku sedang belajar mengatur waktu, dan satu hari yang meleset tidak mendefinisikanku.',
      },
    ],
    letters: [
      {
        id: 'seed-letter-1',
        tanggalBuat: `${shiftISODate(-7)}T21:00:00`,
        tanggalBuka: shiftISODate(-2),
        judul: 'Untuk diriku yang lebih tenang',
        isiSurat: 'Halo. Terima kasih sudah sampai sejauh ini. Ingat: kamu boleh memilih pelan.',
        terbuka: true,
      },
    ],
  };
}
