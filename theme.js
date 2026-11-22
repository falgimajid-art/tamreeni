/* ألوان التطبيق: لوحات اللون + وضع الخلفية. تُطبَّق قبل الرسم حتى لا يظهر وميض */
'use strict';
const PALETTES = {
  sage:     { n: 'أخضر هادئ', a: '#86b8a8', s: '#6fa593', i: '#14211c', h: 125, la: '#3b8a72', ls: '#2f7561' },
  ocean:    { n: 'أزرق',      a: '#7fb2e5', s: '#5f9ad3', i: '#0f1c2a', h: 212, la: '#2f78bd', ls: '#2565a1' },
  teal:     { n: 'تركوازي',   a: '#62c8cf', s: '#45b3bb', i: '#0b2022', h: 178, la: '#1f8f98', ls: '#187a82' },
  sand:     { n: 'رملي',      a: '#e0b972', s: '#cda35a', i: '#2a1f0c', h: 38,  la: '#a97a1f', ls: '#8f6616' },
  coral:    { n: 'مرجاني',    a: '#f0907a', s: '#e07a62', i: '#2c140d', h: 8,   la: '#cf5a3f', ls: '#b44a31' },
  rose:     { n: 'وردي',      a: '#e59aa8', s: '#d27f8f', i: '#2a1117', h: 345, la: '#bd5870', ls: '#a34860' },
  lavender: { n: 'بنفسجي',    a: '#b4a3e8', s: '#9d8bdc', i: '#1a1430', h: 262, la: '#6a55c4', ls: '#5a46ae' }
};
const MODES = {
  dark:  { n: 'داكن',  bg: '#1b1f22', surface: '#232a2d', surface2: '#2b3337', line: '#333d41', text: '#e8eeea', muted: '#8d9b9f' },
  black: { n: 'أسود',  bg: '#0a0b0c', surface: '#141719', surface2: '#1c2023', line: '#262b2f', text: '#eef2ef', muted: '#8a979b' },
  light: { n: 'فاتح',  bg: '#f1f4f2', surface: '#ffffff', surface2: '#e8edeb', line: '#d6dedb', text: '#172024', muted: '#5f6f74' }
};
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
}
function getTheme() {
  let t = {};
  try { t = (JSON.parse(localStorage.getItem('tamreeni.v1')) || {}).settings?.theme || {}; } catch (e) { /* ok */ }
  return { accent: PALETTES[t.accent] ? t.accent : 'sage', mode: MODES[t.mode] ? t.mode : 'dark' };
}
function applyTheme() {
  const t = getTheme(), p = PALETTES[t.accent], m = MODES[t.mode], light = t.mode === 'light';
  const r = document.documentElement.style, set = (k, v) => r.setProperty(k, v);
  set('--bg', m.bg); set('--surface', m.surface); set('--surface2', m.surface2); set('--line', m.line); set('--text', m.text); set('--muted', m.muted);
  const a = light ? p.la : p.a;
  set('--accent', a); set('--accent-strong', light ? p.ls : p.s); set('--accent-ink', light ? '#ffffff' : p.i);
  set('--accent-soft', hexA(a, light ? 0.13 : 0.15)); set('--hue', p.h + 'deg');
  set('--mus', light ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.06)');
  document.documentElement.dataset.mode = t.mode;
  let meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', m.bg);
}
applyTheme();
