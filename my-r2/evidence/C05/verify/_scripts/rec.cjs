// Verifier recorder (scratchpad, not a project tool). Real input + CDP screencast frames, env engine paused unless --live.
// JU_STANDALONE=<build> node rec.cjs <CODE> <outdir> '<steps json>' [--vw 480 --vh 1000] [--live] [--rm] [--cols 6] [--scale 0.5]
// steps: {"jump":k,"after":ms} {"wait":ms} {"eval":js} {"speed":0.5} {"still":label} {"variant":v} {"skin":s}
//        {"rec":label,"do":<step>,"span":ms,"max":n,"probe":true}  <step> = runStep step (click/key/scrollEnd/input/eval)
//        | {"drag":{"from":css,"to":[dx,dy],"steps":10,"every":40,"at":[dx,dy]}} | {"wheel":{"sel":css,"dy":40,"n":10,"every":50}}
const L = require('/home/user/JU/my-r2/tools/_lib.cjs'); const fs = L.fs, path = L.path; const os = require('os');
const [code, outdir, stepsJson] = L.positionals();
const PROBE = "var ph = sr.querySelector('.ju-phone'); var run = function () { return ph.getAnimations({ subtree: true }).filter(function (a) { return a.playState === 'running'; }).length; }; var st = window.__probe = { t0: null, mut: null, anim: null }; var base = run(); var mo = new MutationObserver(function () { if (st.t0 != null && st.mut == null) st.mut = Math.round(performance.now() - st.t0); }); mo.observe(sr, { subtree: true, attributes: true, childList: true, characterData: true }); sr.addEventListener('pointerdown', function () { if (st.t0 != null) return; st.t0 = performance.now(); (function loop() { if (st.anim == null && run() > base) st.anim = Math.round(performance.now() - st.t0); if (performance.now() - st.t0 < 700) requestAnimationFrame(loop); else mo.disconnect(); })(); }, { capture: true }); return base;";
const VPROBE = "var sels = a; var st = window.__vprobe = { t0: null, first: {} }; var props = ['opacity', 'transform', 'clipPath', 'filter', 'backgroundColor', 'color', 'visibility']; function pick(q) { return Array.prototype.slice.call(sr.querySelectorAll(q)).filter(function (e) { var b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; })[0] || null; } var els = sels.map(pick); var snap = function (e) { if (!e) return null; var c = getComputedStyle(e); return props.map(function (k) { return c[k]; }); }; var init = els.map(snap); sr.addEventListener('pointerdown', function () { if (st.t0 != null) return; st.t0 = performance.now(); (function loop() { var t = Math.round(performance.now() - st.t0); els.forEach(function (e, i) { if (!e || st.first[sels[i]]) return; var v = snap(e); for (var k = 0; k < props.length; k++) if (v[k] !== init[i][k]) { st.first[sels[i]] = t + 'ms ' + props[k] + ': ' + String(init[i][k]).slice(0, 40) + ' -> ' + String(v[k]).slice(0, 40); break; } }); if (t < 600) requestAnimationFrame(loop); })(); }, { capture: true }); return els.map(function (e) { return !!e; });";
(async () => {
  const steps = JSON.parse(stepsJson && stepsJson[0] === '@' ? fs.readFileSync(stepsJson.slice(1), 'utf8') : (stepsJson || '[]'));
  fs.rmSync(outdir, { recursive: true, force: true }); fs.mkdirSync(outdir, { recursive: true });
  let waited = 0; while (os.loadavg()[0] >= 8 && waited < 120000) { await new Promise(r => setTimeout(r, 5000)); waited += 5000; }
  let vw = +L.opt('vw', 480), vh = +L.opt('vh', 1000);
  const { b, p, errors } = await L.launch({ viewport: { width: vw, height: vh }, reducedMotion: L.flag('rm') ? 'reduce' : 'no-preference' });
  const log = { code, waitedForLoadMs: waited, loadStart: os.loadavg().map(x => +x.toFixed(2)), live: L.flag('live'), segs: [], issues: [] };
  const ok = await L.openConcept(p, L.fileFor(code), code, 900);
  if (!ok) { console.log(JSON.stringify({ error: 'not mounted', errors })); await b.close(); process.exit(1); }
  const pause = async () => { if (!L.flag('live')) await L.E(p, code, 'var el = (inst.envRef && inst.envRef.current) || sr.querySelector(".ju-env"); if (window.JU && JU.shared && JU.shared.skins && el) JU.shared.skins.pause(el);'); };
  await pause(); await p.waitForTimeout(200);
  let box = await L.phoneRect(p, code);
  const fit = async () => { box = await L.phoneRect(p, code); const w = Math.ceil(box.x + box.w + 16), h = Math.ceil(box.y + box.h + 16); if (w > vw || h > vh) { await p.setViewportSize({ width: Math.max(vw, w), height: Math.max(vh, h) }); await p.waitForTimeout(250); vw = await p.evaluate(() => innerWidth); vh = await p.evaluate(() => innerHeight); box = await L.phoneRect(p, code); } };
  await fit();
  /* the shell page itself must not scroll (wheel chaining past a scroller's end would shift every crop) */
  const lockDoc = async () => { await p.evaluate(() => { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; window.scrollTo(0, 0); }); box = await L.phoneRect(p, code); };
  await lockDoc();
  const cdp = await p.context().newCDPSession(p);
  const frames = [];
  const still = async (label) => { await lockDoc(); const f = path.join(outdir, 'f' + String(frames.length).padStart(3, '0') + '.jpg'); await L.shot(p, box, f, 'jpeg'); frames.push({ f, label }); };
  const doStep = async (st) => {
    if (st.drag) {
      const r = await L.E(p, code, "var e = sr.querySelector(a); if (!e) return null; if (inst && inst.reveal) { try { inst.reveal(e); } catch (x) { } } var b = e.getBoundingClientRect(); return { x: b.left + b.width * 0.5, y: b.top + b.height * 0.5 };", st.drag.from);
      if (!r) return 'drag target missing: ' + st.drag.from;
      const fx = st.drag.at ? r.x + st.drag.at[0] : r.x, fy = st.drag.at ? r.y + st.drag.at[1] : r.y; const n = st.drag.steps || 10;
      await p.mouse.move(fx, fy); await p.mouse.down();
      for (let i = 1; i <= n; i++) { await p.mouse.move(fx + st.drag.to[0] * i / n, fy + st.drag.to[1] * i / n, { steps: 2 }); await p.waitForTimeout(st.drag.every || 40); }
      if (!st.drag.hold) await p.mouse.up(); return '';
    }
    if (st.wheel) {
      const r = await L.E(p, code, "var e = sr.querySelector(a.sel); if (!e) return null; var b = e.getBoundingClientRect(), P = sr.querySelector('.ju-phone').getBoundingClientRect(); return { x: b.left + b.width * 0.5, y: a.py != null ? P.top + a.py : b.top + Math.min(b.height * 0.5, 300) };", { sel: st.wheel.sel, py: st.wheel.py == null ? null : st.wheel.py });
      if (!r) return 'wheel target missing: ' + st.wheel.sel; await p.mouse.move(r.x, r.y);
      for (let i = 0; i < (st.wheel.n || 10); i++) { await p.mouse.wheel(0, st.wheel.dy || 40); await p.waitForTimeout(st.wheel.every || 50); } return '';
    }
    return L.runStep(p, code, st);
  };
  await still('start');
  for (const st of steps) {
    if (st.jump) { await L.jump(p, code, st.jump, st.after || 900); }
    else if (st.variant) { await L.E(p, code, 'inst.loadVariant(a)', st.variant); await p.waitForTimeout(st.after || 700); }
    else if (st.skin) { await L.setSkin(p, code, st.skin); await p.waitForTimeout(800); await pause(); await p.waitForTimeout(200); }
    else if (st.speed) { await L.E(p, code, 'inst.setSpeed(a)', st.speed); }
    else if (st.still) { await still(st.still); }
    else if (st.info) { let v; try { v = await L.E(p, code, st.info); } catch (e) { v = 'ERR ' + e.message; } (log.info = log.info || {})[st.name || ('i' + Object.keys(log.info || {}).length)] = v; }
    else if (st.rec) {
      const span = st.span || 1200, max = st.max || 14; let probe = null;
      await lockDoc(); const boxSeg = Object.assign({}, box);
      if (st.probe) await L.E(p, code, PROBE);
      let vfound = null; if (st.vprobe) vfound = await L.E(p, code, VPROBE, st.vprobe);
      const raw = []; const onFrame = async (ev) => { raw.push({ t: ev.metadata.timestamp, data: ev.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { } };
      cdp.on('Page.screencastFrame', onFrame);
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: 1400, maxHeight: 1400, everyNthFrame: 1 });
      await p.waitForTimeout(80); const t0 = Date.now() / 1000; const issue = await doStep(st.do || {}); if (issue) log.issues.push(st.rec + ': ' + issue);
      await p.waitForTimeout(span);
      try { await cdp.send('Page.stopScreencast'); } catch (e) { } cdp.off('Page.screencastFrame', onFrame);
      if (st.probe) probe = await p.evaluate(() => window.__probe);
      if (st.vprobe) probe = Object.assign({}, probe || {}, { found: vfound, visual: await p.evaluate(() => window.__vprobe.first) });
      const seg = raw.filter(r => r.t >= t0 - 0.05).sort((x, y) => x.t - y.t);
      const keep = seg.length <= max ? seg : Array.from({ length: max }, (_, i) => seg[Math.round(i * (seg.length - 1) / (max - 1))]);
      const tf = seg.length ? seg[0].t : 0;
      for (const r of keep) { const f = path.join(outdir, 'f' + String(frames.length).padStart(3, '0') + '.jpg'); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); frames.push({ f, label: st.rec + ' ' + (seg.indexOf(r) + 1) + '/' + seg.length + ' +' + Math.round((r.t - tf) * 1000), crop: boxSeg }); }
      const after = await p.evaluate(() => window.scrollY); if (after) log.issues.push(st.rec + ': document scrolled ' + after + 'px during the segment');
      log.segs.push({ label: st.rec, painted: seg.length, fps: Math.round(seg.length / span * 1000), probe, load: os.loadavg()[0].toFixed(2) });
      if (!seg.length) await still(st.rec + ' (no paint)');
    }
    else { const issue = await doStep(st); if (issue) log.issues.push(issue); }
  }
  await p.waitForTimeout(250); await still('end');
  const toCrop = frames.filter(x => x.crop).map(x => [x.f, x.crop]);
  if (toCrop.length) { const py = `from PIL import Image\nfor f, box in ${JSON.stringify(toCrop)}:\n    im=Image.open(f)\n    sx=im.width/${vw}; sy=im.height/${vh}\n    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f, quality=85)\n`; fs.writeFileSync(path.join(outdir, 'crop.py'), py); L.execSync(`python3 -I ${path.join(outdir, 'crop.py')}`); fs.unlinkSync(path.join(outdir, 'crop.py')); }
  const cols = +L.opt('cols', 6); const rows = []; for (let i = 0; i < frames.length; i += cols) rows.push(frames.slice(i, i + cols).map(x => x.f));
  const labels = []; for (let i = 0; i < frames.length; i += cols) labels.push(frames.slice(i, i + cols).map(x => x.label));
  try { L.tilePy(outdir, rows, path.join(outdir, 'sheet.png'), { scale: +L.opt('scale', 0.5), gap: 6, labels }); fs.unlinkSync(path.join(outdir, 'tile.py')); } catch (e) { log.issues.push('sheet: ' + e.message.slice(0, 160)); }
  log.loadEnd = os.loadavg().map(x => +x.toFixed(2)); log.frames = frames.map(x => [path.basename(x.f), x.label]); log.errors = errors.slice(0, 10);
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify(log, null, 1));
  console.log(JSON.stringify({ frames: frames.length, segs: log.segs, info: log.info, issues: log.issues, errors: log.errors, load: [log.loadStart[0], log.loadEnd[0]] }));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
