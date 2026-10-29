// Verifier's real-input driver (scratchpad only). Usage:
//   JU_STANDALONE=<file> node drive.cjs <CODE> <outdir> <actions.json|json> [--rm] [--live]
// Every pointer action is a real mouse event at the element centre (Playwright mouse), keys are real key presses, scroll is a real wheel.
// Env engine is paused after mount (and after a skin change) unless --live. Recordings ("rec") use a CDP screencast (real painted frames).
const L = require('/home/user/JU/my-r2/tools/_lib.cjs');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const [CODE, OUT, A] = process.argv.slice(2);
let acts = fs.existsSync(A) ? fs.readFileSync(A, 'utf8') : A; acts = JSON.parse(acts);
const RM = process.argv.includes('--rm'), LIVE = process.argv.includes('--live'); const HI = process.argv.indexOf('--http'); const HTTP = HI > 0 ? process.argv[HI + 1] : '';
const VW = 1000, VH = 1080;
const slug = s => String(s || '').replace(/[^\w一-龥-]+/g, '_').slice(0, 40);
(async () => {
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const loadAt = () => fs.readFileSync('/proc/loadavg', 'utf8').split(' ').slice(0, 3).join(' ');
  const log = { code: CODE, file: L.fileFor(CODE), loadStart: loadAt(), rm: RM, steps: [], recs: [] };
  const { b, p, errors } = await L.launch({ viewport: { width: VW, height: VH }, reducedMotion: RM ? 'reduce' : 'no-preference' });
  let ok;
  if (HTTP) { await p.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:' + HTTP }); await p.goto('http://127.0.0.1:' + HTTP + '/' + path.basename(L.fileFor(CODE)) + '#concept/' + CODE); await p.waitForTimeout(900); try { await p.evaluate(() => document.fonts.ready); } catch (e) { } await p.waitForTimeout(300); ok = await p.evaluate(c => { const g = window.__juStage(c); return !!(g.inst && g.sr && g.sr.querySelector('.ju-phone')); }, CODE); log.http = true; }
  else ok = await L.openConcept(p, L.fileFor(CODE), CODE, 900);
  if (!ok) { console.log('not mounted'); await b.close(); process.exit(1); }
  const E = (js, a) => L.E(p, CODE, js, a);
  const pause = async () => { if (LIVE) return; await p.waitForTimeout(250); await E("var S=JU.shared&&JU.shared.skins; if(S&&inst.envRef&&inst.envRef.current) S.pause(inst.envRef.current);"); };
  await pause();
  const cdp = await p.context().newCDPSession(p);
  let n = 0; const shots = [];
  const phone = () => L.phoneRect(p, CODE);
  const shot = async (name) => { const r = await phone(); const f = path.join(OUT, String(n++).padStart(2, '0') + '-' + slug(name) + '.png'); await L.shot(p, r, f); shots.push({ f, label: String(n - 1).padStart(2, '0') + ' ' + name }); return f; };
  const pick = async (sel, o) => E(L.PICK_JS, { sel, js: false, last: !!(o && o.last) });
  const centre = async (sel, o) => { const r = await pick(sel, o); if (!r || r.x == null) return { miss: r }; return r; };
  const panelBtn = async (text) => E("var bs=[].slice.call(sr.querySelectorAll('.ju-panel button, .ju-panel .ju-idx'));var e=bs.filter(function(x){return x.textContent.trim()===a})[0]||bs.filter(function(x){return x.textContent.indexOf(a)>=0})[0]; if(!e) return null; var r=e.getBoundingClientRect(); if(r.bottom>innerHeight||r.top<0){e.scrollIntoView({block:'center'}); r=e.getBoundingClientRect();} return {x:r.left+r.width/2,y:r.top+r.height/2,t:e.textContent.trim()};", text);
  const focusInfo = async () => E("var ae=sr.activeElement; if(!ae) return null; return (ae.tagName.toLowerCase()+(ae.getAttribute('data-act')?'[data-act='+ae.getAttribute('data-act')+']':'')+(ae.getAttribute('data-rid')?'[rid='+ae.getAttribute('data-rid')+']':'')+' '+(ae.getAttribute('aria-label')||ae.textContent||'').trim().replace(/\\s+/g,' ').slice(0,40)+' @'+(function(){var c=ae.closest('[data-rid]');return c?c.getAttribute('data-rid'):'';})());");
  async function doAct(a) {
    const rec = { a: JSON.stringify(a).slice(0, 160) };
    if (a.click) {
      const r = await centre(a.click, a); if (r.miss !== undefined) { rec.err = 'missing ' + a.click + ' ' + JSON.stringify(r.miss); errors.push(rec.err); return rec; }
      const x = r.x + (a.at ? a.at[0] : 0), y = r.y + (a.at ? a.at[1] : 0); if (r.covered) rec.covered = r.hit;
      await p.mouse.click(x, y); rec.at = [Math.round(x), Math.round(y)];
    } else if (a.panel) {
      const r = await panelBtn(a.panel); if (!r) { rec.err = 'no panel button ' + a.panel; errors.push(rec.err); return rec; }
      await p.mouse.click(r.x, r.y); rec.at = [Math.round(r.x), Math.round(r.y)];
      if (/Cotton|Halo|Sunset|环境/.test(a.panel)) { await p.waitForTimeout(800); await pause(); }
    } else if (a.panelIn) {
      const r = await E("var secs=[].slice.call(sr.querySelectorAll('.ju-panel .ju-panel-sec')); var sec=secs.filter(function(x){return x.textContent.trim()===a[0]})[0]; if(!sec) return null; var row=sec.nextElementSibling; var e=[].slice.call(row.querySelectorAll('button')).filter(function(b){return b.textContent.trim()===a[1]})[0]; if(!e) return null; var q=e.getBoundingClientRect(); if(q.bottom>innerHeight||q.top<0){e.scrollIntoView({block:'center'}); q=e.getBoundingClientRect();} return {x:q.left+q.width/2,y:q.top+q.height/2};", a.panelIn);
      if (!r) { rec.err = 'no panelIn ' + a.panelIn; errors.push(rec.err); return rec; }
      await p.mouse.click(r.x, r.y); rec.at = [Math.round(r.x), Math.round(r.y)];
      if (a.panelIn[0] === '环境') { await p.waitForTimeout(800); await pause(); }
    } else if (a.wheel) {
      const r = await E("var e=sr.querySelector(a); if(!e) return null; var b=e.getBoundingClientRect(); return {x:b.left+b.width/2,y:b.top+Math.min(b.height/2,200)};", a.wheel);
      if (!r) { rec.err = 'no wheel target ' + a.wheel; errors.push(rec.err); return rec; }
      await p.mouse.move(r.x + (a.at ? a.at[0] : 0), r.y + (a.at ? a.at[1] : 0)); const st = a.steps || 6;
      for (let i = 0; i < st; i++) { await p.mouse.wheel(0, a.dy / st); await p.waitForTimeout(a.every || 30); }
    } else if (a.drag) {
      const d = a.drag; const r = await E("var e=sr.querySelector(a); if(!e) return null; var b=e.getBoundingClientRect(); return {x:b.left+b.width/2,y:b.top+b.height/2};", d.from);
      if (!r) { rec.err = 'drag target missing ' + d.from; errors.push(rec.err); return rec; }
      const fx = r.x + (d.at ? d.at[0] : 0), fy = r.y + (d.at ? d.at[1] : 0); await p.mouse.move(fx, fy); await p.mouse.down(); const st = d.steps || 10;
      for (let i = 1; i <= st; i++) { await p.mouse.move(fx + d.to[0] * i / st, fy + d.to[1] * i / st, { steps: 2 }); await p.waitForTimeout(d.every || 40); if (d.shots) await shot((a.name || 'drag') + '-' + i); }
      if (d.holdMs) await p.waitForTimeout(d.holdMs);
      if (!d.hold) await p.mouse.up(); rec.at = [Math.round(fx), Math.round(fy)];
    } else if (a.up) { await p.mouse.up(); }
    else if (a.scrub) {
      const r = await E("var e=sr.querySelector('.ju-scrub input[type=range]'); if(!e) return null; e.scrollIntoView({block:'center'}); var b=e.getBoundingClientRect(); return {l:b.left,w:b.width,y:b.top+b.height/2};");
      if (!r) { rec.err = 'no scrub'; errors.push(rec.err); return rec; }
      const X = v => r.l + 8 + (r.w - 16) * v / 100; const [v0, v1] = a.scrub; const st = a.steps || 6;
      await p.mouse.move(X(v0), r.y); await p.mouse.down(); if (a.shots) await shot('scrub-' + v0);
      for (let i = 1; i <= st; i++) { const v = v0 + (v1 - v0) * i / st; await p.mouse.move(X(v), r.y, { steps: 2 }); await p.waitForTimeout(a.every || 120); if (a.shots) await shot('scrub-' + Math.round(v)); }
      if (!a.hold) await p.mouse.up();
    } else if (a.key) {
      if (a.focus) { const okf = await E("var e=sr.querySelector(a); if(!e) return false; e.focus(); return true;", a.focus); if (!okf) { rec.err = 'focus missing ' + a.focus; errors.push(rec.err); } }
      for (let i = 0; i < (a.times || 1); i++) { await p.keyboard.press(a.key); await p.waitForTimeout(a.gap || 60); }
      rec.focus = await focusInfo();
    } else if (a.tabTo) {
      let hit = false; for (let i = 0; i < (a.max || 30); i++) { await p.keyboard.press(a.shift ? 'Shift+Tab' : 'Tab'); await p.waitForTimeout(50); hit = await E("var ae=sr.activeElement; return !!(ae && ae.matches(a));", a.tabTo); if (hit) { rec.tabs = i + 1; break; } }
      rec.focus = await focusInfo(); if (!hit) { rec.err = 'tabTo not reached ' + a.tabTo; errors.push(rec.err); }
    } else if (a.type) { await p.keyboard.type(a.type, { delay: 30 }); }
    else if (a.fill) { // real typing into a field: click it, select all, type
      const r = await centre(a.fill.sel); if (r.miss !== undefined) { rec.err = 'fill missing ' + a.fill.sel; errors.push(rec.err); return rec; }
      await p.mouse.click(r.x, r.y); await p.keyboard.press('Control+A'); await p.keyboard.type(a.fill.value, { delay: 20 });
    } else if (a.wait) { await p.waitForTimeout(a.wait); }
    else if (a.speed) { await E('inst.setSpeed(a)', a.speed); }
    else if (a.variant) { await E('inst.loadVariant(a)', a.variant); await p.waitForTimeout(600); }
    else if (a.size) { await E('inst.setPhoneSize(a[0],a[1])', a.size); await p.waitForTimeout(500); }
    else if (a.jump) { await L.jump(p, CODE, a.jump, 700); }
    else if (a.eval) { rec.val = await E(a.eval); }
    else if (a.pause) { await pause(); }
    else if (a.focusinfo) { rec.focus = await focusInfo(); }
    else if (a.shot) { }
    else { rec.err = 'unknown'; }
    return rec;
  }
  for (const a of acts) {
    if (a.rec) {
      const span = a.span || 1400, max = a.max || 18; const raw = [];
      const onFrame = async (ev) => { raw.push({ t: ev.metadata.timestamp, data: ev.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { } };
      cdp.on('Page.screencastFrame', onFrame);
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: VW, maxHeight: VH, everyNthFrame: 1 });
      await p.waitForTimeout(120); const t0 = Date.now() / 1000; const ldr = loadAt();
      const rr = a.do ? await doAct(a.do) : {}; if (a.then) for (const t of a.then) { const tr = await doAct(t); tr.inRec = a.rec; log.steps.push(tr); }
      await p.waitForTimeout(span);
      try { await cdp.send('Page.stopScreencast'); } catch (e) { } cdp.off('Page.screencastFrame', onFrame);
      const seg = raw.filter(r => r.t >= t0 - 0.05).sort((x, y) => x.t - y.t);
      const keep = seg.length <= max ? seg : Array.from({ length: max }, (_, i) => seg[Math.round(i * (seg.length - 1) / (max - 1))]);
      const box = await phone(); const files = []; const labels = []; const tf = seg.length ? seg[0].t : 0;
      keep.forEach((r, i) => { const f = path.join(OUT, 'r-' + slug(a.rec) + '-' + String(i).padStart(2, '0') + '.jpg'); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); files.push(f); labels.push(a.rec + ' ' + (seg.indexOf(r) + 1) + '/' + seg.length + ' +' + Math.round((r.t - tf) * 1000) + 'ms'); });
      if (files.length) { const py = `from PIL import Image\nbox=${JSON.stringify(box)}\nfor f in ${JSON.stringify(files)}:\n    im=Image.open(f)\n    sx=im.width/${VW}; sy=im.height/${VH}\n    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)\n`; fs.writeFileSync(path.join(OUT, '_crop.py'), py); execSync('python3 -I ' + path.join(OUT, '_crop.py')); fs.unlinkSync(path.join(OUT, '_crop.py')); }
      const rows = []; const lrows = []; const per = a.cols || 6; for (let i = 0; i < files.length; i += per) { rows.push(files.slice(i, i + per)); lrows.push(labels.slice(i, i + per)); }
      if (rows.length) { L.tilePy(OUT, rows, path.join(OUT, 'sheet-' + slug(a.rec) + '.png'), { scale: a.scale || 0.42, gap: 6, labels: lrows }); try { fs.unlinkSync(path.join(OUT, 'tile.py')); } catch (e) { } }
      log.recs.push({ rec: a.rec, load: ldr, painted: seg.length, kept: files.length, fps: Math.round(seg.length / ((span + 0) / 1000)), act: rr, sheet: 'sheet-' + slug(a.rec) + '.png' });
      if (a.shotAfter) await shot(a.rec + '-end');
      continue;
    }
    const rr = await doAct(a); log.steps.push(rr);
    if (a.after) await p.waitForTimeout(a.after); else if (a.click || a.panel || a.key) await p.waitForTimeout(80);
    if (a.name && !a.noshot) await shot(a.name);
  }
  // contact sheet of all still shots
  if (shots.length) { const rows = []; const lr = []; for (let i = 0; i < shots.length; i += 6) { rows.push(shots.slice(i, i + 6).map(s => s.f)); lr.push(shots.slice(i, i + 6).map(s => s.label)); } L.tilePy(OUT, rows, path.join(OUT, 'sheet.png'), { scale: 0.42, gap: 6, labels: lr }); try { fs.unlinkSync(path.join(OUT, 'tile.py')); } catch (e) { } }
  log.errors = errors; log.loadEnd = loadAt();
  fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify(log, null, 1));
  console.log(JSON.stringify({ shots: shots.length, recs: log.recs.map(r => r.rec + ':' + r.painted + '/' + r.kept + '@' + r.load.split(' ')[0]), errors: errors.slice(0, 8), steps: log.steps.filter(s => s.err || s.covered || s.val !== undefined || s.focus).slice(0, 60).map(s => (s.inRec ? '[' + s.inRec + '] ' : '') + (s.err ? 'ERR ' + s.err : '') + (s.covered ? ' COVERED by ' + s.covered + ' ' + s.a : '') + (s.val !== undefined ? ' = ' + JSON.stringify(s.val) : '') + (s.focus ? ' focus=' + s.focus : '')) }, null, 0));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
