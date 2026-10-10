const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  p.on('pageerror', e => console.log('pageerror:', e.message)); p.on('console', m => console.log('console:', m.type(), m.text().slice(0, 300)));
  await p.goto('file:///home/user/JU/JU-My-Ju-Fable51-10-Concepts.html#concept/C00'); await p.waitForTimeout(1000);
  const info = await p.evaluate(() => {
    const m = window.JUShell.mounts.stage['stage:C00:']; const inst = m.instance; const r = m.root;
    const vals = inst.renderVals(); const keys = Object.keys(vals);
    const btn = [...r.querySelectorAll('.fxrow button')].find(b => b.textContent === '出票');
    const listeners = btn ? Object.keys(btn).filter(k => k.startsWith('_') || k.startsWith('__')) : [];
    const propsKey = btn && Object.keys(btn).find(k => k.startsWith('__preactprops') || k === '__p' || k === '_listeners');
    return { stateKeys: Object.keys(inst.state), fx: inst.state.fx, keys, hasDoPrint: typeof vals.doPrint, fxInfo: vals.fxInfo, btnFound: !!btn, btnKeys: btn ? Object.keys(btn).slice(0, 8) : null, infoText: r.querySelector('.fxinfo') && r.querySelector('.fxinfo').textContent };
  });
  console.log(JSON.stringify(info, null, 1));
  await p.evaluate(() => { const m = window.JUShell.mounts.stage['stage:C00:']; m.instance.renderVals().doPrint(); });
  await p.waitForTimeout(300);
  const after = await p.evaluate(() => { const m = window.JUShell.mounts.stage['stage:C00:']; const tk = m.root.querySelector('.tk'); const cs = getComputedStyle(tk); return { fx: m.instance.state.fx, cls: tk.className, anim: cs.animationName, tf: cs.transform, info: m.root.querySelector('.fxinfo').textContent }; });
  console.log(JSON.stringify(after));
  await b.close();
})();
