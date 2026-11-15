/* استبدال وترتيب التمارين أثناء التمرين + سحب لإعادة الترتيب (يعمل باللمس والماوس) */
'use strict';

function swapWorkoutExercise(xi, after) {
  const aw = S.activeWorkout, e = aw.ex[xi];
  const doSwap = id => {
    const n = Math.max(1, e.sets.length);
    aw.ex[xi] = { id, n, reps: e.reps, rest: exOf(id).type === 'compound' ? Math.max(e.rest, 90) : e.rest, sets: Array.from({ length: n }, () => ({ w: '', r: '', rir: '', done: false })) };
    save(); drawWorkout(); after && after(); toast('تم استبدال التمرين');
  };
  openPicker({
    muscle: exOf(e.id).pri[0], title: 'استبدال التمرين', onPick: id => {
      if (e.sets.some(s => s.done)) confirmSheet('التمرين فيه مجموعات منجزة', 'سيُحذف ما سجّلته في هذا التمرين عند استبداله.', 'استبدل', () => doSwap(id));
      else doSwap(id);
    }
  });
}

function openWorkoutOrder() {
  const aw = S.activeWorkout; if (!aw) return;
  const s = openSheet({
    title: 'ترتيب التمارين', tall: true, body: '',
    foot: `<label class="chk-row"><input type="checkbox" id="wo-prog"> احفظ هذا الترتيب والتمارين في الجدول أيضاً</label><button class="btn" id="wo-done">تم</button>`
  });
  function draw() {
    s.set(`<p class="small muted" style="margin:2px 2px 12px">اسحب المقبض ${ic('grip', 'sm')} لتحريك التمرين للمكان اللي تبيه، أو استبدله أو احذفه.</p>
      <div id="wo-list">${aw.ex.map((e, i) => {
        const ex = exOf(e.id), dn = e.sets.filter(x => x.done).length;
        return `<div class="ex-row" data-i="${i}"><button class="grip" data-grip aria-label="اسحب لتغيير الترتيب">${ic('grip')}</button>${thumb(e.id)}
          <div class="info"><div class="nm">${esc(ex.en)}</div><div class="meta">${dn}/${e.sets.length} مجموعات${dn === e.sets.length ? ' ✓' : ''}</div></div>
          <button class="swap" data-sw="${i}">${ic('swap', 'sm')} استبدال</button>
          <button class="icon-btn" data-rm="${i}" aria-label="حذف" style="width:34px;height:34px;color:var(--rose)">${ic('trash', 'sm')}</button></div>`;
      }).join('')}</div>
      <button class="btn ghost" id="wo-add">${ic('plus')} إضافة تمرين</button>`);
    const b = s.body;
    makeSortable($('#wo-list', b), '.ex-row', '[data-grip]', order => { aw.ex = order.map(i => aw.ex[i]); save(); drawWorkout(); draw(); });
    $$('[data-sw]', b).forEach(x => x.onclick = () => swapWorkoutExercise(+x.dataset.sw, draw));
    $$('[data-rm]', b).forEach(x => x.onclick = () => {
      const i = +x.dataset.rm; if (aw.ex.length <= 1) return toast('لازم يبقى تمرين واحد');
      const rm = () => { aw.ex.splice(i, 1); save(); drawWorkout(); draw(); };
      aw.ex[i].sets.some(q => q.done) ? confirmSheet('حذف تمرين فيه مجموعات منجزة؟', 'ستُحذف مجموعاته المسجّلة.', 'حذف', rm) : rm();
    });
    $('#wo-add', b).onclick = () => openPicker({
      title: 'إضافة تمرين', onPick: id => {
        const t = exOf(id).type === 'compound';
        aw.ex.push({ id, n: 3, reps: '8-12', rest: t ? 120 : 75, sets: Array.from({ length: 3 }, () => ({ w: '', r: '', rir: '', done: false })) });
        save(); drawWorkout(); draw();
      }
    });
  }
  draw();
  $('#wo-done', s.foot).onclick = () => {
    if ($('#wo-prog', s.foot).checked) {
      S.overrides[aw.progId + ':' + aw.dayIdx] = aw.ex.map(e => [e.id, e.n || e.sets.length, e.reps, e.rest]);
      save(); toast('تم حفظ الترتيب في الجدول');
    }
    s.close();
  };
}

/* سحب لإعادة الترتيب */
function makeSortable(list, itemSel, handleSel, onDone) {
  if (!list) return;
  list.addEventListener('pointerdown', ev => {
    const h = ev.target.closest(handleSel); if (!h) return;
    const item = h.closest(itemSel); if (!item || !list.contains(item)) return;
    ev.preventDefault();
    const items = () => [...list.querySelectorAll(itemSel)];
    const scroller = list.closest('.sheet-body') || document.scrollingElement;
    let startY = ev.clientY, lastY = ev.clientY, raf = 0;
    const before = items().map(x => x.dataset.i).join(',');
    item.classList.add('dragging');
    try { h.setPointerCapture(ev.pointerId); } catch (e) { /* ok */ }
    const place = y => {
      lastY = y; item.style.transform = `translateY(${y - startY}px)`;
      const arr = items(), idx = arr.indexOf(item), r = item.getBoundingClientRect(), cy = r.top + r.height / 2;
      const prev = arr[idx - 1], next = arr[idx + 1];
      let target = null, up = false;
      if (prev) { const p = prev.getBoundingClientRect(); if (cy < p.top + p.height / 2) { target = prev; up = true; } }
      if (!target && next) { const n = next.getBoundingClientRect(); if (cy > n.top + n.height / 2) target = next; }
      if (target) {
        const vTop = r.top; item.style.transform = '';
        list.insertBefore(item, up ? target : target.nextSibling);
        const off = vTop - item.getBoundingClientRect().top;
        startY = y - off; item.style.transform = `translateY(${off}px)`;
      }
    };
    const edge = () => { // تمرير تلقائي عند الاقتراب من حافة القائمة
      const sr = scroller.getBoundingClientRect ? scroller.getBoundingClientRect() : { top: 0, bottom: innerHeight };
      if (lastY < sr.top + 60) scroller.scrollTop -= 8; else if (lastY > sr.bottom - 60) scroller.scrollTop += 8;
      raf = requestAnimationFrame(edge);
    };
    raf = requestAnimationFrame(edge);
    const move = e => { if (e.pointerId === ev.pointerId) place(e.clientY); };
    const end = e => {
      if (e.pointerId !== ev.pointerId) return;
      cancelAnimationFrame(raf);
      h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', end); h.removeEventListener('pointercancel', end);
      item.classList.remove('dragging'); item.style.transform = '';
      const after = items().map(x => x.dataset.i).join(',');
      if (after !== before) onDone(items().map(x => +x.dataset.i));
    };
    h.addEventListener('pointermove', move); h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
  });
}
