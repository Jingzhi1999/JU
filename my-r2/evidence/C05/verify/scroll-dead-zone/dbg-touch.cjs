const { chromium } = require('/opt/node-tools/node_modules/playwright'); const L = require('/home/user/JU/my-r2/tools/_lib.cjs');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 480, height: 1150 }, hasTouch: true });
  await ctx.addInitScript('window.__juStage = ' + function (c) { var m = window.JUShell && window.JUShell.mounts.stage['stage:' + c + ':']; var h = document.querySelector('.stage-host[data-code="' + c + '"]'); return { m: m, inst: m && m.instance, root: m && m.root, sr: h && h.shadowRoot, host: h }; }.toString() + ';');
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
  await L.openConcept(p, L.fileFor('C05'), 'C05', 900);
  await L.E(p, 'C05', 'JU.shared.skins.pause(inst.envRef.current)');
  await p.evaluate(() => { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; window.scrollTo(0, 0); });
  const swipe = async (x, y, dy) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - dy * i / 12 }] }); await p.waitForTimeout(16); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(700); };
  for (const [state, sc] of [['j-home', 'home'], ['j-d-gathering', 'detail'], ['h-m-review', 'manage']]) {
    if (state !== 'j-home') await L.jump(p, 'C05', state, 1200);
    const ph = await L.phoneRect(p, 'C05');
    for (const py of [300, 420, 650]) {
      await L.E(p, 'C05', "sr.querySelectorAll('[data-scroller]').forEach(function (s) { s.scrollTop = 0; });"); await p.waitForTimeout(300);
      await swipe(ph.x + 120, ph.y + py, 220);
      const st = await L.E(p, 'C05', "var o = {}; sr.querySelectorAll('[data-scroller]').forEach(function (s) { if (s.scrollTop) o[s.getAttribute('data-scroller')] = Math.round(s.scrollTop); }); return o;");
      console.log(state, 'touch swipe from phone-y', py, '→', JSON.stringify(st));
    }
  }
  await b.close();
})();
