/**
 * Security regression tests — konfigurasi publik + kontrol XSS.
 * Sengaja tanpa dependency baru: fs bawaan Node + fake DOM untuk el().
 */
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

const baca = (relative) => readFileSync(new URL(relative, import.meta.url), 'utf8');

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('konfigurasi keamanan statis', () => {
  it('mengabaikan semua varian file .env, kecuali contoh', () => {
    const isi = baca('../.gitignore');
    expect(isi).toMatch(/^\.env\*$/m);
    expect(isi).toMatch(/^!\.env\.example$/m);
  });

  it('memasang CSP yang memblokir inline script, objek, dan base absolutes', () => {
    const html = baca('../index.html');
    const cocok = html.match(
      /http-equiv="Content-Security-Policy"[\s\S]*?content="([^"]+)"/i,
    );
    expect(cocok, 'meta CSP harus ada di index.html').toBeTruthy();

    const csp = cocok[1];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'none'");
    expect(csp).toContain("form-action 'none'");

    // CSP hanya efektif bila tidak ada script/style inline di dokumen.
    expect(html).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/i);
    expect(html).not.toMatch(/\sstyle\s*=/i);
  });
});

/** Minimal DOM stub — cukup untuk el(), tanpa jsdom/happy-dom. */
class FakeNode {
  constructor() {
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.className = '';
    this.textContent = '';
  }

  setAttribute(kunci, nilai) {
    this.attributes[kunci] = String(nilai);
  }

  addEventListener(kunci, handler) {
    this.listeners[kunci] = handler;
  }

  append(...anak) {
    this.children.push(...anak);
  }
}

describe('el() — regresi XSS', () => {
  it('payload dirender sebagai teks, bukan elemen atau HTML', async () => {
    vi.stubGlobal('Node', FakeNode);
    vi.stubGlobal('document', {
      createElement: () => new FakeNode(),
      createTextNode: (nilai) => Object.assign(new FakeNode(), { textContent: String(nilai) }),
    });

    const { el } = await import('../src/ui.js');
    const payload = '<img src=x onerror=alert(1)>';

    const lewatProps = el('p', { text: payload });
    expect(lewatProps.textContent).toBe(payload);
    expect(lewatProps.children).toHaveLength(0);
    expect(lewatProps.attributes).toEqual({});

    const lewatAnak = el('p', {}, [payload]);
    expect(lewatAnak.children).toHaveLength(1);
    expect(lewatAnak.children[0]).toBeInstanceOf(FakeNode);
    expect(lewatAnak.children[0].textContent).toBe(payload);
    expect(lewatAnak.children[0].attributes).toEqual({});

    expect(() => el('p', { html: payload })).toThrow(/innerHTML/);
  });
});
