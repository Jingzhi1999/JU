// Rendered-pixel contrast capture: node ctr.cjs <outdir> '[["cotton","j-home"],...]'
// For each state: shot A (as rendered, env paused) + shot B (same frame, every glyph made transparent) + the text line boxes.
// ctr.py then takes the glyph colour from A and the real backdrop from B inside each line box.
const L = require('/home/user/JU/my-r2/tools/_lib.cjs'); const fs = require('fs'); const path = require('path');
const COLLECT = `
var ph = sr.querySelector('.ju-phone'); var pr = ph.getBoundingClientRect(); var out = [];
var w = document.createTreeWalker(ph, NodeFilter.SHOW_TEXT); var n;
function eff(el){ var o = 1; for (var e = el; e && e !== ph.parentNode; e = e.parentElement || (e.getRootNode && e.getRootNode().host)) { var cs = getComputedStyle(e); if (cs.display === 'none') return 0; o *= parseFloat(cs.opacity); } return o; }
while ((n = w.nextNode())) {
  var t = n.textContent.replace(/\\s+/g, ' ').trim(); if (!t) continue;
  var el = n.parentElement; if (!el) continue; var cs = getComputedStyle(el);
  if (cs.visibility !== 'visible') continue; var o = eff(el); if (o < 0.05) continue;
  if (el.closest('.c09-probe,[data-raster="skip"],script,style')) continue;
  var r = document.createRange(); r.selectNodeContents(n); var rs = r.getClientRects();
  for (var i = 0; i < rs.length; i++) { var b = rs[i]; if (b.width < 3 || b.height < 6) continue;
    if (b.bottom <= pr.top || b.top >= pr.bottom || b.right <= pr.left || b.left >= pr.right) continue;
    var tag = el.closest('.ju-btn-replay,.ju-panel,[class*="ju-panel"]') ? 'panel' : el.closest('.ju-ticket,.c09-cface') ? 'original' : el.closest('.ju-v27-cta') ? 'cta' : el.closest('[aria-disabled="true"],:disabled') ? 'disabled' : '';
    var cls = []; for (var e = el; e && e !== ph && cls.length < 3; e = e.parentElement) if (e.className && typeof e.className === 'string') cls.push(e.className.split(' ')[0]);
    out.push({ t: t.slice(0, 28), fs: parseFloat(cs.fontSize), fw: cs.fontWeight, color: cs.color, op: Math.round(o * 100) / 100, tag: tag, cls: cls.join('<'), x: b.left - pr.left, y: b.top - pr.top, w: b.width, h: b.height });
  }
}
var occ = pr.height; var nav = ph.querySelector('.c09-nav'); if (nav) { var nb = nav.getBoundingClientRect(); if (nb.top < pr.bottom - 2) occ = Math.min(occ, nb.top - pr.top - 30); }
var feet = ph.querySelectorAll('.c09-pg.is-top .c09-foot'); for (var k = 0; k < feet.length; k++) { var fb = feet[k].getBoundingClientRect(); if (fb.height > 0 && feet[k].children.length) occ = Math.min(occ, fb.top - pr.top); }
return { w: pr.width, h: pr.height, occ: occ, items: out };`;
const HIDE = `var s = document.createElement('style'); s.id = 'ctrhide'; s.textContent = '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;transition-property:none!important;caret-color:transparent!important;text-decoration-color:transparent!important}'; sr.appendChild(s); return true;`;
const UNHIDE = `var s = sr.getElementById ? sr.getElementById('ctrhide') : sr.querySelector('#ctrhide'); if (s) s.remove(); return true;`;
(async () => {
  const [outdir, listJson] = process.argv.slice(2); fs.mkdirSync(outdir, { recursive: true });
  const list = JSON.parse(listJson);
  const { b, p, errors } = await L.launch({ viewport: { width: 1000, height: 1000 }, dsf: 2 });
  await p.goto('file:///home/user/JU/.build/C09.html#concept/C09'); await p.waitForTimeout(900); try { await p.evaluate(() => document.fonts.ready); } catch (e) { }
  const E = (js, a) => L.E(p, 'C09', js, a);
  const pause = () => E('var S = JU.shared && JU.shared.skins; if (S && inst.envRef.current) S.pause(inst.envRef.current); return true;');
  const idle = async () => { for (let i = 0; i < 100; i++) { if (await E('return inst.state.nav.phase') === 'idle') return; await p.waitForTimeout(50); } };
  let skinNow = '';
  for (const [skin, key, scroll] of list) {
    if (skin !== skinNow) { await L.setSkin(p, 'C09', skin); await p.waitForTimeout(800); await pause(); skinNow = skin; }
    await E('inst.jumpTo(a)', key); await p.waitForTimeout(450); await idle(); await p.waitForTimeout(700); await pause();
    if (scroll) { await E("var sc = sr.querySelector('.c09-pg.is-top [data-scroller]') || sr.querySelector('[data-scroller]'); sc.scrollTop = a; sc.dispatchEvent(new Event('scroll')); return true;", scroll); await p.waitForTimeout(500); }
    await p.waitForTimeout(250);
    const phone = await L.phoneRect(p, 'C09'); const data = await E(COLLECT);
    const base = path.join(outdir, skin + '-' + key + (scroll ? '-s' + scroll : ''));
    await L.shot(p, phone, base + '-a.png');
    await E(HIDE); await p.waitForTimeout(150);
    await L.shot(p, phone, base + '-b.png');
    await E(UNHIDE); await p.waitForTimeout(100);
    fs.writeFileSync(base + '.json', JSON.stringify(data));
    console.log(base, data.items.length);
  }
  console.log(JSON.stringify({ errors }));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
