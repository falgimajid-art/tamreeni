/* إضافة تمرين يدوي (بصورتك وعضلته) + ملاحظات التمارين */
'use strict';

/* ---------- الملاحظات ---------- */
function noteLines(e) {
  const pinned = S.notes && S.notes[e.id], lastNote = (history(e.id)[0] || {}).note;
  return (pinned ? `<div class="small" style="color:var(--sand);white-space:pre-wrap">📌 ${esc(pinned)}</div>` : '') +
    (e.note ? `<div class="small" style="color:var(--accent);white-space:pre-wrap">📝 ${esc(e.note)}</div>`
      : (lastNote ? `<div class="small muted" style="white-space:pre-wrap">ملاحظتك آخر مرة: ${esc(lastNote)}</div>` : ''));
}

/* xi: رقم التمرين في التمرين الجاري (لملاحظة هذه الجلسة)، أو null لملاحظة التمرين الثابتة فقط */
function openNoteSheet(exId, xi, after) {
  const ex = exOf(exId), aw = S.activeWorkout, hasSession = xi !== null && xi !== undefined && aw && aw.ex[xi];
  const s = openSheet({
    title: 'ملاحظة — ' + esc(ex.ar), body: '', foot: '<button class="btn" id="nt-save">حفظ</button>'
  });
  s.set(`${hasSession ? `<div class="field"><label>ملاحظة لهذه الجلسة (تنحفظ في السجل)</label>
      <textarea class="inp" id="nt-s" rows="3" placeholder="مثلاً: سويت دروب ست، أو وقفت 2 ثانية بالأسفل">${esc(aw.ex[xi].note || '')}</textarea></div>` : ''}
    <div class="field"><label>ملاحظة ثابتة على التمرين (تظهر لك كل مرة)</label>
      <textarea class="inp" id="nt-p" rows="3" placeholder="مثلاً: ضبط المقعد 4، المقبض الضيق">${esc((S.notes && S.notes[exId]) || '')}</textarea></div>`);
  $('#nt-save', s.foot).onclick = () => {
    if (hasSession) aw.ex[xi].note = $('#nt-s', s.body).value.trim();
    const p = $('#nt-p', s.body).value.trim(); S.notes = S.notes || {}; if (p) S.notes[exId] = p; else delete S.notes[exId];
    save(); s.close(); toast('تم حفظ الملاحظة'); after && after();
  };
}

/* ---------- صورة التمرين: تصغير وضغط قبل التخزين ---------- */
function fileToDataUrl(file, maxW = 720, q = 0.72) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxW / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', q));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
    img.src = url;
  });
}

/* ---------- إضافة / تعديل تمرين يدوي ---------- */
function openCustomEx({ id = '', muscle = '', onDone } = {}) {
  const old = id ? S.customEx.find(x => x.id === id) : null;
  const st = old ? { ...old, sec: [...(old.sec || [])] } : { name: '', muscle: muscle || '', sec: [], gear: 'جهاز', photo: '', how: '' };
  const GEARS = ['جهاز', 'دمبل', 'بار', 'كيبل', 'وزن الجسم', 'أخرى'];
  const s = openSheet({ title: old ? 'تعديل التمرين' : 'إضافة تمرين بنفسك', tall: true, body: '', foot: '<button class="btn" id="cx-save">حفظ التمرين</button>' });
  function draw() {
    s.set(`<div class="field"><label>اسم التمرين أو الجهاز</label><input class="inp" id="cx-name" value="${esc(st.name)}" placeholder="مثال: جهاز ضغط الصدر (Hammer)" maxlength="60"></div>
      <div class="field"><label>صورة التمرين (اختيارية)</label>
        ${st.photo ? `<div class="fig-card" style="margin-bottom:10px"><img src="${st.photo}" alt="" style="aspect-ratio:auto;max-height:240px;object-fit:contain"></div>` : ''}
        <div class="row"><label class="btn sec sm" style="flex:1;cursor:pointer;justify-content:center">${ic('plus', 'sm')} التقاط صورة<input type="file" accept="image/*" capture="environment" id="cx-cam" hidden></label>
          <label class="btn sec sm" style="flex:1;cursor:pointer;justify-content:center">${ic('upload', 'sm')} من الاستوديو<input type="file" accept="image/*" id="cx-gal" hidden></label>
          ${st.photo ? `<button class="icon-btn" id="cx-rmp" aria-label="إزالة الصورة" style="color:var(--rose);flex:none">${ic('trash', 'sm')}</button>` : ''}</div></div>
      <div class="field"><label>العضلة الأساسية</label><div class="chips" style="flex-wrap:wrap;overflow:visible">${MUSCLE_GROUPS.flatMap(g => g[1]).map(k => `<button class="chip ${st.muscle === k ? 'on' : ''}" data-m="${k}">${MUSCLES[k]}</button>`).join('')}</div></div>
      <div class="field"><label>عضلات ثانوية (اختياري)</label><div class="chips" style="flex-wrap:wrap;overflow:visible">${MUSCLE_GROUPS.flatMap(g => g[1]).filter(k => k !== st.muscle).map(k => `<button class="chip sm ${st.sec.includes(k) ? 'on' : ''}" data-s="${k}">${MUSCLES[k]}</button>`).join('')}</div></div>
      <div class="field"><label>الأداة</label><div class="chips" style="flex-wrap:wrap;overflow:visible">${GEARS.map(g => `<button class="chip ${st.gear === g ? 'on' : ''}" data-g="${g}">${g}</button>`).join('')}</div></div>
      <div class="field"><label>طريقة التمرين أو ملاحظات (اختياري)</label><textarea class="inp" id="cx-how" rows="3" placeholder="كيف تؤديه، ضبط الجهاز...">${esc(st.how)}</textarea></div>`);
    const b = s.body;
    $('#cx-name', b).oninput = e => st.name = e.target.value; $('#cx-how', b).oninput = e => st.how = e.target.value;
    $$('[data-m]', b).forEach(x => x.onclick = () => { st.muscle = x.dataset.m; st.sec = st.sec.filter(k => k !== st.muscle); draw(); });
    $$('[data-s]', b).forEach(x => x.onclick = () => { const k = x.dataset.s; st.sec = st.sec.includes(k) ? st.sec.filter(y => y !== k) : [...st.sec, k]; draw(); });
    $$('[data-g]', b).forEach(x => x.onclick = () => { st.gear = x.dataset.g; draw(); });
    $('#cx-rmp', b)?.addEventListener('click', () => { st.photo = ''; draw(); });
    ['#cx-cam', '#cx-gal'].forEach(sel => $(sel, b).onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { st.photo = await fileToDataUrl(f); draw(); } catch (x) { toast('تعذّر قراءة الصورة'); }
    });
  }
  draw();
  $('#cx-save', s.foot).onclick = () => {
    const name = st.name.trim();
    if (!name) return toast('اكتب اسم التمرين');
    if (!st.muscle) return toast('اختر العضلة الأساسية');
    const d = { id: old ? old.id : 'x' + uid(), name, muscle: st.muscle, sec: st.sec, gear: st.gear, photo: st.photo, how: st.how.trim(), type: 'iso', deleted: false };
    if (old) S.customEx = S.customEx.map(x => x.id === old.id ? d : x); else S.customEx.push(d);
    registerCustomEx(d); save(); render(); s.close(); toast('تم حفظ التمرين ✓');
    onDone && onDone(d.id);
  };
}
