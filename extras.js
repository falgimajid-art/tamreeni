/* تخطي اليوم، تأكيد حفظ التمرين مع التمرين القادم، وسجل الجلسات */
'use strict';

/* تنبيه مع زر (مثل: تراجع) */
function toastAction(msg, label, fn) {
  $('.toast')?.remove();
  const t = document.createElement('div'); t.className = 'toast act';
  t.innerHTML = `<span>${esc(msg)}</span><button>${esc(label)}</button>`;
  document.body.appendChild(t);
  $('button', t).onclick = () => { t.remove(); fn(); };
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 6000);
}

/* تخطي اليوم الحالي والانتقال لليوم الذي بعده */
function skipDay(pid) {
  const p = getProg(pid); if (!p) return;
  const old = nextDay(p), nx = (old + 1) % p.days.length;
  S.next[p.id] = nx; save(); render();
  toastAction('تم تخطي اليوم ← التالي: ' + p.days[nx].name, 'تراجع', () => { S.next[p.id] = old; save(); render(); });
}

/* بعد حفظ التمرين: ماذا بعده؟ */
function openSaved(progId) {
  const p = getProg(progId); if (!p) return;
  const last = [...S.logs].sort((a, b) => b.date.localeCompare(a.date))[0];
  const nx = nextDay(p), exs = dayEx(p, nx);
  const mins = Math.round(exs.reduce((a, e) => a + e[1] * (45 + e[3]), 0) / 60);
  const s = openSheet({
    title: 'تم حفظ التمرين ✓',
    body: `<div class="card" style="background:var(--accent-soft)"><div class="small muted">اللي سجّلته اليوم</div>
        <b class="ltr" style="font-size:17px">${esc(last ? last.dayName : '')}</b>
        <div class="small muted" style="margin-top:4px">${last ? fmtDur(last.dur) + ' · ' + last.ex.reduce((a, e) => a + e.sets.length, 0) + ' مجموعة' : ''} · محفوظ في السجل</div></div>
      <div class="card"><div class="small muted">تمرينك القادم</div>
        <div style="font-weight:800;font-size:19px;margin:2px 0 4px" class="ltr">${esc(p.days[nx].name)}</div>
        <div class="small muted">${esc(p.name)} · اليوم ${nx + 1} من ${p.days.length} · ${exs.length} تمارين · ~${mins} د</div>
        <div class="thumbs">${exs.slice(0, 4).map(e => thumb(e[0], 'lg')).join('')}${exs.length > 4 ? `<div class="thumb lg more">+${exs.length - 4}</div>` : ''}</div></div>`,
    foot: `<div class="row"><button class="btn sec" id="sv-skip">${ic('arrowr')} تخطي هذا اليوم</button><button class="btn" id="sv-ok">تمام</button></div>`
  });
  $('#sv-ok', s.foot).onclick = s.close;
  $('#sv-skip', s.foot).onclick = () => { s.close(); skipDay(progId); };
}

/* سجل الجلسات */
function openHistory() {
  const s = openSheet({ title: 'سجل التمارين', tall: true, body: '' });
  const open = new Set();
  function draw() {
    const logs = [...S.logs].sort((a, b) => b.date.localeCompare(a.date));
    if (!logs.length) { s.set(`<div class="empty">${ic('list')}ما سجّلت أي تمرين بعد. بعد ما تنهي تمريناً يظهر هنا.</div>`); return; }
    const sum = (l, k) => l.ex.reduce((a, e) => a + (k === 'sets' ? e.sets.length : e.sets.reduce((b, x) => b + x.w * x.r, 0)), 0);
    s.set(`<div class="stats3" style="background:var(--surface);margin-bottom:14px"><div><b>${logs.length}</b><span>جلسة</span></div><div><b>${weekSessions().length}</b><span>هذا الأسبوع</span></div><div><b>${fmtDur(logs.reduce((a, l) => a + l.dur, 0))}</b><span>إجمالي الوقت</span></div></div>` +
      logs.map(l => `<div class="hist" data-l="${l.id}">
        <button class="hist-head" data-t="${l.id}" style="width:100%;text-align:start"><div><b class="ltr" style="font-size:16px">${esc(l.dayName)}</b><div class="small muted">${fWd(l.date)}، ${fDay(l.date)}</div></div>
          <div class="small muted" style="text-align:end">${fmtDur(l.dur)}<br>${sum(l, 'sets')} مجموعة · ${Math.round(sum(l, 'vol'))} kg</div></button>
        ${open.has(l.id) ? `<div style="margin-top:10px">${l.ex.map(e => { const ex = exOf(e.id); return `<div style="padding:8px 0;border-top:1px solid var(--line)"><div class="row between"><b class="ltr" style="font-size:14.5px">${esc(ex ? ex.en : e.id)}</b></div>
          <div class="small muted ltr" style="direction:ltr;margin-top:3px">${e.sets.map(x => fmtN(x.w) + '×' + fmtN(x.r)).join('  ·  ')}</div></div>`; }).join('')}
          <button class="btn danger sm" data-del="${l.id}" style="margin-top:10px">${ic('trash', 'sm')} حذف هذه الجلسة</button></div>` : ''}
      </div>`).join(''));
    $$('[data-t]', s.body).forEach(b => b.onclick = () => { const id = b.dataset.t; open.has(id) ? open.delete(id) : open.add(id); draw(); });
    $$('[data-del]', s.body).forEach(b => b.onclick = () => confirmSheet('حذف الجلسة؟', 'تُحذف من السجل والإحصائيات وأفضل المجموعات.', 'حذف', () => {
      S.logs = S.logs.filter(l => l.id !== b.dataset.del); save(); render(); draw(); toast('تم حذف الجلسة');
    }));
  }
  draw();
}

/* ================= أوزاني: وزنك على كل تمرين ================= */
function openMyWeights() {
  let q = '';
  const s = openSheet({ title: 'أوزاني على كل تمرين', tall: true, body: '' });
  function draw() {
    const ids = Object.keys(EXERCISES).map(id => ({ id, h: history(id) })).filter(x => x.h.length);
    ids.sort((a, b) => b.h[0].date.localeCompare(a.h[0].date));
    const list = ids.filter(x => !q || (EXERCISES[x.id].en + ' ' + EXERCISES[x.id].ar).toLowerCase().includes(q.toLowerCase()));
    s.body.innerHTML = `<div class="row" style="margin-bottom:12px"><div class="search">${ic('search')}<input id="wq" placeholder="ابحث عن تمرين" value="${esc(q)}"></div></div>` +
      (list.length ? list.map(x => {
        const ex = EXERCISES[x.id], last = x.h[0], best = bestOf(x.h.flatMap(h => h.sets));
        return `<button class="ex-row" style="width:100%" data-w="${x.id}">${thumb(x.id)}
          <div class="info"><div class="nm">${esc(ex.en)}</div><div class="nm-ar">${esc(ex.ar)}</div>
            <div class="meta ltr" style="direction:rtl;margin-top:3px">آخر مرة (${fDay(last.date)}): <b style="color:var(--text)">${last.sets.map(z => fmtN(z.w) + '×' + fmtN(z.r)).join(' · ')}</b></div>
            <div class="meta ltr" style="direction:rtl;color:var(--sand)">أفضل: ${setTxt(best)} · ${x.h.length} جلسات</div></div></button>`;
      }).join('') : `<div class="empty">${ic('trophy')}${ids.length ? 'ما فيه نتائج' : 'ما سجّلت أي تمرين بعد. بعد أول جلسة يظهر وزنك على كل تمرين هنا.'}</div>`);
    const inp = $('#wq', s.body);
    inp.oninput = () => { q = inp.value; const p = inp.selectionStart; draw(); const n = $('#wq', s.body); n.focus(); n.setSelectionRange(p, p); };
    $$('[data-w]', s.body).forEach(b => b.onclick = () => openExercise(b.dataset.w, 'hist'));
  }
  draw();
}

/* ================= مؤقت الراحة بصوت يستمر والجوال مقفل =================
   نبني ملفاً صوتياً فيه صمت بطول الراحة المتبقية ثم ثلاث نغمات. تشغيله كصوت يبقي التطبيق حياً في الخلفية
   (ويظهر عداد على شاشة القفل)، والنغمات تُسمع عند انتهاء الراحة حتى لو الشاشة مقفلة. */
let restAudio = null;
function makeRestWav(secs) {
  const sr = 8000, n = Math.ceil((secs + 1.6) * sr), buf = new ArrayBuffer(44 + n), v = new DataView(buf), u = new Uint8Array(buf);
  const w = (o, t) => { for (let i = 0; i < t.length; i++) u[o + i] = t.charCodeAt(i); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
  u.fill(128, 44);
  [[0, 784], [0.28, 784], [0.56, 1046]].forEach(([t0, f]) => {
    const a = Math.floor((secs + t0) * sr), len = Math.floor(0.2 * sr);
    for (let i = 0; i < len && 44 + a + i < u.length; i++) {
      const env = Math.min(1, i / 120, (len - i) / 400);
      u[44 + a + i] = 128 + Math.round(Math.sin(2 * Math.PI * f * i / sr) * 105 * env);
    }
  });
  return new Blob([buf], { type: 'audio/wav' });
}
function restAudioActive() { return !!(restAudio && restAudio.el && !restAudio.el.paused && !restAudio.el.ended); }
function stopRestAudio() {
  if (!restAudio) return;
  try { restAudio.el.pause(); URL.revokeObjectURL(restAudio.url); } catch (e) { /* ok */ }
  restAudio = null;
  try { if (navigator.mediaSession) { navigator.mediaSession.playbackState = 'none'; navigator.mediaSession.metadata = null; } } catch (e) { /* ok */ }
}
function startRestAudio(secs) {
  stopRestAudio();
  if (S.settings.bgRest === false) return;
  try {
    const url = URL.createObjectURL(makeRestWav(secs)), el = new Audio(url);
    el.setAttribute('playsinline', ''); el.volume = 1;
    restAudio = { el, url };
    const p = el.play(); if (p && p.catch) p.catch(() => { /* يحتاج لمسة: نبقى على العداد العادي */ });
    if (navigator.mediaSession) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: 'وقت الراحة', artist: 'تمريني', album: (S.activeWorkout && S.activeWorkout.dayName) || '' });
      navigator.mediaSession.playbackState = 'playing';
      try { navigator.mediaSession.setPositionState({ duration: secs + 1.6, position: 0, playbackRate: 1 }); } catch (e) { /* ok */ }
      navigator.mediaSession.setActionHandler('pause', () => { stopRestAudio(); });
    }
  } catch (e) { restAudio = null; }
}
