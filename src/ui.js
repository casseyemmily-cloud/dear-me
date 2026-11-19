/**
 * ui.js — helpers DOM + render komponen dasar (shell, header, nav, hero, footer).
 *
 * Aturan penting (NFR-05 / AC-18):
 * - seluruh teks dirender lewat textContent
 * - DILARANG innerHTML untuk data apa pun
 */

import { APP_NAME, APP_TAGLINE, TABS } from './constants.js';

const DISCLAIMER_SHORT =
  'Dear Me adalah ruang refleksi pribadi, bukan alat diagnosis medis dan bukan pengganti bantuan profesional.';

/** Pembuat elemen kecil. String selalu jadi text node, bukan HTML. */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) continue;

    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'html') {
      throw new Error('innerHTML dilarang di Dear Me — gunakan text / children.');
    } else {
      node.setAttribute(key, String(value));
    }
  }

  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Format tanggal lokal id-ID (NFR-11). */
export function formatDate(value, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', options).format(date);
}

function renderHeader(activeTab, onNavigate) {
  const brand = el('div', { class: 'brand' }, [
    el('span', { class: 'brand__mark', 'aria-hidden': 'true', text: '◐' }),
    el('span', { class: 'brand__text' }, [
      el('span', { class: 'brand__name', text: APP_NAME }),
      el('span', { class: 'brand__sub', text: 'ruang kecil untuk merasa' }),
    ]),
  ]);

  const nav = el(
    'nav',
    { class: 'nav', 'aria-label': 'Navigasi utama' },
    TABS.map((tab) =>
      el('button', {
        type: 'button',
        class: `nav__tab${tab.id === activeTab ? ' is-active' : ''}`,
        dataset: { tab: tab.id },
        'aria-current': tab.id === activeTab ? 'page' : 'false',
        text: tab.label,
        onclick: () => onNavigate(tab.id),
      }),
    ),
  );

  return el('header', { class: 'header' }, [el('div', { class: 'header__inner' }, [brand, nav])]);
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Pembuat elemen SVG. Teks tetap memakai textContent (bukan innerHTML). */
function svg(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    if (key === 'text') node.textContent = value;
    else node.setAttribute(key, String(value));
  }
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child) node.append(child);
  }
  return node;
}

/**
 * Ilustrasi hero: bunga mekar di pot, matahari lembut, awan, dan sparkle.
 * Dekoratif (aria-hidden di wrapper), warna mengikuti palet UI-SPEC.md.
 */
function renderHeroIllustration() {
  const petal = (cx, cy, rotate, fill) =>
    svg('ellipse', {
      cx,
      cy,
      rx: 11,
      ry: 19,
      fill,
      opacity: '0.9',
      transform: `rotate(${rotate} ${cx} ${cy})`,
    });

  return svg(
    'svg',
    {
      class: 'hero__illustration',
      viewBox: '0 0 240 240',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    [
      svg('defs', {}, [
        svg('radialGradient', { id: 'dm-halo', cx: '50%', cy: '50%', r: '50%' }, [
          svg('stop', { offset: '0%', 'stop-color': '#F5DCE5', 'stop-opacity': '0.95' }),
          svg('stop', { offset: '100%', 'stop-color': '#FFF9F5', 'stop-opacity': '0' }),
        ]),
      ]),
      svg('circle', { cx: '120', cy: '120', r: '112', fill: 'url(#dm-halo)' }),
      svg('circle', { cx: '178', cy: '58', r: '24', fill: '#F5DCE5' }),
      svg('circle', { cx: '178', cy: '58', r: '15', fill: '#D99AAF', opacity: '0.8' }),
      svg('path', {
        d: 'M34 84c0-7 6-12 13-12 3-8 15-9 20-2 8-2 14 4 14 11 0 6-5 10-12 10H46c-7 0-12-3-12-7z',
        fill: '#FFFFFF',
        opacity: '0.85',
      }),
      svg('path', {
        d: 'M196 132c0-5 4-8 9-8 2-5 10-6 13-1 5-1 9 3 9 7 0 4-4 7-8 7h-15c-5 0-8-2-8-5z',
        fill: '#FFFFFF',
        opacity: '0.75',
      }),
      svg('path', {
        d: 'M120 176c0-28 0-52 0-74',
        fill: 'none',
        stroke: '#4F6B57',
        'stroke-width': '3',
        'stroke-linecap': 'round',
      }),
      svg('ellipse', {
        cx: '99',
        cy: '146',
        rx: '17',
        ry: '8',
        fill: '#7C9A82',
        opacity: '0.85',
        transform: 'rotate(-28 99 146)',
      }),
      svg('ellipse', {
        cx: '142',
        cy: '133',
        rx: '16',
        ry: '8',
        fill: '#7C9A82',
        opacity: '0.7',
        transform: 'rotate(26 142 133)',
      }),
      petal(120, 74, 0, '#F5DCE5'),
      petal(120, 102, 180, '#D99AAF'),
      petal(106, 88, -60, '#F5DCE5'),
      petal(134, 88, 60, '#8E7AA8'),
      svg('circle', { cx: '120', cy: '88', r: '9', fill: '#76566A' }),
      svg('path', {
        d: 'M86 174h68l-7 36H93z',
        fill: '#D99AAF',
        opacity: '0.85',
      }),
      svg('rect', {
        x: '81',
        y: '168',
        width: '78',
        height: '10',
        rx: '5',
        fill: '#76566A',
        opacity: '0.8',
      }),
      svg('path', {
        d: 'M72 214h96',
        fill: 'none',
        stroke: '#D99AAF',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        opacity: '0.6',
      }),
      svg('path', {
        d: 'M52 122l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
        fill: '#8E7AA8',
        opacity: '0.7',
      }),
      svg('path', {
        d: 'M186 102l2 5 5 2-5 2-2 5-2-5-5-2 5-2z',
        fill: '#D99AAF',
        opacity: '0.7',
      }),
    ],
  );
}

function renderHero() {
  return el('section', { class: 'hero', 'aria-labelledby': 'hero-title' }, [
    el('div', { class: 'hero__copy' }, [
      el('p', { class: 'eyebrow', text: 'Selamat datang' }),
      el('h1', { id: 'hero-title', class: 'hero__title', text: APP_TAGLINE }),
      el('p', {
        class: 'hero__subtitle',
        text: 'Ruang kecil untuk merasa, mencatat, dan tumbuh dengan pelan. Semua tetap di perangkatmu.',
      }),
      el('button', {
        type: 'button',
        class: 'btn btn--primary',
        text: 'Mulai Check-In',
        onclick: () => document.getElementById('check-in')?.scrollIntoView({ behavior: 'smooth' }),
      }),
    ]),
    el('div', { class: 'hero__glow', 'aria-hidden': 'true' }, [renderHeroIllustration()]),
  ]);
}

function card({ title, note, badge, moduleName }) {
  const head = el('div', { class: 'card__head' }, [el('h3', { class: 'card__title', text: title })]);
  if (badge) head.append(el('span', { class: 'badge', text: badge }));

  return el('section', { class: 'card', dataset: { module: moduleName } }, [
    head,
    el('p', { class: 'card__note', text: note }),
    el('div', { class: 'card__slot', 'aria-hidden': 'true' }),
  ]);
}

function pageIntro(title, subtitle) {
  return el('div', { class: 'page-intro' }, [
    el('h2', { class: 'page-intro__title', text: title }),
    el('p', { class: 'page-intro__sub', text: subtitle }),
  ]);
}

/** Konten tiap tab. Modul fitur akan dipasang di sini pada iterasi berikutnya. */
export function renderContent(main, activeTab) {
  let content;

  switch (activeTab) {
    case 'beranda':
      content = el('div', { class: 'stack' }, [
        renderHero(),
        el('div', { class: 'grid grid--two' }, [
          card({
            title: 'Daily Check-In',
            note: 'Empat pertanyaan singkat untuk mengenali rasamu hari ini.',
            moduleName: 'check-in',
          }),
          card({
            title: 'Emotional Report & Little Reminder',
            note: 'Ringkasan cuaca emosi, pengingat kecil, dan saran self-care.',
            moduleName: 'report',
          }),
          card({
            title: 'Safe Space & Daily Affirmation',
            note: 'Latihan napas 4-4-6 dan satu kalimat penguat untuk hari ini.',
            moduleName: 'safe-space',
          }),
          card({
            title: 'My Growth Journey',
            note: 'Angka sederhana dari perjalananmu, tersimpan di perangkat ini.',
            moduleName: 'journey',
          }),
        ]),
      ]);
      break;

    case 'jurnal':
      content = el('div', { class: 'stack' }, [
        pageIntro('My Journal & Little Wins', 'Tulis apa saja. Kemenangan kecil juga layak dicatat.'),
        card({
          title: 'Tulis refleksi',
          note: 'Pertanyaan reflektif dari pola sederhana di perangkatmu akan muncul di sini.',
          moduleName: 'journal',
        }),
        card({ title: 'Riwayat jurnal', note: 'Catatanmu akan tersusun dari yang terbaru.', moduleName: 'journal-history' }),
      ]);
      break;

    case 'reframing':
      content = el('div', { class: 'stack' }, [
        pageIntro('Thought Reframing', 'Lihat pikiran awal, lalu cari sudut pandang yang lebih seimbang.'),
        card({ title: 'Pikiran → sudut pandang', note: 'Tiga kolom singkat: pikiran, fakta, dan versi yang lebih lembut.', moduleName: 'reframe' }),
        card({ title: 'Riwayat reframing', note: 'Semua versi seimbangmu tersimpan di sini.', moduleName: 'reframe-history' }),
      ]);
      break;

    case 'surat':
      content = el('div', { class: 'stack' }, [
        pageIntro('Letters to Future Me', 'Tulis surat untuk dirimu yang akan datang.'),
        card({ title: 'Surat baru', note: 'Pilih tanggal buka, lalu biarkan surat menunggu.', moduleName: 'letters' }),
        card({ title: 'Kotak surat', note: 'Status terkunci dan terbuka akan tampil jelas di sini.', moduleName: 'letters-list' }),
      ]);
      break;

    case 'safe-space':
      content = el('div', { class: 'stack' }, [
        pageIntro('Safe Space', 'Berhenti sejenak. Tarik napas. Kamu tidak harus melakukan apa pun.'),
        card({ title: 'Latihan napas', note: 'Tarik 4 detik · Tahan 4 detik · Hembus 6 detik, tiga siklus.', moduleName: 'breathing' }),
        card({ title: 'Afirmasi Harian', note: 'Satu kalimat kecil untuk dibawa sepanjang hari.', moduleName: 'affirmation' }),
      ]);
      break;

    case 'journey':
    default:
      content = el('div', { class: 'stack' }, [
        pageIntro('My Growth Journey', 'Lihat jejak kecil yang sudah kamu jalani.'),
        card({ title: 'Ringkasan pertumbuhan', note: 'Total check-in, cuaca terakhir, jurnal, dan little wins.', moduleName: 'growth' }),
        el('p', { class: 'inline-disclaimer', text: DISCLAIMER_SHORT }),
      ]);
      break;
  }

  main.replaceChildren(content);
}

function renderFooter() {
  return el(
    'footer',
    { class: 'footer' },
    el('p', { class: 'footer__text' }, [
      el('strong', { text: 'Catatan kecil: ' }),
      document.createTextNode(DISCLAIMER_SHORT),
      document.createTextNode(' Jika perlu bantuan, hubungi tenaga kesehatan mental di wilayahmu.'),
    ]),
  );
}

/** Bangun shell sekali; konten tab diganti lewat renderContent(). */
export function renderShell(root, { activeTab, onNavigate }) {
  const header = renderHeader(activeTab, onNavigate);
  const main = el('main', { id: 'main-content', class: 'main', tabindex: '-1' });
  const footer = renderFooter();
  const toastHost = el('div', {
    id: 'toast-host',
    class: 'toast-host',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  });

  root.replaceChildren(header, main, footer, toastHost);
  renderContent(main, activeTab);
  return { header, main, footer, toastHost };
}

/** Perbarui tampilan tab aktif setelah navigasi. */
export function setActiveTab(header, tabId) {
  header.querySelectorAll('.nav__tab').forEach((button) => {
    const active = button.dataset.tab === tabId;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

/** Toast sederhana, teks saja, hilang setelah 2,5 detik (C-09). */
export function showToast(message) {
  const host = document.getElementById('toast-host');
  if (!host) return;
  const toast = el('div', { class: 'toast', role: 'status', text: message });
  host.replaceChildren(toast);
  window.setTimeout(() => toast.remove(), 2500);
}
