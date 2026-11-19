/**
 * Unit test untuk src/store.js — parser localStorage, ketahanan JSON rusak,
 * upsert check-in harian, dan CRUD jurnal/reframe/surat.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  uid,
  read,
  write,
  readAll,
  readTheme,
  writeTheme,
  isSeeded,
  seedIfEmpty,
  loadSeed,
  clearAll,
  upsertCheckIn,
  getCheckInByDate,
  getLatestCheckIn,
  getJournals,
  addJournal,
  removeJournal,
  getReframes,
  addReframe,
  removeReframe,
  getLetters,
  addLetter,
  patchLetter,
  removeLetter,
} from '../src/store.js';
import { STORAGE_KEYS } from '../src/constants.js';

let mem;

function pasangStorage(overrides = {}) {
  vi.stubGlobal('localStorage', {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
    ...overrides,
  });
}

beforeEach(() => {
  mem = new Map();
  pasangStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parser localStorage', () => {
  it('mengembalikan array kosong untuk kunci belum ada', () => {
    expect(read(STORAGE_KEYS.journals)).toEqual([]);
  });

  it('payload JSON rusak menjadi array kosong tanpa melempar error', () => {
    mem.set(STORAGE_KEYS.journals, '{json rusak~~~');
    expect(() => read(STORAGE_KEYS.journals)).not.toThrow();
    expect(read(STORAGE_KEYS.journals)).toEqual([]);
    expect(getJournals()).toEqual([]);
  });

  it('JSON valid tetapi bukan array juga menjadi array kosong', () => {
    mem.set(STORAGE_KEYS.journals, '{"bukan":"array"}');
    expect(read(STORAGE_KEYS.journals)).toEqual([]);
  });

  it('string kosong dan null diperlakukan kosong', () => {
    mem.set(STORAGE_KEYS.reframes, '');
    expect(read(STORAGE_KEYS.reframes)).toEqual([]);
  });

  it('write lalu read mengembalikan data persis', () => {
    const data = [{ id: 'x', judul: '<img src=x onerror=alert(1)>' }];
    expect(write(STORAGE_KEYS.journals, data).ok).toBe(true);
    expect(getJournals()).toEqual(data);
  });

  it('gagal simpan (kuota penuh) mengembalikan pesan ramah', () => {
    pasangStorage({ setItem: () => { throw new Error('quota exceeded'); } });
    const hasil = write(STORAGE_KEYS.journals, []);
    expect(hasil.ok).toBe(false);
    expect(hasil.message).toBe('Gagal menyimpan, coba hapus entri lama.');
  });

  it('satu entitas rusak tidak mengganggu readAll', () => {
    mem.set(STORAGE_KEYS.letters, 'rusak');
    const semua = readAll();
    expect(semua.letters).toEqual([]);
    expect(semua.checkins).toEqual([]);
    expect(Object.keys(semua)).toEqual(['checkins', 'journals', 'reframes', 'letters']);
  });
});

describe('tema tampilan', () => {
  it('default terang; hanya nilai dark yang dianggap mode gelap', () => {
    expect(readTheme()).toBe('light');
    expect(writeTheme('dark').ok).toBe(true);
    expect(readTheme()).toBe('dark');
    mem.set(STORAGE_KEYS.theme, 'nilai-aneh');
    expect(readTheme()).toBe('light');
  });

  it('gagal simpan tema tetap mengembalikan hasil, bukan melempar error', () => {
    pasangStorage({ setItem: () => { throw new Error('storage penuh'); } });
    expect(writeTheme('dark').ok).toBe(false);
    expect(readTheme()).toBe('light');
  });

  it('hapus semua data tidak menghapus preferensi tema', () => {
    mem.set(STORAGE_KEYS.theme, 'dark');
    clearAll();
    expect(readTheme()).toBe('dark');
  });
});

describe('uid & check-in', () => {
  it('uid menghasilkan string unik', () => {
    const daftar = Array.from({ length: 250 }, () => uid());
    expect(new Set(daftar).size).toBe(250);
    expect(typeof daftar[0]).toBe('string');
  });

  it('upsert check-in tetap satu entri per tanggal dan nilainya diperbarui', () => {
    expect(upsertCheckIn({ id: 'c1', tanggal: '2026-11-19', suasanaHati: 'Senang', energi: 5 }).ok).toBe(true);
    expect(upsertCheckIn({ id: 'c1', tanggal: '2026-11-19', suasanaHati: 'Cemas', energi: 1 }).ok).toBe(true);

    const semua = read(STORAGE_KEYS.checkins);
    expect(semua).toHaveLength(1);
    expect(semua[0].suasanaHati).toBe('Cemas');
    expect(getCheckInByDate('2026-11-19').energi).toBe(1);
    expect(getCheckInByDate('2026-11-18')).toBeNull();
    expect(getLatestCheckIn().id).toBe('c1');
  });
});

describe('CRUD jurnal, reframe, dan surat', () => {
  it('jurnal ditambah, dibaca, lalu dihapus', () => {
    expect(addJournal({ id: 'j1', judul: 'Hari pelan', isi: 'alo' }).ok).toBe(true);
    expect(getJournals()).toHaveLength(1);
    expect(removeJournal('j1').ok).toBe(true);
    expect(getJournals()).toHaveLength(0);
  });

  it('reframe ditambah lalu dihapus', () => {
    expect(addReframe({ id: 'r1', pikiranAwal: 'Pikiran', sudutPandangSeimbang: 'Seimbang' }).ok).toBe(true);
    expect(getReframes()).toHaveLength(1);
    expect(removeReframe('r1').ok).toBe(true);
    expect(getReframes()).toHaveLength(0);
  });

  it('surat dibuat terkunci, dibuka lewat patch, lalu dihapus', () => {
    addLetter({ id: 'l1', tanggalBuka: '2026-12-01', terbuka: false, isiSurat: 'rahasia' });
    expect(getLetters()[0].terbuka).toBe(false);
    expect(patchLetter('l1', { terbuka: true }).ok).toBe(true);
    expect(getLetters()[0].terbuka).toBe(true);
    expect(getLetters()[0].isiSurat).toBe('rahasia');
    expect(removeLetter('l1').ok).toBe(true);
    expect(getLetters()).toHaveLength(0);
  });
});

describe('seed data contoh', () => {
  it('hanya muncul pada kunjungan pertama', () => {
    expect(isSeeded()).toBe(false);
    expect(seedIfEmpty()).toBe(true);
    expect(isSeeded()).toBe(true);
    expect(getJournals()).toHaveLength(1);
    expect(getReframes()).toHaveLength(1);
    expect(getLetters()).toHaveLength(1);
    expect(seedIfEmpty()).toBe(false);
  });

  it('hapus semua data mempertahankan flag seed, muat ulang mengembalikan contoh', () => {
    seedIfEmpty();
    expect(clearAll()).toBeUndefined();
    expect(isSeeded()).toBe(true);
    expect(readAll().checkins).toEqual([]);

    loadSeed();
    expect(readAll().checkins).toHaveLength(1);
    expect(readAll().journals).toHaveLength(1);
  });
});
