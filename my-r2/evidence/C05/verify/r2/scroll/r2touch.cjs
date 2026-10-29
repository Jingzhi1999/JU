// Verifier round 2: does a vertical swipe / wheel that starts on the face or the card scroll the page, and do taps still work?
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const L = require('/home/user/JU/my-r2/tools/_lib.cjs'); const os = require('os');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 480, height: 1150 }, hasTouch: true });
  await ctx.addInitScript('window.__juStage = ' + function (c) { var m = window.JUShell && window.JUShell.mounts.stage['stage:' + c + ':']; var h = document.querySelector('.stage-host[data-code="' + c + '"]'); return { m: m, inst: m && m.instance, root: m && m.root, sr: h && h.shadowRoot, host: h }; }.toString() + ';');
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); const out = [];
  out.push('# load ' + os.loadavg()[0].toFixed(2) + ' · ' + new Date().toISOString());
  await L.openConcept(p, '/home/user/JU/.build/verify-C05.html', 'C05', 1200);
  await L.E(p, 'C05', 'JU.shared.skins.pause(inst.envRef.current)');
  await p.evaluate(() => { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; window.scrollTo(0, 0); });
  const reset = () => L.E(p, 'C05', "sr.querySelectorAll('[data-scroller]').forEach(function (s) { s.scrollTop = 0; s.dispatchEvent(new Event('scroll')); });");
  const st = () => L.E(p, 'C05', "var o = {}; sr.querySelectorAll('[data-scroller]').forEach(function (s) { if (s.scrollTop) o[s.getAttribute('data-scroller')] = Math.round(s.scrollTop); }); return JSON.stringify(o);");
  const swipe = async (x, y, dy) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - dy * i / 12 }] }); await p.waitForTimeout(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(700); };
  const wheel = async (x, y) => { await p.mouse.move(x, y); for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(60); } await p.waitForTimeout(400); };
  const hitAt = (x, y) => L.E(p, 'C05', "var e = sr.elementFromPoint(a.x, a.y); return e ? e.tagName + '.' + String(e.className).trim().split(/\\s+/).slice(0, 2).join('.') : null;", { x, y });
  const probe = async (label) => {
    const ph = await L.phoneRect(p, 'C05');
    const card = await L.E(p, 'C05', "var c = Array.prototype.slice.call(sr.querySelectorAll('.c05-card')).filter(function (e) { var b = e.getBoundingClientRect(); return b.width > 50 && b.height > 50; })[0]; if (!c) return null; var b = c.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 };");
    const pts = [['face y=300 (time column)', ph.x + 70, ph.y + 300], ['face y=420 (title)', ph.x + 150, ph.y + 420]];
    if (card) pts.push(['on card', card.x, card.y]);
    pts.push(['paper y=700', ph.x + 150, ph.y + 700]);
    for (const [name, x, y] of pts) {
      await reset(); await p.waitForTimeout(300); const h = await hitAt(x, y); await swipe(x, y, 220); const s1 = await st();
      await reset(); await p.waitForTimeout(300); await wheel(x, y); const s2 = await st();
      out.push(`${label} · ${name} [hit ${h}] → touch ${s1} · wheel ${s2}`);
    }
    await reset(); await p.waitForTimeout(400);
  };
  await probe('j-home');
  // taps still work on the face: CTA → read layer; back
  let r = await L.clickSel(p, 'C05', '.c05-zb [data-act=cta]'); await p.waitForTimeout(1200);
  out.push('tap face CTA → top surface: ' + await L.E(p, 'C05', "return inst.state.nav.stack.map(function (x) { return x.s; }).join('>');"));
  await L.clickSel(p, 'C05', '[data-surface=read] [data-act=back]'); await p.waitForTimeout(1200); await L.clickSel(p, 'C05', '[data-surface=detail] [data-act=back]'); await p.waitForTimeout(1200);
  // tap on the card (home)
  const cardHome = await L.E(p, 'C05', "var c = Array.prototype.slice.call(sr.querySelectorAll('[data-surface=home] .c05-card, .c05-card')).filter(function (e) { var b = e.getBoundingClientRect(); return b.width > 50; })[0]; if (!c) return null; var b = c.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 };");
  if (cardHome) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [cardHome] }); await p.waitForTimeout(60); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1300); }
  out.push('tap card on home → stack: ' + await L.E(p, 'C05', "return inst.state.nav.stack.map(function (x) { return x.s; }).join('>') + (inst.state.sheet ? ' sheet=' + inst.state.sheet.kind : '');"));
  await L.E(p, 'C05', 'if (inst.state.sheet) inst._c && inst._c.sheet && inst._c.sheet.cancel && inst._c.sheet.cancel();'); await p.waitForTimeout(600);
  while (await L.E(p, 'C05', 'return inst.state.nav.stack.length > 1;')) { await L.clickSel(p, 'C05', '[data-act=back]'); await p.waitForTimeout(1100); }
  // detail (real click on a row) and manage (real click)
  await L.clickSel(p, 'C05', '[data-scroller=home] [data-rid=dimsum]'); await p.waitForTimeout(1300); await probe('j-d-gathering (row click)');
  await L.clickSel(p, 'C05', '[data-surface=detail] [data-act=back]'); await p.waitForTimeout(1300);
  await L.clickSel(p, 'C05', '[data-role-tab=hosted]'); await p.waitForTimeout(1000);
  await L.clickSel(p, 'C05', '.c05-zb [data-act=cta]'); await p.waitForTimeout(1300); await probe('h-m-review (CTA)');
  // tap on the manage card → card sheet
  const cardM = await L.E(p, 'C05', "var c = Array.prototype.slice.call(sr.querySelectorAll('[data-surface=manage] .c05-card, .c05-card')).filter(function (e) { var b = e.getBoundingClientRect(); return b.width > 50; })[0]; if (!c) return null; var b = c.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 };");
  if (cardM) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [cardM] }); await p.waitForTimeout(60); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1300); }
  out.push('tap card on manage → sheet: ' + await L.E(p, 'C05', "return inst.state.sheet ? inst.state.sheet.kind : 'none';"));
  console.log(out.join('\n')); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
