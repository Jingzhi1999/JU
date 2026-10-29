const L = require('/home/user/JU/my-r2/tools/_lib.cjs');
(async () => {
  const { b, p } = await L.launch({ viewport: { width: 480, height: 1150 } });
  await L.openConcept(p, L.fileFor('C05'), 'C05', 900);
  await L.E(p, 'C05', 'JU.shared.skins.pause(inst.envRef.current)');
  await p.evaluate(() => { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; window.scrollTo(0, 0); });
  const ph = await L.phoneRect(p, 'C05');
  for (const py of [90, 160, 300, 404, 480, 600, 700]) {
    await L.E(p, 'C05', "var s = sr.querySelector('[data-scroller=home]'); s.scrollTop = 0; s.dispatchEvent(new Event('scroll'));"); await p.waitForTimeout(250);
    const x = ph.x + 120, y = ph.y + py;
    const hit = await L.E(p, 'C05', "var e = sr.elementFromPoint(a.x, a.y); var s = sr.querySelector('[data-scroller=home]'); return e ? (e.tagName + '.' + String(e.className).trim().split(/\\s+/).slice(0,2).join('.') + (s.contains(e) ? ' [in scroller]' : ' [outside]')) : null;", { x, y });
    await p.mouse.move(x, y); for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(60); } await p.waitForTimeout(300);
    const st = await L.E(p, 'C05', "return sr.querySelector('[data-scroller=home]').scrollTop;");
    console.log('phone-y', py, hit, 'scrollTop after wheel', st);
  }
  // touch-like drag on the face (pointer drag) to see if the paper follows
  await b.close();
})();
