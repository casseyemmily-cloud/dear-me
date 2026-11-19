/**
 * Unit test untuk src/logic.js — fungsi murni (tanpa DOM / localStorage).
 * Menjadi pengganti "filterProducts / validateProduct" di domain Dear Me:
 * filter & validasi dilakukan di sini untuk jurnal, cuaca, dan surat.
 */
import { describe, it, expect } from 'vitest';
import {
  sortByNewest,
  takeFirst,
  hasLittleWin,
  countLittleWins,
  latestMood,
  questionsFor,
  nextItem,
  filterJournalsByMood,
  searchJournals,
  combineReframe,
  isLetterOpen,
  hasUserData,
  buildJourneySummary,
  countWeatherDistribution,
  littleWinRatio,
  buildMoodCalendar,
} from '../src/logic.js';
import { REFLECTIVE_QUESTIONS, AFFIRMATIONS } from '../src/constants.js';

const jurnals = [
  { id: 'a', tanggal: '2026-01-01T08:00:00', mood: 'Tenang', judul: 'Lama', isi: 'alpha', littleWin: '' },
  { id: 'b', tanggal: '2026-02-01T08:00:00', mood: 'Senang', judul: 'Baru', isi: 'Beta', littleWin: 'Bangun tepat' },
];

describe('sortByNewest & takeFirst', () => {
  it('mengurutkan terbaru lebih dulu tanpa mengubah array asli', () => {
    const hasil = sortByNewest(jurnals);
    expect(hasil.map((item) => item.id)).toEqual(['b', 'a']);
    expect(jurnals.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('membatasi jumlah entri dan menangani batas 0 / negatif', () => {
    expect(takeFirst(jurnals, 1)).toHaveLength(1);
    expect(takeFirst(jurnals, 0)).toEqual([]);
    expect(takeFirst(jurnals, -3)).toEqual([]);
    expect(takeFirst(jurnals, 99)).toHaveLength(2);
  });
});

describe('little win & mood', () => {
  it('tidak menghitung little win berisi spasi saja', () => {
    expect(hasLittleWin(jurnals[0])).toBe(false);
    expect(hasLittleWin({ littleWin: '   ' })).toBe(false);
    expect(hasLittleWin({ littleWin: 'Jalan kaki' })).toBe(true);
    expect(countLittleWins(jurnals)).toBe(1);
  });

  it('mengambil mood check-in terakhir atau string kosong', () => {
    expect(latestMood([{ suasanaHati: 'Cemas' }])).toBe('Cemas');
    expect(latestMood([])).toBe('');
    expect(latestMood(undefined)).toBe('');
  });
});

describe('questionsFor & nextItem', () => {
  it('topik valid menang atas mood; topik "Umum" memakai mood', () => {
    expect(questionsFor({
      topik: 'Rasa Lelah', mood: 'Cemas', sources: REFLECTIVE_QUESTIONS,
    })[0]).toContain('menguras energimu');

    expect(questionsFor({
      topik: 'Umum', mood: 'Cemas', sources: REFLECTIVE_QUESTIONS,
    })[0]).toContain('rasa cemas');
  });

  it('kategori topik tak valid jatuh ke fallback "Umum"', () => {
    const hasil = questionsFor({
      topik: 'KategoriTidakAda', mood: 'MoodTidakAda', sources: REFLECTIVE_QUESTIONS,
    });
    expect(hasil).toEqual(REFLECTIVE_QUESTIONS.Umum);
    expect(questionsFor({ topik: '', mood: '', sources: undefined })).toEqual([]);
  });

  it('rotasi pertanyaan/afirmasi melingkar dan aman saat daftar kosong', () => {
    expect(nextItem(AFFIRMATIONS, AFFIRMATIONS.length - 1).index).toBe(0);
    expect(nextItem(AFFIRMATIONS, -1).index).toBe(0);
    expect(nextItem([], 0)).toEqual({ item: '', index: -1 });
  });
});

describe('filter & pencarian jurnal', () => {
  it('filter mood mengembalikan salinan dan mengabaikan mood kosong', () => {
    expect(filterJournalsByMood(jurnals, 'Senang')).toHaveLength(1);
    const semua = filterJournalsByMood(jurnals, '');
    expect(semua).toHaveLength(2);
    expect(semua).not.toBe(jurnals);
  });

  it('pencarian case-insensitive pada judul dan isi', () => {
    expect(searchJournals(jurnals, 'BETA').map((item) => item.id)).toEqual(['b']);
    expect(searchJournals(jurnals, 'alpha').map((item) => item.id)).toEqual(['a']);
    expect(searchJournals(jurnals, '   ')).toHaveLength(2);
  });
});

describe('combineReframe & isLetterOpen', () => {
  it('menggabungkan pikiran dan fakta, termasuk bagian kosong', () => {
    expect(combineReframe('Pikiran', 'Fakta')).toBe('Pikiran · Fakta: Fakta');
    expect(combineReframe('', 'Fakta')).toBe('Fakta');
    expect(combineReframe('Pikiran', '   ')).toBe('Pikiran');
    expect(combineReframe(null, undefined)).toBe('');
  });

  it('surat terbuka bila ditandai terbuka atau tanggal buka sudah tiba', () => {
    const today = '2026-11-19';
    expect(isLetterOpen({ tanggalBuka: '2026-12-01', terbuka: true }, today)).toBe(true);
    expect(isLetterOpen({ tanggalBuka: '2026-11-01', terbuka: false }, today)).toBe(true);
    expect(isLetterOpen({ tanggalBuka: '2026-12-01', terbuka: false }, today)).toBe(false);
    expect(isLetterOpen({ terbuka: false }, today)).toBe(false);
    expect(isLetterOpen(null, today)).toBe(false);
  });
});

describe('visualisasi ringkasan', () => {
  it('menghitung komposisi cuaca dan mengabaikan kategori tak valid', () => {
    const hasil = countWeatherDistribution([
      { cuacaEmosi: 'cerah' },
      { cuacaEmosi: 'cerah' },
      { cuacaEmosi: 'hujan' },
      { cuacaEmosi: 'cuaca-aneh' },
      {},
    ]);
    expect(hasil).toEqual({ cerah: 2, berawan: 0, hujan: 1, badai: 0 });
    expect(countWeatherDistribution()).toEqual({ cerah: 0, berawan: 0, hujan: 0, badai: 0 });
  });

  it('rasio little win berada di rentang 0..1', () => {
    expect(littleWinRatio([])).toBe(0);
    expect(littleWinRatio([{ littleWin: '' }])).toBe(0);
    expect(littleWinRatio([{ littleWin: 'Jalan kaki' }])).toBe(1);
    expect(littleWinRatio([{ littleWin: 'A' }, { littleWin: '   ' }])).toBe(0.5);
  });

  it('kalender mood membaca check-in tanpa menulis data', () => {
    const checkins = [
      { tanggal: '2026-11-01', suasanaHati: 'Senang', cuacaEmosi: 'cerah' },
      { tanggal: '2026-11-19', suasanaHati: 'Lelah', cuacaEmosi: 'hujan' },
    ];
    const kalender = buildMoodCalendar(checkins, new Date(2026, 10, 1), '2026-11-19');

    expect(kalender.label).toBe('November 2026');
    expect(kalender.cells).toHaveLength(30);
    expect(kalender.cells[0]).toMatchObject({
      tanggal: '2026-11-01',
      adaCheckIn: true,
      mood: 'Senang',
      cuaca: 'cerah',
      hariIni: false,
    });
    const hariIni = kalender.cells.find((cell) => cell.tanggal === '2026-11-19');
    expect(hariIni).toMatchObject({ hari: 19, mood: 'Lelah', hariIni: true });
    expect(checkins).toHaveLength(2);
  });
});

describe('buildJourneySummary', () => {
  it('menghitung angka dan mendeteksi data contoh', () => {
    const data = {
      checkins: [{ id: 'seed-c', tanggal: '2026-11-18', cuacaEmosi: 'berawan' }],
      journals: [{ id: 'seed-j', littleWin: 'Bangun tepat' }],
      reframes: [],
      letters: [{ id: 'seed-l', tanggalBuka: '2026-11-01', terbuka: false }],
    };
    const ringkasan = buildJourneySummary(data, '2026-11-19');
    expect(ringkasan).toMatchObject({
      totalCheckIns: 1,
      cuacaTerakhir: 'berawan',
      totalJurnal: 1,
      totalLittleWins: 1,
      totalReframe: 0,
      totalSuratTerbuka: 1,
      dataContoh: true,
    });
    expect(hasUserData(data)).toBe(false);
    expect(hasUserData({ ...data, journals: [{ id: 'user-1' }] })).toBe(true);
  });

  it('data kosong tidak dianggap data contoh', () => {
    const ringkasan = buildJourneySummary({}, '2026-11-19');
    expect(ringkasan.totalCheckIns).toBe(0);
    expect(ringkasan.cuacaTerakhir).toBeNull();
    expect(ringkasan.dataContoh).toBe(false);
  });
});
