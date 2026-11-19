/**
 * ui.js — helpers DOM + render komponen dasar (shell, header, nav, hero, footer).
 *
 * Aturan penting (NFR-05 / AC-18):
 * - seluruh teks dirender lewat textContent
 * - DILARANG innerHTML untuk data apa pun
 */

import {
  APP_NAME,
  APP_TAGLINE,
  TABS,
  MOODS,
  NEEDS,
  WEATHER_META,
  NOTE_MAX_LENGTH,
  CHECKIN_DISCLAIMER,
  REFLECTIVE_TOPICS,
  REFLECTIVE_QUESTIONS,
  AFFIRMATIONS,
  BREATHING,
  JOURNAL_PREVIEW_LIMIT,
  toISODate,
  toISOLocalDateTime,
  shiftISODate,
  resolveWeather,
  pickReminder,
} from './constants.js';
import {
  uid,
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
  readAll,
  loadSeed,
  clearAll,
} from './store.js';
import {
  sortByNewest,
  takeFirst,
  hasLittleWin,
  latestMood,
  questionsFor,
  nextItem,
  combineReframe,
  isLetterOpen,
  buildJourneySummary,
} from './logic.js';

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

/** Ilustrasi mini (bunga kecil + daun + sparkle) untuk kartu laporan. */
function renderSprig() {
  const petal = (cx, cy, rotate, fill) =>
    svg('ellipse', {
      cx,
      cy,
      rx: '5.5',
      ry: '8.5',
      fill,
      opacity: '0.92',
      transform: `rotate(${rotate} ${cx} ${cy})`,
    });

  return svg(
    'svg',
    { class: 'sprig', viewBox: '0 0 72 72', 'aria-hidden': 'true', focusable: 'false' },
    [
      svg('circle', { cx: '36', cy: '36', r: '31', fill: '#F5DCE5', opacity: '0.55' }),
      svg('path', {
        d: 'M36 60c0-10 0-18 0-26',
        fill: 'none',
        stroke: '#4F6B57',
        'stroke-width': '2.5',
        'stroke-linecap': 'round',
      }),
      svg('ellipse', {
        cx: '26',
        cy: '46',
        rx: '10',
        ry: '5',
        fill: '#7C9A82',
        opacity: '0.85',
        transform: 'rotate(-28 26 46)',
      }),
      svg('ellipse', {
        cx: '46',
        cy: '42',
        rx: '9',
        ry: '4.5',
        fill: '#7C9A82',
        opacity: '0.7',
        transform: 'rotate(26 46 42)',
      }),
      petal(36, 18, 0, '#F5DCE5'),
      petal(36, 36, 180, '#D99AAF'),
      petal(27, 27, -60, '#F5DCE5'),
      petal(45, 27, 60, '#8E7AA8'),
      svg('circle', { cx: '36', cy: '27', r: '5', fill: '#76566A' }),
      svg('path', { d: 'M10 22l1.5 4 4 1.5-4 1.5L10 33l-1.5-4-4-1.5 4-1.5z', fill: '#8E7AA8', opacity: '0.75' }),
      svg('path', { d: 'M60 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1z', fill: '#D99AAF', opacity: '0.8' }),
    ],
  );
}

/** Ilustrasi sangat kecil untuk kondisi belum ada check-in. */
function renderSprout() {
  return svg(
    'svg',
    { class: 'sprig sprig--tiny', viewBox: '0 0 48 48', 'aria-hidden': 'true', focusable: 'false' },
    [
      svg('path', {
        d: 'M24 40c0-8 0-13 0-18',
        fill: 'none',
        stroke: '#4F6B57',
        'stroke-width': '2.5',
        'stroke-linecap': 'round',
      }),
      svg('ellipse', { cx: '16', cy: '27', rx: '8', ry: '4', fill: '#7C9A82', opacity: '0.85', transform: 'rotate(-30 16 27)' }),
      svg('ellipse', { cx: '32', cy: '24', rx: '8', ry: '4', fill: '#7C9A82', opacity: '0.7', transform: 'rotate(30 32 24)' }),
      svg('path', { d: 'M38 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1z', fill: '#8E7AA8', opacity: '0.8' }),
    ],
  );
}

/* -------------------------------------------------------------------------- */
/* Ikon SVG lucu & interaktif (semua dibuat lokal, tanpa aset internet)         */
/* -------------------------------------------------------------------------- */

function renderFlowerIcon() {
  return svg(
    'svg',
    { class: 'icon-flower', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    [
      svg('circle', { cx: '12', cy: '6', r: '3.6', fill: '#F5DCE5' }),
      svg('circle', { cx: '18', cy: '12', r: '3.6', fill: '#D99AAF', opacity: '0.9' }),
      svg('circle', { cx: '12', cy: '18', r: '3.6', fill: '#F5DCE5' }),
      svg('circle', { cx: '6', cy: '12', r: '3.6', fill: '#8E7AA8', opacity: '0.85' }),
      svg('circle', { cx: '12', cy: '12', r: '3.2', fill: '#76566A' }),
    ],
  );
}

function renderStarIcon() {
  return svg(
    'svg',
    { class: 'icon-star', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    [
      svg('path', {
        d: 'M12 2l2.6 6.2L21 10l-5.2 3.8L17.4 21 12 17.2 6.6 21l1.6-7.2L3 10l6.4-1.8z',
        fill: '#D99AAF',
        opacity: '0.9',
      }),
      svg('circle', { cx: '18.5', cy: '4.5', r: '1.6', fill: '#8E7AA8', opacity: '0.8' }),
    ],
  );
}

function renderSparkleIcon() {
  return svg(
    'svg',
    { class: 'icon-sparkle', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    [
      svg('path', { d: 'M8 3l1.6 4.4L14 9l-4.4 1.6L8 15l-1.6-4.4L2 9l4.4-1.6z', fill: '#8E7AA8' }),
      svg('path', { d: 'M18 13l1.1 3 3.1 1.1-3.1 1.1L18 21.3l-1.1-3.1-3.1-1.1 3.1-1.1z', fill: '#D99AAF', opacity: '0.85' }),
    ],
  );
}

function renderHeartIcon() {
  return svg(
    'svg',
    { class: 'icon-heart', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    [
      svg('path', {
        d: 'M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8C19.5 15.3 12 20 12 20z',
        fill: '#D99AAF',
        opacity: '0.9',
      }),
      svg('path', { d: 'M18.5 4l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z', fill: '#8E7AA8', opacity: '0.75' }),
    ],
  );
}

function renderLeafIcon() {
  return svg(
    'svg',
    { class: 'icon-leaf', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    [
      svg('path', {
        d: 'M20 4C10 4 5 8 5 14a5 5 0 0 0 5 5c6 0 10-5 10-15z',
        fill: '#7C9A82',
        opacity: '0.85',
      }),
      svg('path', {
        d: 'M4 21c2-5 6-9 12-12',
        fill: 'none',
        stroke: '#4F6B57',
        'stroke-width': '1.6',
        'stroke-linecap': 'round',
      }),
    ],
  );
}

/** Animasi "pop" singkat saat ikon disentuh/diklik. */
function playPop(node) {
  node.classList.remove('is-popping');
  void node.offsetWidth;
  node.classList.add('is-popping');
  window.setTimeout(() => node.classList.remove('is-popping'), 500);
}

/** Tombol ikon lucu dengan aksi + feedback visual. */
function cuteIconButton({ icon, label, onClick, className = '' }) {
  const button = el(
    'button',
    {
      type: 'button',
      class: `cute-icon ${className}`.trim(),
      'aria-label': label,
      title: label,
    },
    [icon],
  );
  button.addEventListener('click', () => {
    playPop(button);
    onClick?.();
  });
  return button;
}

/** Empty state ramah untuk daftar yang masih kosong. */
function emptyState(icon, title, text) {
  return el('div', { class: 'empty-state' }, [
    icon,
    el('p', { class: 'empty-state__title', text: title }),
    el('p', { class: 'empty-state__text', text }),
  ]);
}

/** Timer napas aktif; dihentikan saat pindah tab (R-03 / AC-14). */
let breathingTimer = null;

function stopBreathingTimer() {
  if (breathingTimer !== null) {
    window.clearInterval(breathingTimer);
    breathingTimer = null;
  }
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

function card({ title, note, badge, moduleName, id, className = '', children }) {
  const head = el('div', { class: 'card__head' }, [
    el('span', { class: 'card__flower', 'aria-hidden': 'true' }, [renderFlowerIcon()]),
    el('h3', { class: 'card__title', text: title }),
  ]);
  if (badge) head.append(el('span', { class: 'badge', text: badge }));

  const isi = children ?? [el('div', { class: 'card__slot', 'aria-hidden': 'true' })];

  return el(
    'section',
    {
      class: `card card--cute ${className}`.trim(),
      id: id ?? null,
      dataset: { module: moduleName },
    },
    [head, note ? el('p', { class: 'card__note', text: note }) : null, ...isi],
  );
}

function pageIntro(title, subtitle, icon) {
  return el('div', { class: 'page-intro' }, [
    el('div', { class: 'page-intro__row' }, [
      el('span', { class: 'page-intro__icon', 'aria-hidden': 'true' }, [icon ?? renderFlowerIcon()]),
      el('h2', { class: 'page-intro__title', text: title }),
    ]),
    el('p', { class: 'page-intro__sub', text: subtitle }),
  ]);
}

/* -------------------------------------------------------------------------- */
/* F-01 — Daily Check-In                                                       */
/* -------------------------------------------------------------------------- */

function activateChip(group, button) {
  group.querySelectorAll('.chip').forEach((chip) => {
    chip.classList.remove('is-active');
    chip.setAttribute('aria-pressed', 'false');
  });
  button.classList.add('is-active');
  button.setAttribute('aria-pressed', 'true');
}

function field(labelText, control, hint) {
  return el('div', { class: 'field' }, [
    el('span', { class: 'field__label', text: labelText }),
    control,
    hint ? el('span', { class: 'field__hint', text: hint }) : null,
  ]);
}

function renderCheckInCard() {
  const state = { mood: '', tidur: 4, energi: 3, kebutuhan: '', pikiran: '' };

  const moodGroup = el(
    'div',
    { class: 'chips chips--mood', role: 'group', 'aria-label': 'Suasana hati hari ini' },
    MOODS.map(({ value, emoji }) => {
      const button = el('button', { type: 'button', class: 'chip chip--mood', 'aria-pressed': 'false' }, [
        el('span', { 'aria-hidden': 'true', text: emoji }),
        el('span', { text: value }),
      ]);
      button.addEventListener('click', () => {
        state.mood = value;
        activateChip(moodGroup, button);
      });
      return button;
    }),
  );

  const needGroup = el(
    'div',
    { class: 'chips chips--need', role: 'group', 'aria-label': 'Kebutuhan hari ini' },
    NEEDS.map((value) => {
      const button = el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false', text: value });
      button.addEventListener('click', () => {
        state.kebutuhan = value;
        activateChip(needGroup, button);
      });
      return button;
    }),
  );

  function slider(label, key, initial) {
    const valueText = el('output', { class: 'range__value', text: String(initial) });
    const input = el('input', {
      type: 'range',
      class: 'range',
      min: '1',
      max: '5',
      step: '1',
      value: String(initial),
      'aria-label': label,
      oninput: (event) => {
        state[key] = Number(event.target.value);
        valueText.textContent = event.target.value;
      },
    });
    return el('div', { class: 'field field--range' }, [
      el('div', { class: 'field__label' }, [el('span', { text: label }), valueText]),
      input,
    ]);
  }

  const counter = el('span', { class: 'note-counter', text: `0/${NOTE_MAX_LENGTH}` });
  const note = el('textarea', {
    id: 'checkin-note',
    class: 'textarea',
    rows: '2',
    maxlength: String(NOTE_MAX_LENGTH),
    placeholder: 'Boleh kosong. Tulis satu pikiran yang sedang berulang…',
    oninput: (event) => {
      state.pikiran = event.target.value;
      counter.textContent = `${event.target.value.length}/${NOTE_MAX_LENGTH}`;
    },
  });

  function save() {
    if (!state.mood || !state.kebutuhan) {
      showToast('Pilih suasana hati dan kebutuhan dulu, ya.');
      return;
    }

    const tanggal = toISODate();
    const cuaca = resolveWeather(state);
    const entry = {
      id: uid(),
      tanggal,
      suasanaHati: state.mood,
      cuacaEmosi: cuaca,
      energi: state.energi,
      tidur: state.tidur,
      kebutuhan: state.kebutuhan,
      pikiranRingkas: state.pikiran.trim(),
      saranAktivitas: WEATHER_META[cuaca].advice[0],
    };

    const hasil = upsertCheckIn(entry);
    if (!hasil.ok) {
      showToast(hasil.message);
      return;
    }

    const host = document.getElementById('report-content');
    if (host) renderReportInto(host, getCheckInByDate(tanggal));
    showToast('Tersimpan 🌷');
  }

  return card({
    id: 'check-in',
    moduleName: 'check-in',
    title: 'How are you, really?',
    note: 'Empat pertanyaan singkat dan satu catatan opsional.',
    children: [
      el('div', { class: 'form' }, [
        field('Suasana hati hari ini', moodGroup, 'Pilih satu yang paling mendekati.'),
        el('div', { class: 'form__row' }, [
          slider('Kualitas tidur', 'tidur', 4),
          slider('Tingkat energi', 'energi', 3),
        ]),
        field('Kebutuhan hari ini', needGroup),
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'checkin-note', text: 'Pikiran hari ini (opsional)' }),
          note,
          counter,
        ]),
        el('button', {
          type: 'button',
          class: 'btn btn--primary btn--block',
          text: 'Simpan Check-In',
          onclick: save,
        }),
      ]),
    ],
  });
}

/* -------------------------------------------------------------------------- */
/* F-02 — Emotional Report, Weather & Little Reminder                          */
/* -------------------------------------------------------------------------- */

function renderReportInto(host, entry) {
  host.replaceChildren();

  if (!entry) {
    host.append(
      el('div', { class: 'report__empty' }, [
        renderSprout(),
        el('p', { class: 'card__note', text: 'Belum ada check-in. Isi dulu, ya — ruang ini akan menemani.' }),
      ]),
    );
    return;
  }

  const meta = WEATHER_META[entry.cuacaEmosi] ?? WEATHER_META.berawan;
  const hariIni = entry.tanggal === toISODate();
  const tanggalLabel = formatDate(`${entry.tanggal}T12:00:00`, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const head = el('div', { class: 'report__head' }, [
    el('div', { class: 'report__icon', 'aria-hidden': 'true', text: meta.icon }),
    el('div', { class: 'report__meta' }, [
      el('p', { class: 'report__weather', text: meta.label }),
      el('p', { class: 'report__date', text: `${tanggalLabel} · ${hariIni ? 'Hari ini' : 'Terakhir'}` }),
    ]),
  ]);
  if (String(entry.id).startsWith('seed-')) {
    head.append(el('span', { class: 'badge', text: 'Data contoh' }));
  }

  const bungaReminder = el(
    'button',
    { type: 'button', class: 'sprig-button', 'aria-label': 'Sentuh bunga', title: 'Sentuh bunga' },
    [renderSprig()],
  );
  bungaReminder.addEventListener('click', () => playPop(bungaReminder));

  const reminder = el('div', { class: 'reminder' }, [
    el('p', { class: 'reminder__title', text: 'A Little Reminder For You' }),
    el('p', { class: 'reminder__quote', text: pickReminder(entry.tanggal) }),
    bungaReminder,
  ]);

  const care = el(
    'div',
    { class: 'care-chips', role: 'list', 'aria-label': 'Saran self-care' },
    meta.advice.map((saran) =>
      el('span', { class: 'care-chip', role: 'listitem' }, [
        el('span', { 'aria-hidden': 'true', text: '🌿' }),
        el('span', { text: saran }),
      ]),
    ),
  );

  host.append(
    el('div', { class: 'report' }, [
      head,
      el('p', { class: 'report__line', text: meta.line }),
      reminder,
      care,
      entry.kebutuhan
        ? el('p', { class: 'report__detail', text: `Kebutuhanmu hari ini: ${entry.kebutuhan}.` })
        : null,
      el('p', { class: 'inline-disclaimer', text: CHECKIN_DISCLAIMER }),
    ]),
  );
}

function renderReportCard() {
  const host = el('div', { id: 'report-content', class: 'report-host' });
  renderReportInto(host, getCheckInByDate(toISODate()) ?? getLatestCheckIn());

  return card({
    moduleName: 'report',
    title: 'Emotional Report & Little Reminder',
    note: 'Ringkasan cuaca emosi, pengingat kecil, dan saran self-care.',
    children: [host],
  });
}

/* -------------------------------------------------------------------------- */
/* F-03 + F-04 — Journal, Little Wins & Companion                              */
/* -------------------------------------------------------------------------- */

function renderJournalCard() {
  const checkinTerakhir = getLatestCheckIn();
  const moodAwal = latestMood(checkinTerakhir ? [checkinTerakhir] : []);

  const companion = { topik: 'Umum', mood: moodAwal, index: -1, current: '' };
  const question = el('p', { class: 'companion__question', text: '' });

  function refreshQuestion() {
    const daftar = questionsFor({
      topik: companion.topik,
      mood: companion.mood,
      sources: REFLECTIVE_QUESTIONS,
    });
    const hasil = nextItem(daftar, companion.index);
    companion.index = hasil.index;
    companion.current = hasil.item;
    question.textContent = hasil.item || 'Belum ada pertanyaan untuk topik ini.';
  }

  refreshQuestion();

  const topicSelect = el(
    'select',
    {
      id: 'reflection-topic',
      class: 'select',
      'aria-label': 'Topik refleksi',
      onchange: (event) => {
        companion.topik = event.target.value;
        companion.index = -1;
        refreshQuestion();
      },
    },
    REFLECTIVE_TOPICS.map((topik) => el('option', { value: topik, text: topik })),
  );

  const moodSelect = el(
    'select',
    {
      id: 'journal-mood',
      class: 'select',
      'aria-label': 'Mood jurnal',
      onchange: (event) => {
        companion.mood = event.target.value;
        companion.index = -1;
        refreshQuestion();
      },
    },
    ['', ...MOODS.map((item) => item.value)].map((value) =>
      el('option', { value, text: value || 'Pilih mood (opsional)' }),
    ),
  );
  moodSelect.value = moodAwal;

  const judul = el('input', {
    id: 'journal-title',
    class: 'input',
    type: 'text',
    placeholder: 'Misalnya: Hari yang pelan',
  });
  const isi = el('textarea', {
    id: 'journal-body',
    class: 'textarea textarea--tall',
    rows: '4',
    placeholder: 'Ceritakan apa saja di sini…',
  });
  const kecil = el('input', {
    id: 'journal-win',
    class: 'input',
    type: 'text',
    placeholder: 'Misalnya: Berhasil bangun tepat waktu',
  });

  function saveJournal() {
    if (!isi.value.trim()) {
      showToast('Tulis sedikit dulu, ya.');
      isi.focus();
      return;
    }

    const hasil = addJournal({
      id: uid(),
      tanggal: toISOLocalDateTime(),
      mood: companion.mood,
      judul: judul.value.trim() || 'Refleksi tanpa judul',
      isi: isi.value.trim(),
      littleWin: kecil.value.trim(),
      pertanyaanReflektif: companion.current,
    });

    if (!hasil.ok) {
      showToast(hasil.message);
      return;
    }

    judul.value = '';
    isi.value = '';
    kecil.value = '';
    renderJournalHistoryInto(document.getElementById('journal-history'));
    showToast('Jurnal tersimpan 🌷');
  }

  return card({
    moduleName: 'journal',
    title: 'Tulis refleksi',
    note: 'Pertanyaan reflektif ini dibuat otomatis dari pola sederhana di perangkatmu.',
    children: [
      el('div', { class: 'companion' }, [
        el('div', { class: 'companion__top' }, [
          el('span', { class: 'companion__label', text: 'AI Journal Companion · simulasi lokal' }),
          cuteIconButton({
            icon: renderSparkleIcon(),
            label: 'Pertanyaan lain',
            onClick: refreshQuestion,
          }),
        ]),
        question,
        el('div', { class: 'companion__controls' }, [topicSelect, moodSelect]),
      ]),
      el('div', { class: 'form' }, [
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'journal-title', text: 'Judul (opsional)' }),
          judul,
        ]),
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'journal-body', text: 'Isi jurnal' }),
          isi,
        ]),
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'journal-win', text: 'Little win hari ini (opsional)' }),
          kecil,
        ]),
        el('button', {
          type: 'button',
          class: 'btn btn--primary btn--block',
          text: 'Simpan Jurnal',
          onclick: saveJournal,
        }),
      ]),
    ],
  });
}

export function renderJournalHistoryInto(host) {
  if (!host) return;

  let visible = JOURNAL_PREVIEW_LIMIT;

  function draw() {
    host.replaceChildren();
    const semua = sortByNewest(getJournals());

    if (!semua.length) {
      host.append(
        emptyState(
          renderSprout(),
          'Belum ada catatan di sini',
          'Tulis satu kalimat saja tidak apa-apa. Ruang ini menunggumu dengan sabar.',
        ),
      );
      return;
    }

    const daftar = el(
      'div',
      { class: 'journal-list' },
      takeFirst(semua, visible).map((entry) => {
        const tanggal = formatDate(entry.tanggal, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const isiKartu = el('div', { class: 'journal-item__body' }, [
          el('p', { class: 'journal-item__date', text: tanggal }),
          el('p', { class: 'journal-item__title', text: entry.judul || 'Refleksi tanpa judul' }),
          el('p', { class: 'journal-item__text', text: entry.isi || 'Isi tidak tersedia.' }),
        ]);

        if (hasLittleWin(entry)) {
          isiKartu.append(
            el('p', { class: 'win-badge' }, [
              el('span', { 'aria-hidden': 'true', text: '🌱' }),
              el('span', { text: entry.littleWin }),
            ]),
          );
        }

        if (entry.pertanyaanReflektif) {
          isiKartu.append(
            el('p', { class: 'journal-item__question', text: `“${entry.pertanyaanReflektif}”` }),
          );
        }

        const item = el('article', { class: 'journal-item' }, [
          cuteIconButton({ icon: renderFlowerIcon(), label: 'Hiasan bunga', onClick: () => {} }),
          isiKartu,
          el('button', {
            type: 'button',
            class: 'btn-text',
            text: 'Hapus',
            'aria-label': `Hapus jurnal ${entry.judul || 'tanpa judul'}`,
            onclick: () => {
              if (!window.confirm('Hapus catatan ini?')) return;
              const hasil = removeJournal(entry.id);
              if (!hasil.ok) showToast(hasil.message);
              else {
                draw();
                showToast('Catatan dihapus 🌿');
              }
            },
          }),
        ]);

        if (String(entry.id).startsWith('seed-')) {
          item.append(el('span', { class: 'badge badge--seed', text: 'Data contoh' }));
        }
        return item;
      }),
    );

    host.append(daftar);

    if (semua.length > visible) {
      host.append(
        el('button', {
          type: 'button',
          class: 'btn btn--secondary btn--block',
          text: `Tampilkan lebih banyak (${semua.length - visible} lagi)`,
          onclick: () => {
            visible += JOURNAL_PREVIEW_LIMIT;
            draw();
          },
        }),
      );
    }
  }

  draw();
}

function renderJournalHistoryCard() {
  return card({
    moduleName: 'journal-history',
    title: 'Riwayat jurnal',
    note: 'Catatanmu tersusun dari yang terbaru. Kemenangan kecil ikut dirayakan di sini.',
    children: [el('div', { id: 'journal-history' })],
  });
}

/* -------------------------------------------------------------------------- */
/* F-07 — Safe Space & Daily Affirmation                                       */
/* -------------------------------------------------------------------------- */

function renderBreathingCard() {
  const phase = el('p', { class: 'breathing__phase', text: 'Siap' });
  const cycle = el('p', { class: 'breathing__cycle', text: 'Siklus 0/3' });
  const fill = el('div', { class: 'breathing__fill' });
  const circle = el('div', { class: 'breathing__circle', dataset: { phase: 'idle' } }, [
    el('span', { 'aria-hidden': 'true', text: '🌷' }),
  ]);
  let berjalan = false;
  let phaseIndex = 0;
  let siklus = 0;
  let sisa = 0;

  const tombol = el('button', {
    type: 'button',
    class: 'btn btn--primary',
    text: 'Mulai',
    onclick: () => (berjalan ? berhenti() : mulai()),
  });

  const bunga = cuteIconButton({
    icon: renderFlowerIcon(),
    label: 'Mulai atau hentikan napas',
    onClick: () => (berjalan ? berhenti() : mulai()),
  });

  function gambar() {
    const aktif = BREATHING.phases[phaseIndex];
    phase.textContent = berjalan ? `${aktif.label} · ${sisa}` : 'Siap';
    cycle.textContent = berjalan
      ? `Siklus ${Math.min(siklus + 1, BREATHING.cycles)}/${BREATHING.cycles}`
      : `Siklus 0/${BREATHING.cycles}`;
    const total = BREATHING.cycles * BREATHING.phases.length;
    const selesai = siklus * BREATHING.phases.length + phaseIndex;
    fill.style.width = `${Math.round((selesai / total) * 100)}%`;
    circle.dataset.phase = berjalan ? aktif.key : 'idle';
    tombol.textContent = berjalan ? 'Berhenti' : 'Mulai';
  }

  function detak() {
    sisa -= 1;
    if (sisa > 0) {
      gambar();
      return;
    }
    phaseIndex += 1;
    if (phaseIndex >= BREATHING.phases.length) {
      phaseIndex = 0;
      siklus += 1;
      if (siklus >= BREATHING.cycles) {
        berhenti();
        phase.textContent = 'Selesai 🌷';
        return;
      }
    }
    sisa = BREATHING.phases[phaseIndex].seconds;
    gambar();
  }

  function mulai() {
    stopBreathingTimer();
    berjalan = true;
    phaseIndex = 0;
    siklus = 0;
    sisa = BREATHING.phases[0].seconds;
    breathingTimer = window.setInterval(detak, 1000);
    gambar();
  }

  function berhenti() {
    stopBreathingTimer();
    berjalan = false;
    phaseIndex = 0;
    siklus = 0;
    sisa = 0;
    gambar();
  }

  return card({
    moduleName: 'breathing',
    className: 'card--breathing',
    title: 'Latihan napas',
    note: 'Tarik 4 detik · Tahan 4 detik · Hembus 6 detik, tiga siklus.',
    children: [
      el('div', { class: 'breathing' }, [
        el('div', { class: 'breathing__visual' }, [bunga, circle]),
        phase,
        cycle,
        el('div', { class: 'breathing__track' }, [fill]),
        el('div', { class: 'breathing__actions' }, [tombol]),
      ]),
    ],
  });
}

function renderAffirmationCard() {
  let index = Math.floor(Math.random() * AFFIRMATIONS.length);
  const quote = el('p', { class: 'affirmation__quote', text: AFFIRMATIONS[index] });

  function lain() {
    const hasil = nextItem(AFFIRMATIONS, index);
    index = hasil.index;
    quote.textContent = hasil.item;
  }

  return card({
    moduleName: 'affirmation',
    title: 'Afirmasi Harian',
    note: 'Satu kalimat kecil untuk dibawa sepanjang hari.',
    className: 'card--affirmation',
    children: [
      el('div', { class: 'affirmation' }, [
        quote,
        el('div', { class: 'affirmation__actions' }, [
          cuteIconButton({ icon: renderStarIcon(), label: 'Afirmasi lain', onClick: lain }),
          el('button', {
            type: 'button',
            class: 'btn btn--secondary',
            text: 'Afirmasi lain',
            onclick: lain,
          }),
        ]),
      ]),
    ],
  });
}

/* -------------------------------------------------------------------------- */
/* F-05 — Thought Reframing                                                    */
/* -------------------------------------------------------------------------- */

function renderReframeCard() {
  const pikiran = el('textarea', {
    id: 'reframe-thought',
    class: 'textarea',
    rows: '3',
    placeholder: 'Apa pikiran yang muncul?',
  });
  const fakta = el('textarea', {
    id: 'reframe-fact',
    class: 'textarea',
    rows: '2',
    placeholder: 'Fakta atau evaluasi singkat (opsional)',
  });
  const seimbang = el('textarea', {
    id: 'reframe-balanced',
    class: 'textarea',
    rows: '3',
    placeholder: 'Sudut pandang yang lebih seimbang…',
  });

  function save() {
    if (!pikiran.value.trim() || !seimbang.value.trim()) {
      showToast('Isi pikiran dan sudut pandang dulu, ya.');
      return;
    }

    const hasil = addReframe({
      id: uid(),
      tanggal: toISOLocalDateTime(),
      pikiranAwal: combineReframe(pikiran.value, fakta.value),
      sudutPandangSeimbang: seimbang.value.trim(),
    });

    if (!hasil.ok) {
      showToast(hasil.message);
      return;
    }

    pikiran.value = '';
    fakta.value = '';
    seimbang.value = '';
    renderReframeHistoryInto(document.getElementById('reframe-history'));
    showToast('Reframing tersimpan 🌿');
  }

  return card({
    moduleName: 'reframe',
    title: 'Pikiran → sudut pandang',
    note: 'Tiga langkah kecil: apa yang muncul, apa faktanya, lalu versi yang lebih lembut.',
    children: [
      el('div', { class: 'form' }, [
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'reframe-thought', text: '1. Pikiran yang muncul' }),
          pikiran,
        ]),
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'reframe-fact', text: '2. Fakta / evaluasi singkat' }),
          fakta,
        ]),
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'reframe-balanced', text: '3. Sudut pandang seimbang' }),
          seimbang,
        ]),
        el('button', {
          type: 'button',
          class: 'btn btn--primary btn--block',
          text: 'Simpan Reframing',
          onclick: save,
        }),
      ]),
    ],
  });
}

export function renderReframeHistoryInto(host) {
  if (!host) return;

  function draw() {
    host.replaceChildren();
    const semua = sortByNewest(getReframes());

    if (!semua.length) {
      host.append(
        emptyState(
          renderSparkleIcon(),
          'Belum ada reframing',
          'Saat ada pikiran yang terasa berat, coba lihat dari sudut lain di sini.',
        ),
      );
      return;
    }

    host.append(
      el(
        'div',
        { class: 'entry-list' },
        semua.map((entry) =>
          el('article', { class: 'entry-item' }, [
            el('div', { class: 'entry-item__body' }, [
              el('p', { class: 'entry-item__date', text: formatDate(entry.tanggal) }),
              el('p', { class: 'entry-item__label', text: 'Pikiran awal' }),
              el('p', { class: 'entry-item__text', text: entry.pikiranAwal || 'Pikiran awal tidak tersedia.' }),
              el('p', { class: 'entry-item__arrow', 'aria-hidden': 'true', text: '↓' }),
              el('p', { class: 'entry-item__label entry-item__label--soft', text: 'Sudut pandang seimbang' }),
              el('p', {
                class: 'entry-item__text entry-item__text--soft',
                text: entry.sudutPandangSeimbang || 'Sudut pandang tidak tersedia.',
              }),
            ]),
            el('button', {
              type: 'button',
              class: 'btn-text',
              text: 'Hapus',
              onclick: () => {
                if (!window.confirm('Hapus reframing ini?')) return;
                const hasil = removeReframe(entry.id);
                if (!hasil.ok) showToast(hasil.message);
                else {
                  draw();
                  showToast('Reframing dihapus 🌿');
                }
              },
            }),
          ]),
        ),
      ),
    );
  }

  draw();
}

function renderReframeHistoryCard() {
  return card({
    moduleName: 'reframe-history',
    title: 'Riwayat reframing',
    note: 'Setiap versi seimbang yang pernah kamu tulis tersimpan di sini.',
    children: [el('div', { id: 'reframe-history' })],
  });
}

/* -------------------------------------------------------------------------- */
/* F-06 — Letters to Future Me                                                 */
/* -------------------------------------------------------------------------- */

function renderLetterCard() {
  const judul = el('input', {
    id: 'letter-title',
    class: 'input',
    type: 'text',
    placeholder: 'Misalnya: Untuk diriku yang lebih tenang',
  });
  const isi = el('textarea', {
    id: 'letter-body',
    class: 'textarea textarea--tall',
    rows: '5',
    placeholder: 'Tulis surat untuk dirimu yang akan datang…',
  });
  const tanggal = el('input', {
    id: 'letter-open-date',
    class: 'input',
    type: 'date',
    min: shiftISODate(1),
  });

  function save() {
    if (!judul.value.trim() || !isi.value.trim() || !tanggal.value) {
      showToast('Isi judul, surat, dan tanggal buka dulu, ya.');
      return;
    }
    if (tanggal.value < shiftISODate(1)) {
      showToast('Tanggal buka minimal besok.');
      return;
    }

    const hasil = addLetter({
      id: uid(),
      tanggalBuat: toISOLocalDateTime(),
      tanggalBuka: tanggal.value,
      judul: judul.value.trim(),
      isiSurat: isi.value.trim(),
      terbuka: false,
    });

    if (!hasil.ok) {
      showToast(hasil.message);
      return;
    }

    judul.value = '';
    isi.value = '';
    tanggal.value = '';
    renderLetterListInto(document.getElementById('letter-list'));
    showToast('Surat tersimpan 💌');
  }

  return card({
    moduleName: 'letters',
    title: 'Surat baru',
    note: 'Pilih tanggal buka, lalu biarkan surat menunggu dengan tenang.',
    className: 'card--letter',
    children: [
      el('div', { class: 'form' }, [
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'letter-title', text: 'Judul surat' }),
          judul,
        ]),
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'letter-body', text: 'Isi surat' }),
          isi,
        ]),
        el('div', { class: 'field' }, [
          el('label', { class: 'field__label', for: 'letter-open-date', text: 'Tanggal buka' }),
          tanggal,
          el('span', { class: 'field__hint', text: 'Minimal besok. Isi surat disembunyikan sampai tiba.' }),
        ]),
        el('button', {
          type: 'button',
          class: 'btn btn--primary btn--block',
          text: 'Simpan Surat',
          onclick: save,
        }),
      ]),
    ],
  });
}

export function renderLetterListInto(host) {
  if (!host) return;

  function draw() {
    host.replaceChildren();
    const semua = sortByNewest(getLetters(), 'tanggalBuat');

    if (!semua.length) {
      host.append(
        emptyState(
          renderHeartIcon(),
          'Kotak surat masih kosong',
          'Tulis satu surat kecil untuk dirimu. Surat akan menunggu sampai waktunya.',
        ),
      );
      return;
    }

    host.append(
      el(
        'div',
        { class: 'letter-list' },
        semua.map((entry) => {
          const terbuka = isLetterOpen(entry, toISODate());
          const badan = el('div', { class: 'letter-item__body' }, [
            el('p', { class: 'letter-item__date', text: formatDate(entry.tanggalBuat) }),
            el('p', { class: 'letter-item__title', text: entry.judul || 'Surat tanpa judul' }),
          ]);

          if (terbuka) {
            badan.append(
              el('span', { class: 'status status--open', text: '🌷 Terbuka' }),
              el('p', { class: 'letter-item__text', text: entry.isiSurat || 'Isi surat tidak tersedia.' }),
            );
          } else {
            const tanggalBuka = formatDate(`${entry.tanggalBuka ?? ''}T12:00:00`);
            badan.append(
              el('span', { class: 'status status--locked', text: '🔒 Terkunci' }),
              el('p', {
                class: 'letter-item__hint',
                text: tanggalBuka ? `Dibuka pada ${tanggalBuka}.` : 'Menunggu tanggal buka.',
              }),
            );
          }

          const artikel = el('article', { class: 'letter-item' }, [badan]);

          if (!terbuka) {
            artikel.append(
              el('button', {
                type: 'button',
                class: 'btn btn--secondary btn--small',
                text: 'Buka sekarang (uji)',
                title: 'Untuk verifikasi manual',
                onclick: () => {
                  const hasil = patchLetter(entry.id, { terbuka: true });
                  if (!hasil.ok) showToast(hasil.message);
                  else {
                    draw();
                    showToast('Surat terbuka 💌');
                  }
                },
              }),
            );
          }

          artikel.append(
            el('button', {
              type: 'button',
              class: 'btn-text',
              text: 'Hapus',
              onclick: () => {
                if (!window.confirm('Hapus surat ini?')) return;
                const hasil = removeLetter(entry.id);
                if (!hasil.ok) showToast(hasil.message);
                else {
                  draw();
                  showToast('Surat dihapus 💌');
                }
              },
            }),
          );

          return artikel;
        }),
      ),
    );
  }

  draw();
}

function renderLetterListCard() {
  return card({
    moduleName: 'letters-list',
    title: 'Kotak surat',
    note: 'Surat terkunci merahasiakan isinya sampai tanggal buka tiba.',
    children: [el('div', { id: 'letter-list' })],
  });
}

/* -------------------------------------------------------------------------- */
/* F-08 — My Growth Journey                                                    */
/* -------------------------------------------------------------------------- */

function renderJourneyCard() {
  const host = el('div', { class: 'journey' });

  function draw() {
    host.replaceChildren();
    const ringkasan = buildJourneySummary(readAll(), toISODate());
    const cuaca = ringkasan.cuacaTerakhir ? WEATHER_META[ringkasan.cuacaTerakhir] : null;

    const stats = [
      { value: String(ringkasan.totalCheckIns), label: 'Check-In' },
      {
        value: cuaca ? `${cuaca.icon} ${cuaca.label}` : '—',
        label: 'Cuaca terakhir',
      },
      { value: String(ringkasan.totalJurnal), label: 'Jurnal' },
      { value: String(ringkasan.totalLittleWins), label: 'Little Wins' },
    ];

    host.append(
      el(
        'div',
        { class: 'stat-grid' },
        stats.map((stat) =>
          el('div', { class: 'stat' }, [
            el('p', { class: 'stat__value', text: stat.value }),
            el('p', { class: 'stat__label', text: stat.label }),
          ]),
        ),
      ),
      el('p', {
        class: 'journey__bonus',
        text: `Reframing tersimpan: ${ringkasan.totalReframe} · Surat terbuka: ${ringkasan.totalSuratTerbuka}`,
      }),
    );

    if (ringkasan.dataContoh) {
      host.append(
        el('span', { class: 'seed-note' }, [
          el('span', { 'aria-hidden': 'true' }, [renderFlowerIcon()]),
          el('span', { text: 'Data contoh (bukan data pribadi)' }),
        ]),
      );
    }

    host.append(
      el('div', { class: 'journey__actions' }, [
        el('button', {
          type: 'button',
          class: 'btn btn--secondary',
          text: 'Muat ulang data contoh',
          onclick: () => {
            if (!window.confirm('Muat ulang data contoh? Data saat ini akan ditimpa.')) return;
            loadSeed();
            draw();
            showToast('Data contoh dimuat 🌷');
          },
        }),
        el('button', {
          type: 'button',
          class: 'btn btn--secondary',
          text: 'Hapus semua data',
          onclick: () => {
            if (!window.confirm('Hapus semua data? Tindakan ini tidak bisa dibatalkan.')) return;
            clearAll();
            draw();
            showToast('Semua data dihapus 🌿');
          },
        }),
      ]),
    );
  }

  draw();

  return card({
    moduleName: 'growth',
    title: 'Ringkasan pertumbuhan',
    note: 'Angka kecil dari jejak yang sudah kamu jalani di perangkat ini.',
    children: [host],
  });
}

/** Konten tiap tab. Modul fitur akan dipasang di sini pada iterasi berikutnya. */
export function renderContent(main, activeTab) {
  let content;

  switch (activeTab) {
    case 'beranda':
      content = el('div', { class: 'stack' }, [
        renderHero(),
        el('div', { class: 'grid grid--two' }, [
          renderCheckInCard(),
          renderReportCard(),
        ]),
        el('div', { class: 'grid grid--two' }, [
          renderBreathingCard(),
          renderAffirmationCard(),
        ]),
        renderJourneyCard(),
      ]);
      break;

    case 'jurnal':
      content = el('div', { class: 'stack' }, [
        pageIntro('My Journal & Little Wins', 'Tulis apa saja. Kemenangan kecil juga layak dicatat.', renderFlowerIcon()),
        renderJournalCard(),
        renderJournalHistoryCard(),
      ]);
      break;

    case 'reframing':
      content = el('div', { class: 'stack' }, [
        pageIntro('Thought Reframing', 'Lihat pikiran awal, lalu cari sudut pandang yang lebih seimbang.', renderSparkleIcon()),
        renderReframeCard(),
        renderReframeHistoryCard(),
      ]);
      break;

    case 'surat':
      content = el('div', { class: 'stack' }, [
        pageIntro('Letters to Future Me', 'Tulis surat untuk dirimu yang akan datang.', renderHeartIcon()),
        renderLetterCard(),
        renderLetterListCard(),
      ]);
      break;

    case 'safe-space':
      content = el('div', { class: 'stack stack--two' }, [
        pageIntro('Safe Space', 'Berhenti sejenak. Tarik napas. Kamu tidak harus melakukan apa pun.', renderFlowerIcon()),
        renderBreathingCard(),
        renderAffirmationCard(),
      ]);
      break;

    case 'journey':
    default:
      content = el('div', { class: 'stack' }, [
        pageIntro('My Growth Journey', 'Lihat jejak kecil yang sudah kamu jalani.', renderLeafIcon()),
        renderJourneyCard(),
        el('p', { class: 'inline-disclaimer', text: DISCLAIMER_SHORT }),
      ]);
      break;
  }

  stopBreathingTimer();
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
