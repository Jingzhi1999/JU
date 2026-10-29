// Verifier: measure fixed objects + header collapse in one concept (scratchpad). JU_STANDALONE=<build> node measure.cjs C05 out.json
const L = require('/home/user/JU/my-r2/tools/_lib.cjs'); const os = require('os');
const [code, out] = L.positionals();
const M = `
var ph = sr.querySelector('.ju-phone'), P = ph.getBoundingClientRect();
function vis(e){ var b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.bottom > P.top && b.top < P.bottom; }
function R(e){ if(!e) return null; var b = e.getBoundingClientRect(); return { x: Math.round(b.left-P.left), y: Math.round(b.top-P.top), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; }
function first(sel){ return Array.prototype.slice.call(sr.querySelectorAll(sel)).filter(vis)[0] || null; }
function fs(e){ if(!e) return null; var s = getComputedStyle(e); return { size: s.fontSize, weight: s.fontWeight, family: s.fontFamily.split(',')[0], lh: s.lineHeight, color: s.color }; }
var cta = first('.ju-v27-cta'); var cs = cta ? getComputedStyle(cta) : null;
var card = first('.c05-card'); var inner = card ? Array.prototype.slice.call(card.querySelectorAll('*')).filter(function(e){ var b=e.getBoundingClientRect(); return b.width>150; })[0] : null;
var face = first('.ju-ticket-face'), paper = first('[data-paper]'), stub = first('[data-tear] canvas'), stamp = first('[data-raster=stamp]');
var pap = first('.c05-paper');
return { phone: { w: P.width, h: P.height }, title: fs(first('.c05-ttl')), titleR: R(first('.c05-ttl')), name: fs(first('.c05-name')), nameR: R(first('.c05-name')), time: fs(first('.c05-time')), timeR: R(first('.c05-time')),
  card: R(card), cardInner: R(inner), cardTransform: card ? getComputedStyle(card).transform.slice(0,60) : null,
  cta: cta ? { r: R(cta), bgLayers: (cs.backgroundImage.match(/gradient\\(/g)||[]).length, shadowLayers: cs.boxShadow.split(/,(?![^(]*\\))/).length, radius: cs.borderRadius, font: cs.fontSize + '/' + cs.fontWeight + ' ' + cs.letterSpacing, label: cta.textContent.trim().slice(0,12), bg: cs.backgroundColor } : null,
  ticketFace: R(face), ticketPaper: R(paper), stub: R(stub), stamp: R(stamp), paperTop: pap ? R(pap).y : null };`;
(async () => {
  const { b, p, errors } = await L.launch({ viewport: { width: 1000, height: 1000 } });
  const res = { load: os.loadavg()[0].toFixed(2) };
  await L.openConcept(p, L.fileFor(code), code, 900);
  await L.E(p, code, 'var el = inst.envRef && inst.envRef.current; if (el) JU.shared.skins.pause(el);');
  for (const k of ['j-home', 'h-home', 'j-d-gathering', 'h-m-review', 'j-d-tear', 'j-d-reschedule', 'j-d-ended', 'h-m-card']) {
    if (k !== 'j-home') await L.jump(p, code, k, k === 'j-d-tear' || k === 'j-d-reschedule' ? 4500 : k === 'j-d-ended' ? 3500 : 1200); else await p.waitForTimeout(600);
    res[k] = await L.E(p, code, M);
  }
  // header collapse on the home list (h-many has a long list): wheel-free direct scroll
  await L.jump(p, code, 'j-many', 1200);
  res.collapse = [];
  for (const y of [0, 24, 48, 72, 96, 140, 400, 96, 0]) {
    const r = await L.E(p, code, "var s = sr.querySelector('[data-scroller=home]'); s.scrollTop = a; s.dispatchEvent(new Event('scroll')); return new Promise(function(res){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ var t = sr.querySelector('.c05-ttl'), P = sr.querySelector('.ju-phone').getBoundingClientRect(), b = t.getBoundingClientRect(), cs = getComputedStyle(t); var sub = sr.querySelector('.c05-roles'); res({ scroll: s.scrollTop, fs: cs.fontSize, cy: Math.round(b.top - P.top + b.height/2), cx: Math.round(b.left - P.left + b.width/2), w: Math.round(b.width), p: getComputedStyle(s).getPropertyValue('--c05-p') || (sr.querySelector('.app') && getComputedStyle(sr.querySelector('.app')).getPropertyValue('--c05-p')), rolesOp: sub ? getComputedStyle(sub).opacity : null }); }); }); });", y);
    res.collapse.push(r); await p.waitForTimeout(150);
  }
  res.errors = errors.slice(0, 5);
  L.fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log('ok'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
