/**
 * store.js — lapisan akses localStorage.
 *
 * Tanggung jawab:
 * - baca/tulis aman (try/catch + fallback)
 * - seed data contoh nonpribadi sekali saja
 * - reset & muat ulang seed untuk keperluan uji manual
 *
 * Tidak ada pengiriman data ke luar browser (NFR-02/04).
 */

import { STORAGE_KEYS, createSeedData } from './constants.js';

const ENTITY_KEYS = [
  STORAGE_KEYS.checkins,
  STORAGE_KEYS.journals,
  STORAGE_KEYS.reframes,
  STORAGE_KEYS.letters,
];

/** ID unik dengan fallback untuk browser lama. */
export function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Baca array dari localStorage. JSON rusak → array kosong, tidak throw. */
export function read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Tulis array ke localStorage.
 * @returns {{ ok: boolean, message?: string }}
 */
export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return { ok: false, message: 'Gagal menyimpan, coba hapus entri lama.' };
  }
}

/** Baca semua entitas sekaligus. */
export function readAll() {
  return {
    checkins: read(STORAGE_KEYS.checkins),
    journals: read(STORAGE_KEYS.journals),
    reframes: read(STORAGE_KEYS.reframes),
    letters: read(STORAGE_KEYS.letters),
  };
}

/** True bila pengguna sudah pernah punya data (bukan sekadar seed). */
export function isSeeded() {
  try {
    return localStorage.getItem(STORAGE_KEYS.seeded) === '1';
  } catch {
    return false;
  }
}

/** Isi data contoh hanya pada kunjungan pertama. Aman dipanggil berulang. */
export function seedIfEmpty() {
  if (isSeeded()) return false;
  const seed = createSeedData();
  ENTITY_KEYS.forEach((key) => {
    try {
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, JSON.stringify(seed[entityName(key)]));
      }
    } catch {
      // localStorage tidak tersedia → aplikasi tetap jalan dengan data kosong.
    }
  });
  try {
    localStorage.setItem(STORAGE_KEYS.seeded, '1');
  } catch {
    // abaikan
  }
  return true;
}

/** Muat ulang data contoh secara eksplisit (tombol di Journey). */
export function loadSeed() {
  const seed = createSeedData();
  ENTITY_KEYS.forEach((key) => write(key, seed[entityName(key)]));
  try {
    localStorage.setItem(STORAGE_KEYS.seeded, '1');
  } catch {
    // abaikan
  }
}

/** Hapus semua entri pengguna. Flag seed tetap ada agar tidak auto-seed ulang. */
export function clearAll() {
  ENTITY_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // abaikan
    }
  });
  try {
    localStorage.setItem(STORAGE_KEYS.seeded, '1');
  } catch {
    // abaikan
  }
}

/** Upsert check-in: satu entri per tanggal (F-01 / AC-03). */
export function upsertCheckIn(entry) {
  const items = read(STORAGE_KEYS.checkins);
  const index = items.findIndex((item) => item.tanggal === entry.tanggal);
  if (index >= 0) items[index] = { ...items[index], ...entry };
  else items.unshift(entry);
  return write(STORAGE_KEYS.checkins, items);
}

function entityName(key) {
  if (key === STORAGE_KEYS.checkins) return 'checkins';
  if (key === STORAGE_KEYS.journals) return 'journals';
  if (key === STORAGE_KEYS.reframes) return 'reframes';
  return 'letters';
}
