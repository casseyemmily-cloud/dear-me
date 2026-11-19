/**
 * Unit test untuk src/constants.js — aturan cuaca, batas angka, tanggal,
 * dan konstanta F-01/F-02/F-07 sesuai SPEC.md.
 */
import { describe, it, expect } from 'vitest';
import {
  WEATHER_META,
  resolveWeather,
  REMINDERS,
  pickReminder,
  NOTE_MAX_LENGTH,
  CHECKIN_DISCLAIMER,
  BREATHING,
  toISODate,
  shiftISODate,
  toISOLocalDateTime,
  JOURNAL_PREVIEW_LIMIT,
  WHATSAPP_NUMBER,
  WHATSAPP_DEFAULT_MESSAGE,
  buildWhatsAppUrl,
} from '../src/constants.js';

describe('kontak WhatsApp', () => {
  it('memakai nomor yang diminta dan pesan default netral', () => {
    expect(WHATSAPP_NUMBER).toBe('6283835513161');
    expect(WHATSAPP_DEFAULT_MESSAGE).not.toMatch(/jurnal|curhat|localStorage/i);
    expect(buildWhatsAppUrl()).toBe(
      `https://wa.me/6283835513161?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`,
    );
  });

  it('mengodekan karakter khusus sehingga tidak ada HTML mentah di URL', () => {
    const pesan = 'Halo & <b>hai</b>? 100% 🌷';
    const url = buildWhatsAppUrl(pesan);
    expect(url).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pesan)}`);
    expect(url).not.toContain('<b>');
    expect(url).not.toContain(' ');
  });

  it('input bukan string jatuh ke pesan default tanpa melempar error', () => {
    expect(buildWhatsAppUrl(undefined)).toBe(buildWhatsAppUrl());
    expect(buildWhatsAppUrl(null)).toBe(buildWhatsAppUrl());
    expect(buildWhatsAppUrl(123)).toBe(buildWhatsAppUrl());
  });
});

describe('resolveWeather — batas angka & prioritas', () => {
  it('badai menang atas hujan dan cerah (AC-04)', () => {
    expect(resolveWeather({ mood: 'Marah', energi: 1, tidur: 1 })).toBe('badai');
    expect(resolveWeather({ mood: 'Cemas', energi: 2, tidur: 5 })).toBe('badai');
  });

  it('hujan dipicu mood Sedih/Cemas atau tidur <= 2', () => {
    expect(resolveWeather({ mood: 'Sedih', energi: 5, tidur: 5 })).toBe('hujan');
    expect(resolveWeather({ mood: 'Senang', energi: 5, tidur: 2 })).toBe('hujan');
  });

  it('cerah hanya pada energi >= 3 dengan mood Senang/Tenang', () => {
    expect(resolveWeather({ mood: 'Senang', energi: 3, tidur: 4 })).toBe('cerah');
    expect(resolveWeather({ mood: 'Tenang', energi: 2, tidur: 4 })).toBe('berawan');
  });

  it('kategori mood tak valid dan angka di luar rentang jatuh ke berawan tanpa error', () => {
    expect(resolveWeather({ mood: 'Netral', energi: 3, tidur: 3 })).toBe('berawan');
    expect(resolveWeather({ mood: 'Senang', energi: 0, tidur: 4 })).toBe('berawan');
    expect(resolveWeather({ mood: undefined, energi: undefined, tidur: undefined })).toBe('berawan');
  });

  it('setiap hasil cuaca punya metadata ikon, label, dan saran', () => {
    for (const type of ['cerah', 'berawan', 'hujan', 'badai']) {
      expect(WEATHER_META[type].icon).toBeTruthy();
      expect(WEATHER_META[type].label).toBeTruthy();
      expect(WEATHER_META[type].advice.length).toBeGreaterThan(0);
    }
  });
});

describe('konstanta teks & pengingat', () => {
  it('batas catatan 140 karakter dan disclaimer sesuai spesifikasi', () => {
    expect(NOTE_MAX_LENGTH).toBe(140);
    expect(CHECKIN_DISCLAIMER).toBe('Ringkasan ini adalah refleksi, bukan diagnosis medis.');
    expect(JOURNAL_PREVIEW_LIMIT).toBe(10);
  });

  it('pickReminder deterministik per tanggal dan selalu berasal dari daftar statis', () => {
    const tanggal = '2026-11-19';
    expect(pickReminder(tanggal)).toBe(pickReminder(tanggal));
    expect(REMINDERS).toContain(pickReminder(tanggal));
    expect(REMINDERS).toContain(pickReminder('2026-11-20'));
  });
});

describe('util tanggal lokal', () => {
  it('toISODate memakai tanggal lokal, bukan UTC', () => {
    expect(toISODate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('shiftISODate menggeser hari dan toISOLocalDateTime menyertakan jam lokal', () => {
    expect(shiftISODate(-1)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const hasil = toISOLocalDateTime(new Date(2026, 10, 19, 7, 8, 9));
    expect(hasil).toBe('2026-11-19T07:08:09');
  });
});

describe('F-07 pola napas', () => {
  it('tiga siklus 4-4-6 tanpa durasi kosong', () => {
    expect(BREATHING.cycles).toBe(3);
    expect(BREATHING.phases.map((phase) => phase.seconds)).toEqual([4, 4, 6]);
  });
});
