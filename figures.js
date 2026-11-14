/* رسم التمارين (شخصية متحركة) ورسم العضلات */

const FIG = { limb: '#5a6a71', torso: '#3f4d54', arm: '#76878e', eq: '#a9b6b9', hi: '#4f9d87', floor: '#c9d2cf' };

const EQ = {
  bench: () => `<rect x="36" y="100" width="104" height="7" rx="3"/><line x1="52" y1="107" x2="52" y2="138"/><line x1="124" y1="107" x2="124" y2="138"/>`,
  incline: () => `<line x1="60" y1="84" x2="116" y2="114" stroke-width="9"/><line x1="104" y1="118" x2="142" y2="118" stroke-width="6"/><line x1="120" y1="118" x2="120" y2="138"/><line x1="76" y1="96" x2="76" y2="138"/>`,
  seat: () => `<line x1="82" y1="46" x2="84" y2="100" stroke-width="9"/><line x1="78" y1="107" x2="122" y2="107" stroke-width="7"/><line x1="100" y1="107" x2="100" y2="138"/>`,
  seatback: () => `<line x1="90" y1="44" x2="92" y2="98" stroke-width="9"/><line x1="86" y1="107" x2="132" y2="107" stroke-width="7"/><line x1="110" y1="107" x2="110" y2="138"/>`,
  seatpad: () => `<line x1="80" y1="44" x2="82" y2="100" stroke-width="9"/><line x1="82" y1="107" x2="132" y2="107" stroke-width="7"/><line x1="108" y1="107" x2="108" y2="138"/>`,
  seatrow: () => `<line x1="72" y1="107" x2="112" y2="107" stroke-width="7"/><line x1="92" y1="107" x2="92" y2="138"/><line x1="174" y1="92" x2="174" y2="138" stroke-width="6"/>`,
  legpress: j => {
    const dx = j.A[0] - j.K[0], dy = j.A[1] - j.K[1], l = Math.hypot(dx, dy) || 1, px = dy / l, py = -dx / l;
    return `<line x1="26" y1="84" x2="64" y2="118" stroke-width="9"/><line x1="68" y1="134" x2="178" y2="48" stroke-width="4"/>` +
      `<line x1="${j.A[0] + px * 26}" y1="${j.A[1] + py * 26}" x2="${j.A[0] - px * 8}" y2="${j.A[1] - py * 8}" stroke-width="7"/>`;
  },
  hyper: () => `<line x1="46" y1="132" x2="118" y2="100" stroke-width="6"/><line x1="82" y1="116" x2="82" y2="138"/><line x1="110" y1="104" x2="110" y2="138"/>`,
  bars: () => `<line x1="114" y1="76" x2="114" y2="138" stroke-width="5"/><line x1="98" y1="76" x2="126" y2="76" stroke-width="5"/>`,
  pullbar: () => `<line x1="74" y1="8" x2="142" y2="8" stroke-width="5"/><line x1="78" y1="8" x2="78" y2="138" stroke-width="3"/><line x1="138" y1="8" x2="138" y2="138" stroke-width="3"/>`,
  lunge: j => { const h = j.H; return `<polyline points="${h[0]},${h[1]} ${h[0] - 24},${h[1] + 24} ${h[0] - 44},138" fill="none" stroke="${FIG.limb}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`; },
  preacher: () => `<line x1="94" y1="72" x2="122" y2="96" stroke-width="11"/><line x1="82" y1="107" x2="132" y2="107" stroke-width="7"/><line x1="108" y1="107" x2="108" y2="138"/><line x1="80" y1="52" x2="82" y2="100" stroke-width="8"/>`,
  thrust: () => `<rect x="28" y="104" width="54" height="8" rx="3"/><line x1="40" y1="112" x2="40" y2="138"/><line x1="72" y1="112" x2="72" y2="138"/>`
};

function lerp(a, b, t) { return a + (b - a) * t; }

function joints(pose, t) {
  const f = pose.a.map((v, i) => lerp(v, pose.b[i], t));
  return { S: [f[0], f[1]], H: [f[2], f[3]], E: [f[4], f[5]], W: [f[6], f[7]], K: [f[8], f[9]], A: [f[10], f[11]] };
}

function ln(p, q, color, w) {
  return `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
}

function figureInner(ex, t) {
  const pose = POSES[ex.kind];
  if (!pose) return '';
  const j = joints(pose, t);
  const { S, H, E, W, K, A } = j;
  // الرأس
  let hx = S[0] - H[0], hy = S[1] - H[1]; const hl = Math.hypot(hx, hy) || 1;
  const head = [S[0] + hx / hl * 13, S[1] + hy / hl * 13];
  // القدم
  let toe;
  if (A[1] >= 134 && K[1] < A[1]) toe = [A[0] + 12, Math.max(A[1] + 1, 138)];
  else {
    const dx = A[0] - K[0], dy = A[1] - K[1], l = Math.hypot(dx, dy) || 1;
    toe = [A[0] + dy / l * 12, A[1] - dx / l * 12];
  }
  // مناطق التمييز حسب العضلة الأساسية
  const pri = ex.pri[0];
  const mid = p => [S[0] + (H[0] - S[0]) * p, S[1] + (H[1] - S[1]) * p];
  let hi = '';
  if (['chest', 'front_delt', 'side_delt', 'rear_delt', 'upper_back', 'lats'].includes(pri)) hi = ln(S, mid(0.5), FIG.hi, 9);
  else if (['abs', 'lower_back'].includes(pri)) hi = ln(mid(0.45), H, FIG.hi, 9);
  else if (['biceps', 'triceps'].includes(pri)) hi = ln(S, E, FIG.hi, 6);
  else if (pri === 'forearms') hi = ln(E, W, FIG.hi, 6);
  else if (['quads', 'hamstrings'].includes(pri)) hi = ln(H, K, FIG.hi, 8);
  else if (pri === 'glutes') hi = `<circle cx="${H[0].toFixed(1)}" cy="${H[1].toFixed(1)}" r="8" fill="${FIG.hi}"/>`;
  else if (pri === 'calves') hi = ln(K, A, FIG.hi, 6);

  // الوزن
  let wsvg = '';
  if (pose.w && pose.w !== 'none') {
    const P = j[pose.wp || 'W'];
    const r = pose.w === 'bar' ? 9 : pose.w === 'plate' ? 10 : 5.5;
    wsvg = `<circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="${r}" fill="#8a999f" stroke="#6a7a82" stroke-width="1.5"/><circle cx="${P[0].toFixed(1)}" cy="${P[1].toFixed(1)}" r="2" fill="#3f4d54"/>`;
  }
  // الكيبل
  let cable = '';
  if (pose.cable) {
    cable = `<line x1="${pose.cable[0]}" y1="${pose.cable[1]}" x2="${W[0].toFixed(1)}" y2="${W[1].toFixed(1)}" stroke="#8b9ba2" stroke-width="1.6"/><circle cx="${pose.cable[0]}" cy="${pose.cable[1]}" r="4" fill="#8b9ba2"/>`;
  }
  const eqf = EQ[pose.eq];
  const eq = eqf ? `<g stroke="${FIG.eq}" fill="${FIG.eq}" stroke-linecap="round" stroke-width="5">${eqf(j)}</g>` : '';
  return `<line x1="6" y1="140" x2="214" y2="140" stroke="${FIG.floor}" stroke-width="2"/>${eq}${cable}` +
    ln(H, K, FIG.limb, 8) + ln(K, A, FIG.limb, 7) + ln(A, toe, FIG.limb, 6) +
    ln(S, H, FIG.torso, 11) + hi +
    ln(S, E, FIG.arm, 6.5) + ln(E, W, FIG.arm, 6) +
    `<circle cx="${head[0].toFixed(1)}" cy="${head[1].toFixed(1)}" r="7.5" fill="${FIG.torso}"/>` + wsvg;
}

function figureSvg(ex, t = 0) {
  return `<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${figureInner(ex, t)}</svg>`;
}

/* شخصية متحركة داخل عنصر (تتوقف إذا أزيل العنصر) */
function animateFigure(host, ex) {
  host.innerHTML = `<svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"></svg>`;
  const el = host.firstChild;
  el.innerHTML = figureInner(ex, 0);
  let start = null;
  const period = 2600;
  function frame(ts) {
    if (!el.isConnected) return;
    if (start === null) start = ts;
    const p = ((ts - start) % period) / period;       // 0..1
    // 0-0.4 نزول، 0.4-0.5 ثبات، 0.5-0.9 رجوع، ثم ثبات
    let t;
    if (p < 0.4) t = p / 0.4;
    else if (p < 0.5) t = 1;
    else if (p < 0.9) t = 1 - (p - 0.5) / 0.4;
    else t = 0;
    t = t * t * (3 - 2 * t);
    el.innerHTML = figureInner(ex, t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- التشريح العضلي (مخططات wger الحقيقية) ---------- */
const WGER = { // عضلاتنا -> رقم عضلة wger، والوجه (f أمامي / b خلفي)
  chest: [['f', 4]], front_delt: [['f', 2]], side_delt: [['f', 2]], biceps: [['f', 1], ['f', 13]], abs: [['f', 6], ['f', 14]],
  quads: [['f', 10]], triceps: [['b', 5]], lats: [['b', 12]], upper_back: [['b', 9]], traps: [['b', 9]], glutes: [['b', 8]],
  hamstrings: [['b', 11]], calves: [['b', 7], ['b', 15]]
};
// عضلات غير موجودة في wger: نرسم لها تظليلاً ناعماً فوق الصورة (إحداثيات 200×369)
const EXTRA = {
  rear_delt: ['b', [[52, 88, 14, 14, 0], [148, 88, 14, 14, 0]]],
  lower_back: ["b", [[100, 136, 22, 16, 0]]],
  forearms: ['fb', [[34, 168, 9, 27, 20], [166, 168, 9, 27, -20]]],
  adductors: ['f', [[90, 236, 6, 30, 0], [110, 236, 6, 30, 0]]]
};
function anatomyHtml(pri, sec, cls = '') {
  const views = { b: { base: 'anat/back.svg', ov: '', ex: '' }, f: { base: 'anat/front.svg', ov: '', ex: '' } };
  const add = (list, kind) => list.forEach(m => {
    (WGER[m] || []).forEach(([v, id]) => { views[v].ov += `<img class="ov ${kind}" src="anat/m${id}-${kind === 'p' ? 'm' : 's'}.svg" alt="">`; });
    const e = EXTRA[m];
    if (e) [...e[0]].forEach(v => { views[v].ex += e[1].map(([x, y, rx, ry, r]) => `<ellipse class="${kind}" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})"/>`).join(''); });
  });
  add(sec, 's'); add(pri, 'p');
  const view = v => `<div class="view"><img src="${views[v].base}" alt="">${views[v].ov}<svg class="ex" viewBox="0 0 200 369">${views[v].ex}</svg></div>`;
  return `<div class="anat ${cls}">${view('b')}${view('f')}</div>`;
}
