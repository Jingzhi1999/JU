// Evidence capture for a concept inside the standalone canvas.
// node tools/capture.cjs <CODE> <outdir> '<json actions>' [--w 1000] [--h 1000] [--clip x,y,w,h] [--cols 6] [--scale 300]
// actions: [{"click":"css inside shadow root"},{"wait":400},{"shots":5,"every":250},{"jump":"state-key"},{"drag":{"from":"css","to":[dx,dy],"steps":8,"shots":true}},{"eval":"js using root, inst"},{"speed":0.5},{"shot":true},{"fontwait":true}]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { execSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const [code, outdir, actionsJson] = process.argv.slice(2);
const opt = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
(async () => {
  const actions = JSON.parse(actionsJson || '[]');
  fs.rmSync(outdir, { recursive: true, force: true }); fs.mkdirSync(outdir, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +opt('w', 1000), height: +opt('h', 1000) } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '..', 'JU-My-Ju-Fable51-10-Concepts.html') + '#concept/' + code);
  await p.waitForTimeout(600); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  const clipS = opt('clip', ''); const clip = clipS ? (() => { const [x, y, w, h] = clipS.split(',').map(Number); return { x, y, w, h }; })() : null;
  // default clip = the phone frame of the active stage
  const phone = clip || await p.evaluate(c => { const h = document.querySelector('.stage-host[data-code="' + c + '"]'); const ph = h.shadowRoot.querySelector('.ju-phone'); const r = ph.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, code);
  let n = 0; const shot = async () => { await p.screenshot({ path: `${outdir}/f${String(n++).padStart(2, '0')}.png`, clip: { x: phone.x, y: phone.y, width: phone.w, height: phone.h } }); };
  const root = (sel) => p.evaluateHandle(([c, s]) => { const h = document.querySelector('.stage-host[data-code="' + c + '"]'); return s ? h.shadowRoot.querySelector(s) : h.shadowRoot; }, [code, sel]);
  const inst = () => p.evaluate(c => { const m = Object.values(window.JUShell.mounts.stage).find(m => m.parsed && m.root.closest && true); return !!m; }, code);
  await shot();
  for (const a of actions) {
    if (a.click) { const el = await root(a.click); const ok = await el.evaluate(e => { if (!e) return false; e.scrollIntoView({ block: 'nearest' }); e.click(); return true; }); if (!ok) errors.push('click target missing: ' + a.click); await p.waitForTimeout(a.after || 60); if (a.shot !== false) await shot(); }
    else if (a.wait) { await p.waitForTimeout(a.wait); if (a.shot) await shot(); }
    else if (a.shots) { for (let i = 0; i < a.shots; i++) { await p.waitForTimeout(a.every || 250); await shot(); } }
    else if (a.jump) { await p.evaluate(([c, k]) => { const m = window.JUShell.mounts.stage['stage:' + c + ':']; m.instance.jumpTo(k); }, [code, a.jump]); await p.waitForTimeout(a.after || 500); await shot(); }
    else if (a.speed) { await p.evaluate(([c, k]) => { window.JUShell.mounts.stage['stage:' + c + ':'].instance.setSpeed(k); }, [code, a.speed]); }
    else if (a.eval) { await p.evaluate(([c, js]) => { const m = window.JUShell.mounts.stage['stage:' + c + ':']; const root = m.root, inst = m.instance; new Function('root', 'inst', js)(root, inst); }, [code, a.eval]); await p.waitForTimeout(a.after || 100); if (a.shot) await shot(); }
    else if (a.drag) { const el = await root(a.drag.from); const r = await el.evaluate(e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width * 0.5, y: b.top + b.height * 0.5 }; }); const fx = a.drag.at ? r.x + a.drag.at[0] : r.x, fy = a.drag.at ? r.y + a.drag.at[1] : r.y; await p.mouse.move(fx, fy); await p.mouse.down(); const steps = a.drag.steps || 8; for (let i = 1; i <= steps; i++) { await p.mouse.move(fx + a.drag.to[0] * i / steps, fy + a.drag.to[1] * i / steps, { steps: 2 }); await p.waitForTimeout(a.drag.every || 60); if (a.drag.shots) await shot(); } if (!a.drag.hold) await p.mouse.up(); await p.waitForTimeout(a.after || 300); await shot(); }
    else if (a.scroll) { const el = await root(a.scroll); await el.evaluate((e, y) => { e.scrollTop = y; }, a.to || 0); await p.waitForTimeout(a.after || 300); await shot(); }
    else if (a.shot) { await shot(); }
  }
  const cols = +opt('cols', 6); const rows = Math.ceil(n / cols);
  execSync(`ffmpeg -y -loglevel error -framerate 1 -pattern_type glob -i '${outdir}/f*.png' -vf "scale=${opt('scale', 300)}:-1,tile=${cols}x${rows}:padding=4:margin=4:color=white" '${outdir}/sheet.png'`);
  fs.writeFileSync(`${outdir}/log.json`, JSON.stringify({ code, frames: n, errors }, null, 1));
  console.log(JSON.stringify({ frames: n, errors, sheet: `${outdir}/sheet.png` }));
  await b.close();
})();
