/* تمريني — منطق التطبيق (بيانات محفوظة محلياً على الجهاز) */
'use strict';

/* ================= أدوات ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : NaN; };
const fmtN = n => (Math.round(n * 10) / 10).toString();

const ICONS = {
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  play: '<path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4M8 20h8"/>',
  x: '<path d="M5 5l14 14M19 5L5 19"/>',
  chevl: '<path d="M15 5l-7 7 7 7"/>', chevr: '<path d="M9 5l7 7-7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.6c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/>',
  up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  arrowr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  more: '<circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  grip: '<g fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></g>',
  home2: '<path d="M4 20V9l8-5 8 5v11zM9 20v-6h6v6"/>'
};
const ic = (n, c = '') => `<svg class="ico ${c}" viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;

let dfDay, dfWd, dfFull;
try {
  dfDay = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'long' });
  dfWd = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'long' });
  dfFull = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' });
} catch (e) { dfDay = dfWd = dfFull = { format: d => new Date(d).toLocaleDateString() }; }
const fDay = d => dfDay.format(new Date(d));
const fWd = d => dfWd.format(new Date(d));
const dayKey = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const todayKey = () => dayKey(new Date());
function weekStart(d = new Date()) { // بداية الأسبوع: السبت
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 1) % 7));
  return x;
}
const fmtTime = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60), r = s % 60; return m + ':' + String(r).padStart(2, '0'); };
const fmtDur = s => { const m = Math.round(s / 60); return m >= 60 ? Math.floor(m / 60) + ' س ' + (m % 60) + ' د' : m + ' د'; };
const e1rm = (w, r) => (w > 0 ? w : 1) * (1 + r / 30);
const setTxt = s => `${fmtN(s.w)} kg × ${fmtN(s.r)}`;

let toastT;
function toast(msg) {
  $('.toast')?.remove();
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2200);
}

/* ================= الحالة ================= */
const KEY = 'tamreeni.v1';
function defaults() {
  return { v: 1, name: '', mine: ['ul101'], active: 'ul101', next: {}, custom: [], overrides: {}, logs: [], weight: [], body: {}, settings: { sound: true }, activeWorkout: null };
}
let S = (() => {
  try { const r = localStorage.getItem(KEY); if (r) return Object.assign(defaults(), JSON.parse(r)); } catch (e) {}
  return defaults();
})();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('تعذّر الحفظ: مساحة التخزين ممتلئة'); } }
try { navigator.storage?.persist?.(); } catch (e) {}

const allPrograms = () => [...BUILTIN_PROGRAMS, ...S.custom];
const getProg = id => allPrograms().find(p => p.id === id);
const dayEx = (p, i) => S.overrides[p.id + ':' + i] || p.days[i].ex;
const nextDay = p => Math.min(S.next[p.id] || 0, p.days.length - 1);
const exOf = id => EXERCISES[id];

function history(exId) {
  const out = [];
  [...S.logs].sort((a, b) => b.date.localeCompare(a.date)).forEach(l => {
    const e = l.ex.find(x => x.id === exId);
    if (e && e.sets.length) out.push({ date: l.date, sets: e.sets, log: l });
  });
  return out;
}
const bestOf = sets => sets.reduce((b, s) => (!b || e1rm(s.w, s.r) > e1rm(b.w, b.r) ? s : b), null);
const lastSets = exId => history(exId)[0]?.sets || null;

function weekSessions(offset = 0) {
  const st = weekStart(); st.setDate(st.getDate() + offset * 7);
  const en = new Date(st); en.setDate(en.getDate() + 7);
  return S.logs.filter(l => { const d = new Date(l.date); return d >= st && d < en; });
}
function muscleSets(logs) {
  const m = {};
  logs.forEach(l => l.ex.forEach(e => {
    const ex = exOf(e.id); if (!ex) return;
    const n = e.sets.length;
    ex.pri.forEach(k => m[k] = (m[k] || 0) + n);
    ex.sec.forEach(k => m[k] = (m[k] || 0) + n * 0.5);
  }));
  return m;
}

/* ================= نوافذ منبثقة ================= */
const sheetStack = [];
function openSheet(o) {
  const wrap = document.createElement('div'); wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet ${o.tall ? 'tall' : ''}">
    <div class="sheet-head"><button class="x-btn" data-x>${ic('x', 'lg')}</button><h2>${o.title || ''}</h2></div>
    <div class="sheet-body"></div>${o.foot ? '<div class="sheet-foot"></div>' : ''}</div>`;
  document.body.appendChild(wrap);
  const sh = $('.sheet', wrap), body = $('.sheet-body', wrap), foot = $('.sheet-foot', wrap);
  const api = {
    el: wrap, body, foot,
    set(html, keepScroll = true) { const y = body.scrollTop; body.innerHTML = html; if (keepScroll) body.scrollTop = y; o.onMount && o.onMount(api); },
    setFoot(html) { if (foot) { foot.innerHTML = html; } },
    title(t) { $('h2', wrap).innerHTML = t; },
    close() {
      if (!wrap.isConnected) return;
      sh.classList.add('closing'); wrap.style.background = 'transparent';
      setTimeout(() => wrap.remove(), 220);
      const i = sheetStack.indexOf(api); if (i >= 0) sheetStack.splice(i, 1);
      o.onClose && o.onClose();
    }
  };
  $('[data-x]', wrap).onclick = api.close;
  // اسحب الترويسة للأسفل لإغلاق النافذة
  (() => {
    const head = $('.sheet-head', wrap); let y0 = null, dy = 0;
    head.addEventListener('touchstart', e => { if (e.target.closest('[data-x]')) return; y0 = e.touches[0].clientY; dy = 0; sh.style.transition = 'none'; }, { passive: true });
    head.addEventListener('touchmove', e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = `translateY(${dy}px)`; }, { passive: true });
    head.addEventListener('touchend', () => { if (y0 === null) return; y0 = null; sh.style.transition = 'transform .2s ease'; if (dy > 110) api.close(); else sh.style.transform = ''; });
  })();
  wrap.addEventListener('click', e => { if (e.target === wrap) api.close(); });
  sheetStack.push(api);
  body.innerHTML = o.body || '';
  if (foot) foot.innerHTML = o.foot;
  o.onMount && o.onMount(api);
  return api;
}
function confirmSheet(title, text, okLabel, onOk, danger = true) {
  const s = openSheet({ title, body: `<p class="muted" style="line-height:1.7">${text}</p>`, foot: `<div class="row"><button class="btn sec" data-no>إلغاء</button><button class="btn ${danger ? 'danger' : ''}" data-ok>${okLabel}</button></div>` });
  $('[data-no]', s.foot).onclick = s.close;
  $('[data-ok]', s.foot).onclick = () => { s.close(); onOk(); };
}

/* ================= الواجهة الرئيسية ================= */
let tab = 'home';
const thumb = (id, cls = '') => `<div class="thumb ${cls}"><img src="img/${(EXERCISES[id] || {}).img || id}-0.jpg" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{innerHTML:figureSvg(exOf('${id}'),0)}))"></div>`;

const TABS = ['train', 'home', 'meas']; // من اليمين لليسار، والرئيسية في المنتصف
let navDir = '';
function render() {
  const v = $('#view');
  const fn = { home: viewHome, train: viewTrain, meas: viewMeas }[tab];
  v.innerHTML = '';
  fn(v);
  if (navDir) { $('.screen', v)?.classList.add(navDir); navDir = ''; }
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === tab));
  updateResume();
}
function go(t) {
  if (t === tab) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; } // الضغط على نفس التبويب = للأعلى
  navDir = TABS.indexOf(t) > TABS.indexOf(tab) ? 'from-l' : 'from-r';
  tab = t; render(); window.scrollTo(0, 0);
}
/* شريط "تمرين جاري" يظهر فوق الأزرار السفلية عندما تكون مصغّراً التمرين */
function updateResume() {
  let el = $('#resume');
  if (S.activeWorkout && !$('#wk')) {
    if (!el) { el = document.createElement('button'); el.id = 'resume'; el.className = 'resume'; document.body.appendChild(el); el.onclick = () => openWorkout(); }
    el.innerHTML = `${ic('play')}<span class="grow"><span>تمرين جاري — متابعة</span><small class="ltr" style="direction:rtl">${esc(S.activeWorkout.dayName)}</small></span>${ic('chevl')}`;
  } else el?.remove();
}
/* سحب يميناً/يساراً للتنقل بين الصفحات (يتجاهل القوائم الأفقية والحقول) */
(() => {
  let sx = 0, sy = 0, t0 = 0, ok = false;
  document.addEventListener('touchstart', e => {
    const t = e.touches[0]; sx = t.clientX; sy = t.clientY; t0 = Date.now();
    ok = e.touches.length === 1 && !sheetStack.length && !$('#wk') && !e.target.closest('.carousel, .chips, .day-tabs, input, textarea, select, .chart, .seg');
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!ok) return; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 45 && Math.abs(dx) > Math.abs(dy) * 2 && Date.now() - t0 < 600) {
      const i = TABS.indexOf(tab) + (dx > 0 ? 1 : -1); // الواجهة من اليمين لليسار
      if (TABS[i]) go(TABS[i]);
    }
  }, { passive: true });
})();

/* ---------- تغيير الاسم (بزر حفظ واضح) ---------- */
function openNameSheet() {
  const s = openSheet({ title: 'اسمك', body: '', foot: '' });
  s.set(`<div class="field"><label>الاسم الذي يظهر في الرئيسية</label><div class="name-row"><input class="inp" id="nm" value="${esc(S.name)}" placeholder="اكتب اسمك" maxlength="24" autocomplete="off"><button class="btn" id="nm-save" disabled>حفظ</button></div></div>`);
  wireNameInput(s.body, () => s.close());
  setTimeout(() => $('#nm', s.body)?.focus(), 320);
}
function wireNameInput(root, after) {
  const inp = $('#nm', root), btn = $('#nm-save', root), orig = S.name || '';
  const dirty = () => { const v = inp.value.trim(); btn.disabled = !v || v === orig; };
  const commit = () => { const v = inp.value.trim(); if (!v || v === orig) return; S.name = v; save(); toast('تم حفظ الاسم ✓'); render(); after && after(); };
  inp.oninput = dirty; btn.onclick = commit; inp.onkeydown = e => { if (e.key === 'Enter') commit(); };
  dirty();
}

/* ---------- الرئيسية ---------- */
function viewHome(v) {
  const p = getProg(S.active) || BUILTIN_PROGRAMS[0];
  const di = nextDay(p), exs = dayEx(p, di);
  const wk = weekSessions().length;
  const resume = S.activeWorkout;
  const sets = exs.reduce((a, e) => a + e[1], 0);
  const mins = Math.round(exs.reduce((a, e) => a + e[1] * (45 + e[3]), 0) / 60);
  // أيام الأسبوع
  const st = weekStart(); const names = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];
  const trained = new Set(S.logs.map(l => dayKey(l.date)));
  const dots = names.map((n, i) => {
    const d = new Date(st); d.setDate(d.getDate() + i);
    const on = trained.has(dayKey(d)), isT = dayKey(d) === todayKey();
    return `<div style="text-align:center;flex:1"><div style="width:34px;height:34px;margin:0 auto 5px;border-radius:50%;display:grid;place-items:center;background:${on ? 'var(--accent)' : 'var(--surface2)'};color:${on ? 'var(--accent-ink)' : 'var(--muted)'};${isT ? 'outline:2px solid var(--accent);outline-offset:2px' : ''}">${on ? ic('check', 'sm') : ''}</div><span class="small muted">${n}</span></div>`;
  }).join('');
  const lw = [...S.weight].sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastLog = [...S.logs].sort((a, b) => b.date.localeCompare(a.date))[0];
  const hello = S.name ? esc(S.name) : 'بطل';
  v.innerHTML = `<div class="screen">
    <div class="topbar">
      <button class="hello" id="b-name" aria-label="تغيير الاسم" style="text-align:start"><div class="avatar">${esc((S.name || 'ب')[0].toUpperCase())}</div><div><small>أهلاً 👋</small><b>${hello}</b></div></button>
      <div class="top-actions"><button class="icon-btn" id="b-set">${ic('gear')}</button></div>
    </div>
    <div class="card">
      <div class="row between"><h2>${ic('dumbbell')} تمرينك</h2><span class="small muted">${wk} من ${p.days.length} هذا الأسبوع</span></div>
      <div class="row between" style="margin-top:4px"><div class="grow"><div style="font-weight:700;font-size:18px;line-height:1.35">${esc(p.name)}</div>
        <div class="small muted" style="margin-top:3px">تمرينك القادم: اليوم ${di + 1} من ${p.days.length} · <b class="ltr" style="color:var(--text)">${esc(p.days[di].name)}</b></div></div>
        <span class="pill" style="flex:none">~${mins} د · ${exs.length} تمارين</span></div>
      <div class="thumbs">${exs.slice(0, 3).map(e => thumb(e[0], 'lg')).join('')}${exs.length > 3 ? `<div class="thumb lg more">+${exs.length - 3}</div>` : ''}</div>
      <button class="btn" id="b-start">${ic('play')} ${resume ? 'متابعة التمرين' : 'بدء التمرين'}</button>
      <div class="row" style="margin-top:8px"><button class="btn ghost" id="b-prev">معاينة اليوم</button><button class="btn ghost" id="b-skip" aria-label="تخطي هذا اليوم والانتقال لليوم التالي">${ic('arrowr')} تخطي اليوم</button></div>
    </div>
    <div class="quick">
      <button class="qtile" id="q-train"><span class="qi">${ic('list')}</span><span><b>جداولي</b><small>إدارة وتعديل</small></span></button>
      <button class="qtile" id="q-lib"><span class="qi">${ic('dumbbell')}</span><span><b>مكتبة التمارين</b><small>${Object.keys(EXERCISES).length} تمرين</small></span></button>
      <button class="qtile" id="q-stats"><span class="qi">${ic('chart')}</span><span><b>الإحصائيات</b><small>تقدّمك</small></span></button>
      <button class="qtile" id="q-meas"><span class="qi">${ic('ruler')}</span><span><b>القياسات</b><small>الوزن والجسم</small></span></button>
    </div>
    <div class="card"><h2>${ic('clock')} أسبوعك</h2><div class="row">${dots}</div></div>
    ${lastLog ? `<div class="card"><div class="row between"><h2>${ic('bolt')} آخر جلسة</h2><button class="link" id="b-hist">السجل ${ic('chevl', 'sm')}</button></div>
      <div class="row between"><div><b>${esc(lastLog.dayName)}</b><div class="small muted">${fWd(lastLog.date)}، ${fDay(lastLog.date)}</div></div>
      <div class="small muted" style="text-align:end">${fmtDur(lastLog.dur)}<br>${lastLog.ex.reduce((a, e) => a + e.sets.length, 0)} مجموعة</div></div></div>` : ''}
    <div class="card" id="c-w"><div class="row between"><h2>${ic('ruler')} الوزن</h2><button class="icon-btn" style="width:36px;height:36px" id="b-addw">${ic('plus', 'sm')}</button></div>
      ${lw ? `<div class="row between" style="align-items:baseline"><span class="pill">${fDay(lw.date)}</span><div class="ltr"><b style="font-size:30px">${fmtN(lw.v)}</b> <span class="muted">kg</span></div></div>` : '<div class="muted small">سجّل وزنك الأول لتبدأ المتابعة</div>'}</div>
    <div class="card"><div class="row between"><h2>${ic('chart')} إحصائيات التمرين</h2><button class="link" id="b-stats">عرض ${ic('chevl', 'sm')}</button></div>
      <div class="muted small">عدد المجموعات لكل عضلة هذا الأسبوع وتطور أوزانك.</div></div>
  </div>`;
  $('#b-set', v).onclick = openSettings;
  $('#b-name', v).onclick = openNameSheet;
  $('#q-train', v).onclick = () => go('train'); $('#q-meas', v).onclick = () => go('meas');
  $('#q-stats', v).onclick = openStats; $('#q-lib', v).onclick = () => openPicker({ title: 'مكتبة التمارين', browse: true });
  $('#b-start', v).onclick = () => startWorkout(p.id, di);
  $('#b-prev', v).onclick = () => openPreview(p.id, di);
  $('#b-skip', v).onclick = () => skipDay(p.id);
  $('#b-hist', v)?.addEventListener('click', openHistory);
  $('#b-addw', v).onclick = () => addWeightSheet();
  $('#b-stats', v).onclick = openStats;
}

/* ---------- التمرين ---------- */
function progCard(p, cur) {
  const di = nextDay(p), exs = dayEx(p, di);
  const mins = Math.round(exs.reduce((a, e) => a + e[1] * (45 + e[3]), 0) / 60);
  return `<div class="pcard ${cur ? 'cur' : ''}" data-pid="${p.id}">
    <div class="row between"><span class="badge ${cur ? 'cur' : ''}">${cur ? 'جدولك الحالي' : p.builtin === false ? 'مخصّص' : 'جدولك'}</span><span class="small muted">${p.days.length} أيام</span></div>
    <h3>${esc(p.name)}</h3><div class="small muted" style="margin-bottom:12px">${esc(p.place || '')}${p.level ? '، ' + esc(p.level) : ''}</div>
    <div class="stats3" style="margin-bottom:12px"><div><b>${p.days.length}</b><span>أيام في الأسبوع</span></div><div><b>${mins}</b><span>دقائق التمرين</span></div></div>
    <div class="small muted">تمرينك القادم</div><div style="font-weight:700;margin-bottom:12px" class="ltr">${esc(p.days[di].name)}</div>
    <div class="row"><button class="btn" data-go="${p.id}">${ic('play')} ابدأ الآن</button><button class="btn sec sm" data-edit="${p.id}" style="flex:none;padding:14px">${ic('pencil', 'sm')}</button></div></div>`;
}
function viewTrain(v) {
  const mine = S.mine.map(getProg).filter(Boolean);
  const lib = BUILTIN_PROGRAMS.filter(p => !S.mine.includes(p.id));
  v.innerHTML = `<div class="screen">
    <div class="topbar"><h1>التمرين</h1><div class="top-actions">
      <button class="icon-btn" id="b-hist2" aria-label="سجل التمارين">${ic('clock')}</button><button class="icon-btn" id="b-stats">${ic('chart')}</button><button class="icon-btn" id="b-manage">${ic('more')}</button></div></div>
    <div class="sec-title" style="margin-top:4px"><h2>جداولك</h2><button class="btn sm" id="b-new" style="background:var(--accent-soft);color:var(--accent)">${ic('plus', 'sm')} جدول جديد</button></div>
    <div class="carousel">${mine.map(p => progCard(p, p.id === S.active)).join('') || '<div class="empty grow">لا توجد جداول</div>'}</div>
    <div class="sec-title"><h2>جداول جاهزة</h2><button class="link" id="b-lib">استعرض الكل ${ic('chevl', 'sm')}</button></div>
    <div class="carousel">${(lib.length ? lib : BUILTIN_PROGRAMS).map(libCard).join('')}</div>
  </div>`;
  $('#b-stats', v).onclick = openStats; $('#b-manage', v).onclick = openManage; $('#b-hist2', v).onclick = openHistory;
  $('#b-new', v).onclick = () => openEditor(null); $('#b-lib', v).onclick = openLibrary;
  $$('[data-go]', v).forEach(b => b.onclick = () => { const p = getProg(b.dataset.go); S.active = p.id; save(); openPreview(p.id, nextDay(p)); });
  $$('[data-edit]', v).forEach(b => b.onclick = () => openEditor(b.dataset.edit));
  $$('.libcard', v).forEach(b => b.onclick = () => openProgPreview(b.dataset.pid));
  // مرّر إلى الجدول الحالي
  const cur = $('.pcard.cur', v); if (cur) setTimeout(() => cur.scrollIntoView({ inline: 'center', block: 'nearest' }), 30);
}
function libCard(p, full = false) {
  const days = p.days.length, mins = p.mins || Math.round(dayEx(p, 0).reduce((a, e) => a + e[1] * (45 + e[3]), 0) / 60);
  return `<button class="libcard ${full ? 'full' : ''}" data-pid="${p.id}"><h3>${esc(p.name)}</h3>
    <div><span class="tag">${esc(p.level)}</span><span class="tag">${esc(p.place)}</span></div>
    <div class="stats3"><div><b>${days}</b><span>أيام في الأسبوع</span></div><div><b>${mins}</b><span>دقائق التمرين</span></div></div></button>`;
}

function openManage() {
  const s = openSheet({ title: 'إدارة جداولك', body: '' });
  function draw() {
    const p = getProg(S.active);
    s.set(`${S.mine.map(getProg).filter(Boolean).map(q => `<button class="menu-item" data-act="${q.id}"><span class="grow" style="direction:ltr;text-align:start;unicode-bidi:plaintext">${esc(q.name)}<small>${esc(q.place || '')}${q.level ? '، ' + esc(q.level) : ''}</small></span>${q.id === S.active ? ic('check') : '<span class="badge cur">تعيين كجدول رئيسي</span>'}</button>`).join('')}
      <button class="menu-item" id="m-new">${ic('plus')}<span>أنشئ جدول جديد<small>ابنِ جدولك الخاص من الصفر</small></span></button>
      <button class="menu-item" id="m-lib">${ic('search')}<span>تصفح كل الجداول<small>ابحث في مكتبة الجداول</small></span></button>
      <button class="menu-item" id="m-day">${ic('swap')}<span>تغيير يوم التمرين القادم<small>الحالي: ${esc(p.days[nextDay(p)].name)}</small></span></button>
      <button class="menu-item danger" id="m-del">${ic('trash')}<span>حذف جدول<small style="color:var(--rose);opacity:.7">إزالة من قائمتك</small></span></button>`);
    $$('[data-act]', s.body).forEach(b => b.onclick = () => { S.active = b.dataset.act; save(); render(); draw(); });
    $('#m-new', s.body).onclick = () => { s.close(); openEditor(null); };
    $('#m-lib', s.body).onclick = () => { s.close(); openLibrary(); };
    $('#m-day', s.body).onclick = () => { s.close(); openPickDay(); };
    $('#m-del', s.body).onclick = () => { s.close(); openDelete(); };
  }
  draw();
}
function openPickDay() {
  const p = getProg(S.active);
  const s = openSheet({ title: 'اختر اليوم القادم', body: p.days.map((d, i) => `<button class="menu-item" data-i="${i}"><span class="grow ltr">${esc(d.name)}</span>${i === nextDay(p) ? ic('check') : ''}</button>`).join('') });
  $$('[data-i]', s.body).forEach(b => b.onclick = () => { S.next[p.id] = +b.dataset.i; save(); render(); s.close(); toast('تم تحديث اليوم القادم'); });
}
function openDelete() {
  const s = openSheet({ title: 'حذف جدول', body: S.mine.map(getProg).filter(Boolean).map(q => `<button class="menu-item danger" data-d="${q.id}"><span class="grow ltr">${esc(q.name)}</span>${ic('trash')}</button>`).join('') });
  $$('[data-d]', s.body).forEach(b => b.onclick = () => {
    if (S.mine.length <= 1) { toast('لازم يبقى عندك جدول واحد على الأقل'); return; }
    const id = b.dataset.d;
    confirmSheet('حذف الجدول؟', 'سيُزال الجدول من قائمتك. سجل تمارينك السابقة يبقى محفوظاً.', 'حذف', () => {
      S.mine = S.mine.filter(x => x !== id); if (S.active === id) S.active = S.mine[0];
      S.custom = S.custom.filter(c => c.id !== id); save(); render(); s.close();
    });
  });
}

function openLibrary() {
  let q = '', lvl = '', place = '';
  const s = openSheet({ title: 'مكتبة الجداول', tall: true, body: '' });
  function draw() {
    const list = allPrograms().filter(p => (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (!lvl || p.level === lvl) && (!place || p.place === place));
    s.body.innerHTML = `<div class="row" style="margin-bottom:10px"><div class="search">${ic('search')}<input id="lq" placeholder="ابحث عن برنامج يناسبك" value="${esc(q)}"></div></div>
      <div class="chips">${['مبتدئ', 'متوسط', 'متقدم'].map(l => `<button class="chip ${lvl === l ? 'on' : ''}" data-l="${l}">${l}</button>`).join('')}${['النادي', 'المنزل'].map(l => `<button class="chip ${place === l ? 'on' : ''}" data-p="${l}">${l}</button>`).join('')}</div>
      ${list.map(p => libCard(p, true)).join('') || '<div class="empty">ما فيه نتائج</div>'}`;
    const inp = $('#lq', s.body);
    inp.oninput = () => { q = inp.value; const pos = inp.selectionStart; draw(); const n = $('#lq', s.body); n.focus(); n.setSelectionRange(pos, pos); };
    $$('[data-l]', s.body).forEach(b => b.onclick = () => { lvl = lvl === b.dataset.l ? '' : b.dataset.l; draw(); });
    $$('[data-p]', s.body).forEach(b => b.onclick = () => { place = place === b.dataset.p ? '' : b.dataset.p; draw(); });
    $$('.libcard', s.body).forEach(b => b.onclick = () => openProgPreview(b.dataset.pid));
  }
  draw();
}
function openProgPreview(pid) {
  const p = getProg(pid), has = S.mine.includes(pid);
  const s = openSheet({
    title: esc(p.name), tall: true,
    body: `<div style="margin-bottom:12px"><span class="tag">${esc(p.level)}</span><span class="tag">${esc(p.place)}</span><span class="tag">${p.days.length} أيام</span></div>` +
      p.days.map((d, i) => `<div class="card" style="padding:14px"><b class="ltr" style="display:block;margin-bottom:8px">${esc(d.name)}</b>${dayEx(p, i).map(e => `<div class="row" style="margin-bottom:6px;font-size:14px"><span class="grow ltr">${esc(exOf(e[0]).en)}</span><span class="muted ltr">${e[1]} × ${esc(e[2])}</span></div>`).join('')}</div>`).join(''),
    foot: `<button class="btn" id="pp-use">${has ? 'اجعله جدولي الحالي' : 'أضِف إلى جداولي واجعله الحالي'}</button>`
  });
  $('#pp-use', s.foot).onclick = () => { if (!S.mine.includes(pid)) S.mine.push(pid); S.active = pid; save(); s.close(); sheetStack.slice().forEach(x => x.close()); go('train'); toast('تم اختيار الجدول'); };
}

/* ---------- معاينة التمرين ---------- */
function openPreview(pid, di) {
  const p = getProg(pid); let edit = false;
  const s = openSheet({ title: 'معاينة التمرين', tall: true, body: '', foot: `<div class="row">${di === nextDay(p) ? `<button class="btn sec" id="pv-skip" style="flex:none;width:auto;padding-inline:16px">${ic('arrowr')} تخطي</button>` : ''}<button class="btn" id="pv-go">${ic('play')} بدء التمرين</button></div>` });
  $('#pv-go', s.foot).onclick = () => { s.close(); startWorkout(pid, di); };
  $('#pv-skip', s.foot)?.addEventListener('click', () => { s.close(); skipDay(pid); });
  function draw() {
    const exs = dayEx(p, di);
    const pri = [...new Set(exs.flatMap(e => exOf(e[0]).pri))], sec = [...new Set(exs.flatMap(e => exOf(e[0]).sec))].filter(m => !pri.includes(m));
    const mins = Math.round(exs.reduce((a, e) => a + e[1] * (45 + e[3]), 0) / 60);
    const cnt = S.logs.filter(l => l.progId === pid && l.dayIdx === di).length;
    s.set(`<div class="body-card" style="padding:8px">${anatomyHtml(pri, sec, 'sm')}</div>
      <div class="chips">${pri.map(m => `<span class="chip mus">${MUSCLES[m]}</span>`).join('')}${sec.map(m => `<span class="chip mus dim">${MUSCLES[m]}</span>`).join('')}</div>
      <div class="stats3" style="margin-bottom:16px;background:var(--surface)"><div><b>${cnt}</b><span>جلسات</span></div><div><b>${exs.length}</b><span>تمارين</span></div><div><b>~${mins} د</b><span>متوقعة</span></div></div>
      <div class="row between" style="margin-bottom:10px"><b class="ltr">${esc(p.days[di].name)}</b><button class="link" id="pv-ed">${edit ? 'تم' : 'تعديل اليوم'}</button></div>
      <div id="pv-list">${exs.map((e, i) => { const ex = exOf(e[0]), last = lastSets(e[0]), b = last && bestOf(last); return `<div class="ex-row" data-i="${i}">${edit ? `<button class="grip" data-grip aria-label="اسحب لتغيير الترتيب">${ic('grip')}</button>` : ''}${thumb(e[0])}
        <div class="info" data-info="${e[0]}"><div class="nm">${esc(ex.en)}</div><div class="nm-ar">${esc(ex.ar)}</div><div class="meta ltr" style="direction:rtl">${e[2]} × ${e[1]}، راحة ${fmtTime(e[3])} د${b ? `<br>آخر مرة: ${setTxt(b)}` : ''}</div></div>
        ${edit ? `<button class="icon-btn" data-rm="${i}" style="width:34px;height:34px;color:var(--rose)">${ic('trash', 'sm')}</button>` : ''}
        <button class="swap" data-sw="${i}">${ic('swap', 'sm')} استبدال</button></div>`; }).join('')}</div>
      ${edit ? `<p class="small muted" style="margin:2px 2px 10px">اسحب المقبض ${ic('grip', 'sm')} لتحريك التمرين وتغيير ترتيبه.</p>` : ''}
      ${edit ? `<button class="btn ghost" id="pv-add" style="margin-top:6px">${ic('plus')} إضافة تمرين</button>` : ''}`);
    const b = s.body;
    $('#pv-ed', b).onclick = () => { edit = !edit; draw(); };
    $$('[data-info]', b).forEach(x => x.onclick = () => openExercise(x.dataset.info));
    const setOv = arr => { S.overrides[pid + ':' + di] = arr; save(); draw(); render(); };
    $$('[data-sw]', b).forEach(x => x.onclick = () => { const i = +x.dataset.sw; openPicker({ muscle: exOf(exs[i][0]).pri[0], title: 'استبدال التمرين', onPick: id => { const a = exs.map(r => r.slice()); a[i][0] = id; setOv(a); } }); });
    $$('[data-rm]', b).forEach(x => x.onclick = () => { if (exs.length <= 1) return toast('لازم يبقى تمرين واحد'); setOv(exs.filter((_, i) => i !== +x.dataset.rm)); });
    if (edit) makeSortable($('#pv-list', b), '.ex-row', '[data-grip]', order => setOv(order.map(i => exs[i])));
    $('#pv-add', b)?.addEventListener('click', () => openPicker({ title: 'إضافة تمرين', onPick: id => setOv([...exs, [id, 3, '8-12', exOf(id).type === 'compound' ? 120 : 75]]) }));
  }
  draw();
}

/* ---------- اختيار تمرين ---------- */
function openPickerOld({ muscle = '', title = 'اختر تمريناً', onPick }) {
  let q = '', m = muscle;
  const s = openSheet({ title, tall: true, body: '' });
  function draw() {
    const list = Object.values(EXERCISES).filter(e => (!m || e.pri.includes(m) || e.sec.includes(m)) && (!q || (e.en + ' ' + e.ar).toLowerCase().includes(q.toLowerCase())));
    s.body.innerHTML = `<div class="row" style="margin-bottom:10px"><div class="search">${ic('search')}<input id="pq" placeholder="ابحث عن تمرين" value="${esc(q)}"></div></div>
      <div class="chips"><button class="chip ${!m ? 'on' : ''}" data-m="">الكل</button>${Object.entries(MUSCLES).map(([k, n]) => `<button class="chip ${m === k ? 'on' : ''}" data-m="${k}">${n}</button>`).join('')}</div>
      ${list.map(e => `<button class="ex-row" style="width:100%" data-id="${e.id}">${thumb(e.id)}<div class="info"><div class="nm">${esc(e.en)}</div><div class="nm-ar">${esc(e.ar)}</div><div class="meta">${esc(e.gear)} · ${e.pri.map(k => MUSCLES[k]).join('، ')}</div></div></button>`).join('') || '<div class="empty">ما فيه نتائج</div>'}`;
    const inp = $('#pq', s.body);
    inp.oninput = () => { q = inp.value; const pos = inp.selectionStart; draw(); const n = $('#pq', s.body); n.focus(); n.setSelectionRange(pos, pos); };
    $$('[data-m]', s.body).forEach(b => b.onclick = () => { m = b.dataset.m; draw(); });
    $$('[data-id]', s.body).forEach(b => b.onclick = () => { s.close(); onPick(b.dataset.id); });
  }
  draw();
}

/* ---------- تفاصيل التمرين ---------- */
function openExercise(id, start = 'info', opts = {}) {
  const ex = exOf(id); let t = start;
  const s = openSheet({ title: `<span class="ltr" style="display:block">${esc(ex.en)}</span>`, tall: true, body: '', foot: opts.onAdd ? `<button class="btn" id="ex-add">${ic('plus')} إضافة هذا التمرين</button>` : '' });
  if (opts.onAdd) $('#ex-add', s.foot).onclick = () => { s.close(); opts.onAdd(); };
  function draw() {
    const hist = history(id);
    let html = `<div class="seg"><button data-t="info" class="${t === 'info' ? 'on' : ''}">الشرح</button><button data-t="hist" class="${t === 'hist' ? 'on' : ''}">السجل</button><button data-t="best" class="${t === 'best' ? 'on' : ''}">أفضل مجموعة</button></div>`;
    if (t === 'info') {
      html += `<div class="fig-card" id="fig"></div><div class="small muted" style="margin:-4px 0 10px">${esc(ex.ar)} · ${esc(ex.gear)}</div>
        <p class="desc">${esc(ex.desc)}</p>
        ${ex.brand ? `<p class="small muted" style="margin:-6px 0 14px;line-height:1.7">الصور توضيحية لجهاز مشابه (لا نستخدم صور ${ex.brand} الأصلية). شكل الجهاز عندك قد يختلف قليلاً، واضبط المقعد والمقابض حسب جسمك.</p>` : ''}
        <div class="yt">${ytLinks(ex).map(l => `<a href="${l.url}" target="_blank" rel="noopener"><span class="play"></span>${l.label}</a>`).join('')}</div>
        <div class="body-card">${anatomyHtml(ex.pri, ex.sec)}</div>
        ${ex.pri.map(m => `<div class="mrow"><div class="mi"><span class="dot"></span></div><div class="grow"><b>${MUSCLES[m]}</b><div class="small muted">رئيسية</div></div></div>`).join('')}
        ${ex.sec.map(m => `<div class="mrow"><div class="mi"><span class="dot s"></span></div><div class="grow"><b>${MUSCLES[m]}</b><div class="small muted">ثانوية</div></div></div>`).join('')}`;
    } else if (t === 'hist') {
      html += hist.length ? hist.map((h, i) => {
        const b = bestOf(h.sets), prev = hist[i + 1] && bestOf(hist[i + 1].sets);
        let d = '';
        if (prev) { const up = e1rm(b.w, b.r) >= e1rm(prev.w, prev.r); d = `<span class="delta ${up ? 'up' : 'down'}">${setTxt(b)} ${up ? '↑' : '↓'}</span>`; } else d = `<span class="delta">${setTxt(b)}</span>`;
        return `<div class="hist"><div class="hist-head"><div><b style="font-size:17px">${fDay(h.date)}</b><div class="small muted">${fWd(h.date)}</div></div>${d}</div>
          <div class="set-table"><span class="h">الجلسة</span><span class="h">الوزن</span><span class="h">التكرارات</span><span class="h">RIR</span>
          ${h.sets.map((x, k) => `<span class="numdot" style="margin:auto">${k + 1}</span><div class="box">${fmtN(x.w)} <small>kg</small></div><div class="box">${fmtN(x.r)}</div><span class="muted">${x.rir === '' || x.rir == null ? '-' : x.rir}</span>`).join('')}</div></div>`;
      }).join('') : `<div class="empty">${ic('list')}لا يوجد سجل بعد. أنجز هذا التمرين في جلسة وسيظهر هنا.</div>`;
    } else {
      const all = hist.flatMap(h => h.sets), best = bestOf(all);
      html += best ? `<div class="best"><div><div class="lbl">أفضل مجموعة</div><div class="val ltr">${setTxt(best)}</div></div><div class="row" style="gap:12px"><span class="small muted">${fDay(hist.find(h => h.sets.includes(best)).date)}</span>${ic('trophy')}</div></div>
        <div class="hist"><b>أفضل مجموعة في كل جلسة</b><div style="margin-top:10px">${[...hist].reverse().map((h, i, arr) => {
          const b = bestOf(h.sets), pv = arr[i - 1] && bestOf(arr[i - 1].sets);
          const arrow = pv ? (e1rm(b.w, b.r) >= e1rm(pv.w, pv.r) ? '<span style="color:var(--accent)">↑</span>' : '<span style="color:var(--rose)">↓</span>') : '';
          return `<div class="row between" style="padding:8px 0;border-top:${i ? '1px solid var(--line)' : '0'}"><span class="small muted">${fDay(h.date)}</span><b class="ltr">${arrow} ${setTxt(b)}</b></div>`; }).reverse().join('')}</div></div>`
        : `<div class="empty">${ic('trophy')}سجّل مجموعاتك لتظهر أفضل مجموعة هنا.</div>`;
    }
    s.set(html, false);
    $$('[data-t]', s.body).forEach(b => b.onclick = () => { t = b.dataset.t; draw(); });
    const f = $('#fig', s.body); if (f) animatePhoto(f, ex);
  }
  draw();
}

/* ================= التمرين الجاري ================= */
let tick = null, wakeLock = null, audioCtx = null;
function beep() {
  if (!S.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.22, 0.44].forEach((d, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = i === 2 ? 1046 : 784; o.connect(g); g.connect(audioCtx.destination);
      const t0 = audioCtx.currentTime + d; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      o.start(t0); o.stop(t0 + 0.2);
    });
  } catch (e) {}
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
}
function unlockAudio() { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.state === 'suspended' && audioCtx.resume(); } catch (e) {} }

function startWorkout(pid, di) {
  if (S.activeWorkout && (S.activeWorkout.progId !== pid || S.activeWorkout.dayIdx !== di)) {
    return confirmSheet('تمرين جاري', 'عندك تمرين غير منتهٍ. هل تريد التخلص منه وبدء هذا؟', 'ابدأ تمريناً جديداً', () => { S.activeWorkout = null; startWorkout(pid, di); });
  }
  unlockAudio();
  if (!S.activeWorkout) {
    const p = getProg(pid);
    S.activeWorkout = {
      progId: pid, dayIdx: di, dayName: p.days[di].name, start: Date.now(), rest: null,
      ex: dayEx(p, di).map(e => ({ id: e[0], n: e[1], reps: e[2], rest: e[3], sets: Array.from({ length: e[1] }, () => ({ w: '', r: '', rir: '', done: false })) }))
    };
    save();
  }
  openWorkout();
}
function openWorkout() {
  const aw = S.activeWorkout; if (!aw) return;
  $('#wk')?.remove(); $('#resume')?.remove();
  const el = document.createElement('div'); el.className = 'wk'; el.id = 'wk';
  el.innerHTML = `<div class="wk-head"><button class="x-btn" id="wk-min">${ic('chevr', 'lg')}</button>
    <div class="ttl"><b class="ltr">${esc(aw.dayName)}</b><span id="wk-time">0:00</span></div><button class="icon-btn" id="wk-ord" aria-label="ترتيب التمارين" style="flex:none">${ic('list')}</button><button class="btn sm" id="wk-fin" style="flex:none">إنهاء</button></div>
    <div class="wk-body" id="wk-body"></div><div id="wk-rest"></div>`;
  document.body.appendChild(el); document.body.style.overflow = 'hidden';
  try { navigator.wakeLock?.request('screen').then(w => wakeLock = w).catch(() => {}); } catch (e) {}
  $('#wk-min', el).onclick = closeWorkoutView;
  $('#wk-fin', el).onclick = finishWorkout;
  $('#wk-ord', el).onclick = openWorkoutOrder;
  drawWorkout();
  clearInterval(tick); tick = setInterval(onTick, 250); onTick();
}
function closeWorkoutView() {
  $('#wk')?.remove(); document.body.style.overflow = ''; clearInterval(tick); try { wakeLock?.release(); } catch (e) {} wakeLock = null; render();
}
function drawWorkout() {
  const aw = S.activeWorkout; const body = $('#wk-body'); if (!body) return;
  const y = body.scrollTop;
  body.innerHTML = aw.ex.map((e, xi) => {
    const ex = exOf(e.id), last = lastSets(e.id), done = e.sets.every(s => s.done);
    return `<div class="wk-ex ${done ? 'done' : ''}"><div class="hd" data-xi="${xi}">${thumb(e.id)}
      <div class="grow"><div class="nm">${esc(ex.en)}</div><div class="small muted">${e.n} × ${esc(e.reps)} · راحة ${fmtTime(e.rest)} د</div>${last ? `<div class="small muted ltr" style="direction:rtl">آخر مرة: ${setTxt(bestOf(last))}</div>` : ''}</div>
      <button class="icon-btn" data-swx="${xi}" aria-label="استبدال التمرين" style="width:38px;height:38px">${ic('swap', 'sm')}</button>
      <button class="icon-btn" data-info="${e.id}" aria-label="شرح التمرين" style="width:38px;height:38px">${ic('chart', 'sm')}</button></div>
      <div class="setgrid"><span class="h">#</span><span class="h">الوزن kg</span><span class="h">التكرار</span><span class="h">RIR</span><span></span><span></span>
      ${e.sets.map((s, si) => {
        const pv = last ? (last[si] || last[last.length - 1]) : null, lo = parseInt(e.reps) || '';
        return `${`<span class="numdot" style="margin:auto">${si + 1}</span>`}
        <div class="${s.done ? 'done' : ''}"><input inputmode="decimal" data-f="w" data-xi="${xi}" data-si="${si}" value="${esc(s.w)}" placeholder="${pv ? fmtN(pv.w) : (ex.bw ? '0' : '-')}"></div>
        <div class="${s.done ? 'done' : ''}"><input inputmode="numeric" data-f="r" data-xi="${xi}" data-si="${si}" value="${esc(s.r)}" placeholder="${pv ? fmtN(pv.r) : lo}"></div>
        <div class="${s.done ? 'done' : ''}"><input inputmode="numeric" data-f="rir" data-xi="${xi}" data-si="${si}" value="${esc(s.rir)}" placeholder="-"></div>
        <button class="chk ${s.done ? 'on' : ''}" data-chk="${xi}:${si}" aria-label="إنجاز المجموعة">${ic('check')}</button>
        <button class="del-set" data-delset="${xi}:${si}" aria-label="حذف المجموعة" ${e.sets.length <= 1 ? 'disabled' : ''}>${ic('trash', 'sm')}</button>`;
      }).join('')}</div>
      <button class="add-set" data-add="${xi}">+ إضافة مجموعة</button></div>`;
  }).join('');
  body.scrollTop = y;
  $$('input[data-f]', body).forEach(inp => inp.oninput = () => { const s = aw.ex[inp.dataset.xi].sets[inp.dataset.si]; s[inp.dataset.f] = inp.value; save(); });
  $$('[data-chk]', body).forEach(b => b.onclick = () => { const [xi, si] = b.dataset.chk.split(':').map(Number); toggleSet(xi, si); });
  $$('[data-delset]', body).forEach(b => b.onclick = () => {
    const [xi, si] = b.dataset.delset.split(':').map(Number), e = aw.ex[xi];
    if (e.sets.length <= 1) return toast('لازم تبقى مجموعة واحدة');
    e.sets.splice(si, 1); e.n = e.sets.length;
    if (aw.rest && e.sets.every(q => q.done) && aw.ex.every(x => x.sets.every(q => q.done))) aw.rest = null;
    save(); drawWorkout(); toast('تم حذف المجموعة');
  });
  $$('[data-add]', body).forEach(b => b.onclick = () => { aw.ex[b.dataset.add].sets.push({ w: '', r: '', rir: '', done: false }); save(); drawWorkout(); });
  $$('[data-info]', body).forEach(b => b.onclick = () => openExercise(b.dataset.info));
  $$('[data-swx]', body).forEach(b => b.onclick = () => swapWorkoutExercise(+b.dataset.swx));
}
function toggleSet(xi, si) {
  unlockAudio();
  const aw = S.activeWorkout, e = aw.ex[xi], s = e.sets[si], last = lastSets(e.id), ex = exOf(e.id);
  if (s.done) { s.done = false; save(); drawWorkout(); return; }
  const pv = last ? (last[si] || last[last.length - 1]) : null;
  let w = num(s.w), r = num(s.r);
  if (isNaN(w)) w = pv ? pv.w : (ex.bw ? 0 : NaN);
  if (isNaN(r)) r = pv ? pv.r : (parseInt(e.reps) || NaN);
  if (isNaN(w) || isNaN(r)) { toast('اكتب الوزن والتكرارات أولاً'); return; }
  s.w = fmtN(w); s.r = fmtN(r); s.done = true;
  const allDone = aw.ex.every(x => x.sets.every(q => q.done));
  if (!allDone) aw.rest = { end: Date.now() + e.rest * 1000, total: e.rest, fired: false }; else aw.rest = null;
  save(); drawWorkout(); onTick();
  if (allDone) toast('أنهيت كل المجموعات! اضغط إنهاء');
}
function onTick() {
  const aw = S.activeWorkout; if (!aw || !$('#wk')) return;
  $('#wk-time').textContent = fmtTime((Date.now() - aw.start) / 1000);
  const box = $('#wk-rest'); const r = aw.rest;
  if (!r) { if (box.innerHTML) box.innerHTML = ''; return; }
  const left = (r.end - Date.now()) / 1000;
  if (left <= 0 && !r.fired) { r.fired = true; save(); beep(); }
  const over = left <= 0;
  if (!box.firstChild) {
    box.innerHTML = `<div class="rest-bar"><button class="adj" data-a="-15">-15</button><div class="grow" style="text-align:center"><div class="small" id="rb-l" style="opacity:.7">وقت الراحة</div><div class="time" id="rb-t" style="margin:auto"></div></div><button class="adj" data-a="15">+15</button><button class="adj" data-a="skip">${over ? 'متابعة' : 'تخطي'}</button><div class="prog"><i id="rb-p"></i></div></div>`;
    $$('[data-a]', box).forEach(b => b.onclick = () => {
      const a = b.dataset.a; if (a === 'skip') { aw.rest = null; box.innerHTML = ''; save(); return; }
      r.end += +a * 1000; r.total = Math.max(5, r.total + +a); r.fired = r.end <= Date.now(); save(); onTick();
    });
  }
  const bar = $('.rest-bar', box); bar.classList.toggle('over', over);
  $('#rb-t').textContent = over ? 'انتهت!' : fmtTime(Math.ceil(left));
  $('#rb-l').textContent = over ? 'حان وقت المجموعة التالية' : 'وقت الراحة';
  $('#rb-p').style.transform = `scaleX(${over ? 0 : Math.max(0, Math.min(1, left / r.total))})`;
  $('[data-a="skip"]', box).textContent = over ? 'متابعة' : 'تخطي';
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) { onTick(); if (S.activeWorkout && $('#wk')) { try { navigator.wakeLock?.request('screen').then(w => wakeLock = w).catch(() => {}); } catch (e) {} } } });

function finishWorkout() {
  const aw = S.activeWorkout;
  const done = aw.ex.map(e => ({ id: e.id, sets: e.sets.filter(s => s.done).map(s => ({ w: num(s.w) || 0, r: num(s.r) || 0, rir: s.rir === '' ? '' : num(s.rir) })) })).filter(e => e.sets.length);
  if (!done.length) {
    return confirmSheet('لا توجد مجموعات منجزة', 'لم تسجّل أي مجموعة. هل تريد إلغاء هذا التمرين؟', 'إلغاء التمرين', () => { S.activeWorkout = null; save(); closeWorkoutView(); });
  }
  const dur = (Date.now() - aw.start) / 1000;
  const vol = done.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.w * s.r, 0), 0);
  const nSets = done.reduce((a, e) => a + e.sets.length, 0);
  const prs = done.filter(e => { const old = history(e.id).flatMap(h => h.sets); const b = bestOf(e.sets); return old.length && b && e1rm(b.w, b.r) > e1rm(bestOf(old).w, bestOf(old).r); });
  const unfinished = aw.ex.reduce((a, e) => a + e.sets.filter(s => !s.done).length, 0);
  const s = openSheet({
    title: 'ملخص التمرين',
    body: `<div class="stats3" style="background:var(--surface);margin-bottom:14px"><div><b>${fmtDur(dur)}</b><span>المدة</span></div><div><b>${nSets}</b><span>مجموعات</span></div><div><b>${Math.round(vol)}</b><span>حجم (kg)</span></div></div>
      ${prs.length ? `<div class="best" style="display:block"><div class="lbl" style="margin-bottom:8px">${ic('trophy', 'sm')} أرقام قياسية جديدة</div>${prs.map(e => `<div class="row between" style="padding:5px 0"><span class="ltr">${esc(exOf(e.id).en)}</span><b class="ltr">${setTxt(bestOf(e.sets))}</b></div>`).join('')}</div>` : ''}
      ${unfinished ? `<p class="muted small">${unfinished} مجموعة لم تُكمل ولن تُحفظ.</p>` : ''}`,
    foot: `<div class="row"><button class="btn sec" id="fn-back">رجوع</button><button class="btn" id="fn-save">حفظ التمرين</button></div>`
  });
  $('#fn-back', s.foot).onclick = s.close;
  $('#fn-save', s.foot).onclick = () => {
    S.logs.push({ id: uid(), date: new Date(aw.start).toISOString(), progId: aw.progId, dayIdx: aw.dayIdx, dayName: aw.dayName, dur, ex: done });
    const p = getProg(aw.progId); if (p) S.next[p.id] = (aw.dayIdx + 1) % p.days.length;
    S.activeWorkout = null; save(); s.close(); closeWorkoutView(); openSaved(aw.progId);
  };
}

/* ================= القياسات ================= */
let measTab = 'weight', measRange = 8, showAllW = false;
const BODY_PARTS = ['الصدر', 'الخصر', 'الورك', 'الذراع', 'الفخذ', 'الكتف', 'الرقبة', 'السمانة'];

function lineChart(pts, unit = '') {
  const W = 320, H = 180, pl = 34, pr = 12, pt = 16, pb = 26;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = (y1 - y0) * 0.2 || 1, lo = y0 - pad, hi = y1 + pad;
  const X = x => pl + (x1 === x0 ? (W - pl - pr) / 2 : (x - x0) / (x1 - x0) * (W - pl - pr));
  const Y = y => pt + (hi - y) / (hi - lo) * (H - pt - pb);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join(' ');
  const area = path + ` L${X(pts[pts.length - 1].x).toFixed(1)} ${H - pb} L${X(pts[0].x).toFixed(1)} ${H - pb} Z`;
  const ticks = [lo + pad, (lo + hi) / 2, hi - pad];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86b8a8" stop-opacity=".35"/><stop offset="1" stop-color="#86b8a8" stop-opacity="0"/></linearGradient></defs>
    ${ticks.map(t => `<line x1="${pl}" x2="${W - pr}" y1="${Y(t).toFixed(1)}" y2="${Y(t).toFixed(1)}" stroke="#333d41" stroke-dasharray="3 4"/><text x="${pl - 6}" y="${(Y(t) + 4).toFixed(1)}" text-anchor="end">${fmtN(t)}</text>`).join('')}
    <path d="${area}" fill="url(#g)"/><path d="${path}" fill="none" stroke="#86b8a8" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map(p => `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.6" fill="#1b1f22" stroke="#86b8a8" stroke-width="2"/>`).join('')}
    <text x="${pl}" y="${H - 6}" text-anchor="start">${fDay(x0)}</text><text x="${W - pr}" y="${H - 6}" text-anchor="end">${fDay(x1)}</text></svg>`;
}

function viewMeas(v) {
  let inner = '';
  if (measTab === 'weight') {
    const all = [...S.weight].sort((a, b) => a.date.localeCompare(b.date));
    const cut = new Date(); measRange > 0 ? cut.setDate(cut.getDate() - measRange * (measRange === 3 ? 30 : 7)) : cut.setFullYear(1990);
    const rng = measRange === 3 ? new Date(Date.now() - 90 * 864e5) : measRange === 0 ? new Date(0) : new Date(Date.now() - measRange * 7 * 864e5);
    const pts = all.filter(w => new Date(w.date) >= rng);
    const ch = pts.length > 1 ? pts[pts.length - 1].v - pts[0].v : null;
    const weeks = pts.length > 1 ? (new Date(pts[pts.length - 1].date) - new Date(pts[0].date)) / (7 * 864e5) : 0;
    const sign = n => (n > 0 ? '+' : '') + fmtN(n);
    inner = `<div class="row between" style="margin-bottom:10px"><h2 style="margin:0;font-size:20px">تغير الوزن</h2></div>
      <div class="seg sm dark">${[[4, '4 أسابيع'], [8, '8 أسابيع'], [3, '3 أشهر'], [0, 'منذ البداية']].map(([k, l]) => `<button data-r="${k}" class="${measRange === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="card" style="padding:0;overflow:hidden"><div style="padding:14px 10px 8px">${pts.length > 1 ? lineChart(pts.map(p => ({ x: new Date(p.date).getTime(), y: p.v }))) : `<div class="empty" style="padding:50px 14px">${ic('chart')}يلزم تسجيل قياس آخر ليظهر منحنى التغير (${pts.length}/2).</div>`}</div>
      <div class="stats3" style="border-radius:0;border-top:1px solid var(--line);background:transparent;padding:14px 0"><div><b class="ltr">${ch == null ? '-' : sign(ch) + ' kg'}</b><span>التغير</span></div><div><b class="ltr">${ch == null || weeks < 0.1 ? '-' : sign(ch / weeks) + ' kg'}</b><span>التغير الأسبوعي</span></div></div></div>
      <div class="sec-title" style="margin-top:6px"><h2>السجل</h2>${all.length > 3 ? `<button class="link" id="w-all">${showAllW ? 'عرض أقل' : 'عرض الكل'}</button>` : ''}</div>
      ${[...all].reverse().slice(0, showAllW ? 999 : 3).map(w => `<button class="card row between" data-w="${w.date}" style="width:100%;margin-bottom:10px;padding:16px"><span class="muted small">${fDay(w.date + 'T12:00:00')}، ${fWd(w.date + 'T12:00:00')}</span><span class="ltr"><b style="font-size:22px">${fmtN(w.v)}</b> <span class="muted small">kg</span></span></button>`).join('') || '<div class="empty">لا توجد قياسات بعد</div>'}
      <button class="fab" id="w-add">${ic('plus')}</button>`;
  } else {
    inner = `<div class="grid2">${BODY_PARTS.map(n => { const a = [...(S.body[n] || [])].sort((x, y) => y.date.localeCompare(x.date)); const d = a.length > 1 ? a[0].v - a[1].v : null;
      return `<button class="mcard" data-b="${n}"><small>${n}</small><div class="ltr" style="margin:6px 0 2px;text-align:start"><b>${a[0] ? fmtN(a[0].v) : '-'}</b> <small>cm</small></div><small class="trend ${d == null ? 'flat' : d > 0 ? 'up' : d < 0 ? 'down' : 'flat'}">${d == null ? 'لا مقارنة بعد' : (d > 0 ? '+' : '') + fmtN(d) + ' cm'}</small></button>`; }).join('')}</div>`;
  }
  v.innerHTML = `<div class="screen"><div class="topbar"><h1>القياسات</h1></div>
    <div class="seg"><button data-mt="weight" class="${measTab === 'weight' ? 'on' : ''}">الوزن</button><button data-mt="body" class="${measTab === 'body' ? 'on' : ''}">قياسات الجسم</button></div>${inner}</div>`;
  $$('[data-mt]', v).forEach(b => b.onclick = () => { measTab = b.dataset.mt; render(); });
  $$('[data-r]', v).forEach(b => b.onclick = () => { measRange = +b.dataset.r; render(); });
  $('#w-all', v)?.addEventListener('click', () => { showAllW = !showAllW; render(); });
  $('#w-add', v)?.addEventListener('click', () => addWeightSheet());
  $$('[data-w]', v).forEach(b => b.onclick = () => addWeightSheet(b.dataset.w));
  $$('[data-b]', v).forEach(b => b.onclick = () => bodySheet(b.dataset.b));
}
function addWeightSheet(date) {
  const cur = date ? S.weight.find(w => w.date === date) : null;
  const s = openSheet({
    title: cur ? 'تعديل القياس' : 'تسجيل الوزن',
    body: `<div class="field"><label>الوزن (kg)</label><input class="inp ltr" id="wv" inputmode="decimal" placeholder="72.5" value="${cur ? cur.v : ''}"></div>
      <div class="field"><label>التاريخ</label><input class="inp ltr" id="wd" type="date" value="${cur ? cur.date : todayKey()}"></div>`,
    foot: `<div class="row">${cur ? '<button class="btn danger" id="wdel" style="flex:none;width:auto">حذف</button>' : ''}<button class="btn" id="wsave">حفظ</button></div>`
  });
  setTimeout(() => $('#wv', s.body)?.focus(), 300);
  $('#wsave', s.foot).onclick = () => {
    const v = num($('#wv', s.body).value), d = $('#wd', s.body).value || todayKey();
    if (isNaN(v) || v < 20 || v > 400) return toast('اكتب وزناً صحيحاً');
    S.weight = S.weight.filter(w => w.date !== d && w.date !== date); S.weight.push({ date: d, v }); save(); s.close(); render();
  };
  $('#wdel', s.foot)?.addEventListener('click', () => { S.weight = S.weight.filter(w => w.date !== date); save(); s.close(); render(); });
}
function bodySheet(name) {
  const s = openSheet({ title: name, body: '', foot: '' });
  function draw() {
    const a = [...(S.body[name] || [])].sort((x, y) => y.date.localeCompare(x.date));
    s.set(`<div class="field"><label>قياس جديد (cm)</label><div class="row"><input class="inp ltr" id="bv" inputmode="decimal" placeholder="0"><button class="btn sm" id="bs" style="flex:none">حفظ</button></div></div>
      ${a.length > 1 ? `<div class="card" style="padding:10px">${lineChart([...a].reverse().map(p => ({ x: new Date(p.date + 'T12:00:00').getTime(), y: p.v })))}</div>` : ''}
      ${a.map(p => `<div class="card row between" style="padding:14px"><span class="muted small">${fDay(p.date + 'T12:00:00')}</span><span class="ltr"><b>${fmtN(p.v)}</b> cm <button data-del="${p.date}" style="color:var(--rose);margin-inline-start:10px">${ic('trash', 'sm')}</button></span></div>`).join('')}`);
    $('#bs', s.body).onclick = () => { const v = num($('#bv', s.body).value); if (isNaN(v) || v <= 0) return toast('اكتب قياساً صحيحاً'); S.body[name] = (S.body[name] || []).filter(p => p.date !== todayKey()); S.body[name].push({ date: todayKey(), v }); save(); render(); draw(); };
    $$('[data-del]', s.body).forEach(b => b.onclick = () => { S.body[name] = S.body[name].filter(p => p.date !== b.dataset.del); save(); render(); draw(); });
  }
  draw();
}

/* ================= الإحصائيات ================= */
function openStats() {
  let mus = '', exId = '', range = 4;
  const s = openSheet({ title: 'إحصائيات التمرين', tall: true, body: '' });
  function draw() {
    const cur = muscleSets(weekSessions(0));
    const prevAvg = {}; const pm = [1, 2, 3, 4].map(i => muscleSets(weekSessions(-i)));
    STAT_MUSCLES.forEach(([k]) => { prevAvg[k] = pm.reduce((a, m) => a + (m[k] || 0), 0) / 4; });
    const rows = STAT_MUSCLES.map(([k, tgt]) => ({ k, tgt, c: cur[k] || 0, a: prevAvg[k] })).sort((x, y) => y.c - x.c);
    // تمارين لها سجل
    const withHist = Object.keys(EXERCISES).filter(i => history(i).length);
    const musList = [...new Set(withHist.flatMap(i => EXERCISES[i].pri))];
    if (!mus || !musList.includes(mus)) mus = musList[0] || '';
    const exList = withHist.filter(i => EXERCISES[i].pri.includes(mus));
    if (!exList.includes(exId)) exId = exList[0] || '';
    const cut = range ? new Date(Date.now() - range * 7 * 864e5) : new Date(0);
    const pts = exId ? history(exId).filter(h => new Date(h.date) >= cut).reverse().map(h => { const b = bestOf(h.sets); return { x: new Date(h.date).getTime(), y: e1rm(b.w, b.r), b }; }) : [];
    s.set(`<div class="card"><h2>مجموعات هذا الأسبوع</h2>
      <div class="mstat" style="padding:0 6px 8px"><span class="small muted">العضلة</span><span class="small muted" style="text-align:center">المجموعات</span><span class="small muted" style="text-align:center">مقابل المعدل</span></div>
      ${rows.map((r, i) => { const pct = r.a > 0 ? Math.round((r.c - r.a) / r.a * 100) : null; return `<div class="mstat ${i === 0 && r.c > 0 ? 'hl' : ''}"><div><div class="row between small" style="margin-bottom:5px"><b>${MUSCLES[r.k]}</b></div><div class="bar"><i style="width:${Math.min(100, r.c / r.tgt * 100)}%"></i></div></div><span style="text-align:center;font-weight:700" class="ltr">${fmtN(r.c)} / ${r.tgt}</span><span class="trend ${pct == null ? 'flat' : pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat'}" style="text-align:center">${pct == null ? '-' : (pct > 0 ? '↑ +' : pct < 0 ? '↓ ' : '') + pct + '%'}</span></div>`; }).join('')}
      <p class="small muted" style="margin:10px 0 0">المجموعة الأساسية تُحسب كاملة والثانوية بنصف قيمة. المقارنة مع متوسط آخر 4 أسابيع.</p></div>
      <div class="card"><h2>تطور الأوزان</h2>
      ${exList.length ? `<div class="chips">${musList.map(k => `<button class="chip ${mus === k ? 'on' : ''}" data-mu="${k}">${MUSCLES[k]}</button>`).join('')}</div>
      <div class="chips">${exList.map(i => `<button class="chip ${exId === i ? 'on' : ''}" data-ex="${i}" style="direction:ltr">${esc(EXERCISES[i].en)}</button>`).join('')}</div>
      <div class="seg sm dark">${[[4, '4 أسابيع'], [8, '8 أسابيع'], [12, '3 أشهر'], [0, 'منذ البداية']].map(([k, l]) => `<button data-rg="${k}" class="${range === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${pts.length > 1 ? lineChart(pts) : `<div class="empty">${pts.length === 1 ? 'يلزم أسبوع آخر لعرض الرسم البياني للتقدم.' : 'لا توجد بيانات في هذه الفترة.'}</div>`}
      ${pts.length ? `<div class="row between small muted"><span>آخر جلسة</span><b class="ltr" style="color:var(--text)">${setTxt(pts[pts.length - 1].b)}</b></div>` : ''}`
      : `<div class="empty">${ic('chart')}أنجز تمارين وستظهر هنا رسوم تطور أوزانك.</div>`}</div>`);
    $$('[data-mu]', s.body).forEach(b => b.onclick = () => { mus = b.dataset.mu; exId = ''; draw(); });
    $$('[data-ex]', s.body).forEach(b => b.onclick = () => { exId = b.dataset.ex; draw(); });
    $$('[data-rg]', s.body).forEach(b => b.onclick = () => { range = +b.dataset.rg; draw(); });
  }
  draw();
}

/* ================= محرر الجداول ================= */
function openEditor(pid) {
  const src = pid ? getProg(pid) : null;
  const wc = src ? JSON.parse(JSON.stringify({ name: src.name, level: src.level, place: src.place, days: src.days.map((d, i) => ({ name: d.name, ex: dayEx(src, i) })) }))
    : { name: '', level: 'مبتدئ', place: 'النادي', days: [{ name: 'اليوم 1', ex: [] }] };
  if (src && src.builtin !== false && BUILTIN_PROGRAMS.includes(src)) wc.name = src.name + ' (معدّل)';
  let di = 0;
  const s = openSheet({ title: src ? 'تعديل الجدول' : 'جدول جديد', tall: true, body: '', foot: '<button class="btn" id="ed-save">حفظ الجدول</button>' });
  function draw() {
    const d = wc.days[di];
    s.set(`<div class="field"><label>اسم الجدول</label><input class="inp" id="ed-name" value="${esc(wc.name)}" placeholder="مثال: جدولي"></div>
      <div class="row" style="margin-bottom:14px"><select class="inp" id="ed-lvl">${['مبتدئ', 'متوسط', 'متقدم'].map(x => `<option ${wc.level === x ? 'selected' : ''}>${x}</option>`).join('')}</select><select class="inp" id="ed-pl">${['النادي', 'المنزل'].map(x => `<option ${wc.place === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="day-tabs">${wc.days.map((x, i) => `<button data-d="${i}" class="${i === di ? 'on' : ''}">${esc(x.name) || 'يوم ' + (i + 1)}</button>`).join('')}<button data-d="add">+ يوم</button></div>
      <div class="row" style="margin-bottom:12px"><input class="inp" id="ed-dn" value="${esc(d.name)}" placeholder="اسم اليوم">${wc.days.length > 1 ? `<button class="icon-btn" id="ed-dd" style="color:var(--rose);flex:none">${ic('trash', 'sm')}</button>` : ''}</div>
      <div id="ed-list">${d.ex.map((e, i) => { const ex = exOf(e[0]); return `<div class="ex-row" data-i="${i}"><button class="grip" data-grip aria-label="اسحب لتغيير الترتيب">${ic('grip')}</button>${thumb(e[0])}<div class="info"><div class="nm">${esc(ex.en)}</div><div class="row" style="margin-top:6px;gap:6px"><input class="mini-in" data-f="1" data-i="${i}" value="${e[1]}" inputmode="numeric"><span class="muted">×</span><input class="mini-in" style="width:70px" data-f="2" data-i="${i}" value="${esc(e[2])}"><span class="muted small">راحة</span><input class="mini-in" data-f="3" data-i="${i}" value="${e[3]}" inputmode="numeric"></div></div>
        <button class="icon-btn" data-r="${i}" style="width:36px;height:36px;color:var(--rose)">${ic('trash', 'sm')}</button></div>`; }).join('')}</div>
      <button class="btn ghost" id="ed-add">${ic('plus')} إضافة تمرين</button>
      <p class="small muted" style="margin-top:8px">الصيغة: مجموعات × تكرارات، وقت الراحة بالثواني.</p>`);
    const b = s.body;
    $('#ed-name', b).oninput = e => wc.name = e.target.value;
    $('#ed-lvl', b).onchange = e => wc.level = e.target.value; $('#ed-pl', b).onchange = e => wc.place = e.target.value;
    $('#ed-dn', b).oninput = e => d.name = e.target.value;
    $$('[data-d]', b).forEach(x => x.onclick = () => { if (x.dataset.d === 'add') { wc.days.push({ name: 'اليوم ' + (wc.days.length + 1), ex: [] }); di = wc.days.length - 1; } else di = +x.dataset.d; draw(); });
    $('#ed-dd', b)?.addEventListener('click', () => { wc.days.splice(di, 1); di = Math.max(0, di - 1); draw(); });
    $$('input[data-f]', b).forEach(x => x.oninput = () => { const f = +x.dataset.f; d.ex[x.dataset.i][f] = f === 2 ? x.value : (parseInt(x.value) || (f === 1 ? 1 : 60)); });
    makeSortable($('#ed-list', b), '.ex-row', '[data-grip]', order => { d.ex = order.map(i => d.ex[i]); draw(); });
    $$('[data-r]', b).forEach(x => x.onclick = () => { d.ex.splice(+x.dataset.r, 1); draw(); });
    $('#ed-add', b).onclick = () => openPicker({ title: 'إضافة تمرين', onPick: id => { d.ex.push([id, 3, '8-12', exOf(id).type === 'compound' ? 120 : 75]); draw(); } });
  }
  draw();
  $('#ed-save', s.foot).onclick = () => {
    if (!wc.name.trim()) return toast('اكتب اسم الجدول');
    if (wc.days.some(d => !d.ex.length)) return toast('كل يوم لازم فيه تمرين واحد على الأقل');
    const isCustom = src && S.custom.some(c => c.id === src.id);
    const prog = { id: isCustom ? src.id : 'c' + uid(), name: wc.name.trim(), level: wc.level, place: wc.place, builtin: false, days: wc.days.map(d => ({ name: d.name.trim() || 'يوم', ex: d.ex })) };
    if (isCustom) S.custom = S.custom.map(c => c.id === prog.id ? prog : c); else { S.custom.push(prog); }
    Object.keys(S.overrides).filter(k => k.startsWith(prog.id + ':')).forEach(k => delete S.overrides[k]);
    if (!S.mine.includes(prog.id)) S.mine.push(prog.id);
    S.active = prog.id; S.next[prog.id] = 0; save(); s.close(); render(); toast('تم حفظ الجدول');
  };
}

/* ================= الإعدادات ================= */
function openSettings() {
  const s = openSheet({ title: 'الإعدادات', body: '' });
  function draw() {
    s.set(`<div class="field"><label>اسمك</label><div class="name-row"><input class="inp" id="nm" value="${esc(S.name)}" placeholder="اكتب اسمك" maxlength="24" autocomplete="off"><button class="btn" id="nm-save" disabled>حفظ</button></div></div>
      <div class="field"><label>لون التطبيق</label>
        <div class="swatches">${Object.entries(PALETTES).map(([k, p]) => `<button class="sw ${getTheme().accent === k ? 'on' : ''}" data-pal="${k}" aria-label="${p.n}" style="--c:${p.a}"><span></span></button>`).join('')}</div>
        <div class="small muted" style="margin-top:6px">${PALETTES[getTheme().accent].n}</div></div>
      <div class="field"><label>الخلفية</label><div class="seg dark" style="margin-bottom:0">${Object.entries(MODES).map(([k, m]) => `<button data-mode="${k}" class="${getTheme().mode === k ? 'on' : ''}">${m.n}</button>`).join('')}</div></div>
      <button class="menu-item" id="st-snd">${ic('bolt')}<span class="grow">صوت انتهاء الراحة<small>تنبيه صوتي واهتزاز عند انتهاء العدّاد</small></span><b style="color:${S.settings.sound ? 'var(--accent)' : 'var(--muted)'}">${S.settings.sound ? 'مفعّل' : 'متوقف'}</b></button>
      <button class="menu-item" id="st-exp">${ic('download')}<span>نسخة احتياطية<small>تنزيل ملف بكل بياناتك (احفظه في الملفات)</small></span></button>
      <label class="menu-item" style="cursor:pointer">${ic('upload')}<span>استعادة نسخة<small>اختر ملف النسخة الاحتياطية</small></span><input type="file" id="st-imp" accept="application/json,.json" hidden></label>
      <button class="menu-item danger" id="st-rst">${ic('trash')}<span>مسح كل البيانات<small style="color:var(--rose);opacity:.7">لا يمكن التراجع</small></span></button>
      <p class="small muted" style="line-height:1.8;margin-top:14px">بياناتك محفوظة على هذا الجهاز فقط. إذا مسحت بيانات Safari أو حذفت التطبيق ستضيع، فاحتفظ بنسخة احتياطية من وقت لآخر.</p>
      <p class="credit">المصادر: صور التمارين من مشروع free-exercise-db (ترخيص Unlicense، ملك عام). مخططات التشريح العضلي من مشروع wger (ترخيص CC BY-SA 3.0).</p>`);
    const b = s.body;
    wireNameInput(b, () => draw());
    const setTheme = patch => { S.settings.theme = Object.assign({}, getTheme(), patch); save(); applyTheme(); draw(); render(); };
    $$('[data-pal]', b).forEach(x => x.onclick = () => setTheme({ accent: x.dataset.pal }));
    $$('[data-mode]', b).forEach(x => x.onclick = () => setTheme({ mode: x.dataset.mode }));
    $('#st-snd', b).onclick = () => { S.settings.sound = !S.settings.sound; save(); if (S.settings.sound) { unlockAudio(); beep(); } draw(); };
    $('#st-exp', b).onclick = () => {
      const blob = new Blob([JSON.stringify(S)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'tamreeni-backup-' + todayKey() + '.json'; document.body.appendChild(a); a.click(); a.remove(); toast('تم تجهيز النسخة الاحتياطية');
    };
    $('#st-imp', b).onchange = e => {
      const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => { try { const d = JSON.parse(r.result); if (!d || d.v !== 1) throw 0; S = Object.assign(defaults(), d); save(); s.close(); render(); toast('تمت الاستعادة'); } catch (x) { toast('الملف غير صالح'); } };
      r.readAsText(f);
    };
    $('#st-rst', b).onclick = () => confirmSheet('مسح كل البيانات؟', 'ستُحذف كل التمارين والقياسات والجداول المخصصة نهائياً.', 'مسح الكل', () => { S = defaults(); save(); s.close(); render(); });
  }
  draw();
}

/* ================= البدء ================= */
$$('.tab').forEach(t => t.onclick = () => go(t.dataset.tab));
tab = 'home'; // يفتح دائماً على الرئيسية
render();
/* موشن الترحيب: ~1.8 ث ثم يكشف الرئيسية. اضغط عليه لتخطيه */
(() => {
  const sp = $('#splash'); if (!sp) return;
  $('#sp-sub').textContent = S.name ? 'أهلاً ' + S.name : 'جاهز للتمرين';
  let done = false;
  const hide = () => { if (done) return; done = true; sp.classList.add('out'); setTimeout(() => sp.remove(), 600); if (S.activeWorkout) { try { openWorkout(); } catch (e) {} } };
  sp.onclick = hide;
  setTimeout(hide, matchMedia('(prefers-reduced-motion: reduce)').matches ? 500 : 2000);
})();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});

/* ---------- اختيار تمرين: مرتّب حسب العضلة الأساسية، ومعه علامة ! لمعاينة الطريقة ---------- */
function openPicker({ muscle = '', title = 'اختر تمريناً', onPick, browse = false }) {
  let q = '', m = muscle, grp = '', gearF = '';
  if (m) grp = (MUSCLE_GROUPS.find(g => g[1].includes(m)) || [''])[0];
  const s = openSheet({ title, tall: true, body: '' });
  const row = e => `<div class="ex-row pick" data-id="${e.id}">
    <button class="pick-main" data-add="${e.id}">${thumb(e.id)}<div class="info"><div class="nm">${esc(e.en)}</div><div class="nm-ar">${esc(e.ar)}</div><div class="meta">${esc(e.gear)}${e.sec.length ? ' · ثانوي: ' + e.sec.slice(0, 2).map(k => MUSCLES[k]).join('، ') : ''}</div></div></button>
    ${browse ? '' : `<button class="info-btn" data-i="${e.id}" aria-label="معاينة طريقة التمرين">!</button>`}</div>`;
  function draw() {
    const match = e => (!q || (e.en + ' ' + e.ar).toLowerCase().includes(q.toLowerCase())) && (!gearF || (gearF === 'Technogym' ? e.brand === 'Technogym' : e.gear === gearF));
    const groups = MUSCLE_GROUPS.filter(g => !grp || g[0] === grp);
    let html = '';
    groups.forEach(([gn, ms]) => ms.filter(k => !m || k === m).forEach(k => {
      const list = Object.values(EXERCISES).filter(e => e.pri[0] === k && match(e));
      if (!list.length) return;
      html += `<div class="pick-h"><b>${MUSCLES[k]}</b><span>${list.length}</span></div>` + list.map(row).join('');
    }));
    const musOfGrp = grp ? MUSCLE_GROUPS.find(g => g[0] === grp)[1] : [];
    s.body.innerHTML = `<div class="row" style="margin-bottom:10px"><div class="search">${ic('search')}<input id="pq" placeholder="ابحث عن تمرين" value="${esc(q)}"></div></div>
      <div class="chips"><button class="chip ${!grp ? 'on' : ''}" data-g="">الكل</button>${MUSCLE_GROUPS.map(g => `<button class="chip ${grp === g[0] ? 'on' : ''}" data-g="${g[0]}">${g[0]}</button>`).join('')}</div>
      <div class="chips">${['', 'Technogym', 'جهاز', 'دمبل', 'بار', 'كيبل', 'سميث', 'وزن الجسم'].map(g => `<button class="chip sm gear ${gearF === g ? 'on' : ''}" data-gf="${g}">${g || 'كل الأدوات'}</button>`).join('')}</div>
      ${musOfGrp.length > 1 ? `<div class="chips"><button class="chip sm ${!m ? 'on' : ''}" data-m="">كل ${grp}</button>${musOfGrp.map(k => `<button class="chip sm ${m === k ? 'on' : ''}" data-m="${k}">${MUSCLES[k]}</button>`).join('')}</div>` : ''}
      <p class="small muted" style="margin:2px 2px 10px">${browse ? 'كل تمرين تحت عضلته الأساسية. اضغط التمرين لرؤية طريقته وروابط الشرح.' : 'كل تمرين يظهر تحت عضلته الأساسية. اضغط <b class="info-hint">!</b> لمعاينة طريقة التمرين قبل إضافته.'}</p>
      ${html || '<div class="empty">ما فيه نتائج</div>'}`;
    const inp = $('#pq', s.body);
    inp.oninput = () => { q = inp.value; const pos = inp.selectionStart; draw(); const n = $('#pq', s.body); n.focus(); n.setSelectionRange(pos, pos); };
    $$('[data-g]', s.body).forEach(b => b.onclick = () => { grp = b.dataset.g; m = ''; draw(); });
    $$('[data-m]', s.body).forEach(b => b.onclick = () => { m = b.dataset.m; draw(); });
    $$('[data-gf]', s.body).forEach(b => b.onclick = () => { gearF = b.dataset.gf; draw(); });
    $$('[data-add]', s.body).forEach(b => b.onclick = () => { if (browse) return openExercise(b.dataset.add); s.close(); onPick(b.dataset.add); });
    $$('[data-i]', s.body).forEach(b => b.onclick = () => openExercise(b.dataset.i, 'info', { onAdd: () => { s.close(); onPick(b.dataset.i); } }));
  }
  draw();
}

/* صور التمرين الحقيقية: صورتان (بداية/نهاية) تتبدلان كحركة، وإن لم تتوفر نرجع للرسم */
function animatePhoto(host, ex) {
  const a = new Image(), b = new Image();
  a.src = `img/${ex.img || ex.id}-0.jpg`; b.src = `img/${ex.img || ex.id}-1.jpg`; b.className = 'b';
  a.onerror = () => animateFigure(host, ex);
  host.innerHTML = ''; host.appendChild(a); host.appendChild(b);
}
