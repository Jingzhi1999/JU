// Evidence capture for a concept inside the standalone canvas (my-r2).
// node my-r2/tools/capture.cjs <CODE> <outdir> '<json actions>' [--w 1000] [--h 1000] [--clip x,y,w,h] [--cols 6] [--scale 300]
// env JU_STANDALONE=<path> targets a private build (see my-r2/src/build.js); otherwise the deliverable JU-MY-R2-TEN-DIRECTIONS.html.
// Output: outdir/f00.png … (each frame = the phone only), outdir/sheet.png (contact sheet), outdir/log.json ({frames, errors}).
// Tips: screenshots cost ~150ms each, so use {"speed":0.5} rather than tiny "every"; clip-path'd drag targets only receive pointer
// events inside their polygon → use "at":[dx,dy] from the element centre; prefer overlay-scoped selectors (".c03-over [data-act=ok]")
// — several matches resolve to the one inside an overlay (.cNN-over), else the first visible one ("last":true takes the last).
// actions (JSON array):
//   {"click":"css inside the shadow root"}        real pointer click at the element centre (add "js":true for a synthetic click, "after":ms, "shot":false)
//   {"key":"Enter","focus":"css","times":1}       keyboard: optionally focus an element in the shadow root first, then press the key (Tab / Escape / Enter / Space …)
//   {"drag":{"from":"css","to":[dx,dy],"steps":8,"shots":true,"hold":false,"at":[dx,dy]}}   pointer drag (tear surfaces: touch-action:none)
//   {"jump":"j-d-tear"}                           review index jump (JU.INDEX key)       {"flow":"tear-contact-copy"}  run a flow from tools/flows.json
//   {"wait":400}  {"wait":400,"shot":true}  {"shots":5,"every":250}  {"shot":true}  {"fontwait":true}
//   {"speed":0.5}  {"rm":true}  {"kb":true}  {"safe":true}  {"zoom":true}  {"size":[360,780]}  {"variant":"long"}  {"skin":"halo"}
//   {"clock":"+5m" | "+1h" | "+24h" | "due" | 3600000}   advance the review clock (JU.advance via inst.advanceClock; "due" = to the nearest expiry)
//   {"scroll":"css","to":120}  {"input":{"sel":"[data-field=text]","value":"…"}}  {"eval":"js using root, inst, sr"}
//   {"expect":"js returning true","name":"…"}     failed expectations are listed in errors
const L = require('./_lib.cjs'); const fs = L.fs, path = L.path;
const [code, outdir, actionsJson] = L.positionals();
if (!code || !outdir) { console.error('usage: node my-r2/tools/capture.cjs <CODE> <outdir> \'<json actions>\''); process.exit(2); }
(async () => {
  const actions = JSON.parse(actionsJson || '[]');
  fs.rmSync(outdir, { recursive: true, force: true }); fs.mkdirSync(outdir, { recursive: true });
  const { b, p, errors } = await L.launch({ viewport: { width: +L.opt('w', 1000), height: +L.opt('h', 1000) } });
  const ok = await L.openConcept(p, L.fileFor(code), code);
  if (!ok) { console.log(JSON.stringify({ frames: 0, errors: ['concept not mounted: ' + code].concat(errors) })); await b.close(); process.exit(1); }
  const clipS = L.opt('clip', ''); const clip = clipS ? (() => { const [x, y, w, h] = clipS.split(',').map(Number); return { x, y, w, h }; })() : null;
  let phone = clip || await L.phoneRect(p, code);   // default clip = the phone frame of the active stage (re-read after a size change)
  let n = 0; const shot = async () => { await L.shot(p, phone, `${outdir}/f${String(n++).padStart(2, '0')}.png`); };
  const flows = L.loadFlows();
  const parseClock = (v) => { if (typeof v === 'number') return v; const m = /^\+?(\d+)\s*(m|h|d)$/.exec(String(v)); return m ? +m[1] * { m: 60000, h: 3600000, d: 86400000 }[m[2]] : v; };
  await shot();
  for (const a of actions) {
    if (a.click) { const r = await L.clickSel(p, code, a.click, a); const issue = L.clickIssue(r, a.click); if (issue) errors.push(issue); await p.waitForTimeout(a.after || 60); if (a.shot !== false) await shot(); }
    else if (a.key) { const issue = await L.runStep(p, code, a); if (issue) errors.push(issue); if (a.shot !== false) await shot(); }
    else if (a.wait) { await p.waitForTimeout(a.wait); if (a.shot) await shot(); }
    else if (a.shots) { for (let i = 0; i < a.shots; i++) { await p.waitForTimeout(a.every || 250); await shot(); } }
    else if (a.jump) { await L.jump(p, code, a.jump, a.after || 500); if (a.shot !== false) await shot(); }
    else if (a.flow) { const f = flows[a.flow]; if (!f) { errors.push('unknown flow: ' + a.flow); continue; } if (f.jump) await L.jump(p, code, f.jump, 500); await shot(); for (const st of f.steps) { const issue = await L.runStep(p, code, st); if (issue) errors.push('[' + a.flow + '] ' + issue); if (st.click || st.key || st.input) await shot(); } }
    else if (a.speed) { await L.E(p, code, 'inst.setSpeed(a)', a.speed); }
    else if (a.rm !== undefined) { await L.E(p, code, "if (inst.setReview) inst.setReview({ rm: !!a }); else if (!!inst.state.review.rm !== !!a && inst.toggleRM) inst.toggleRM();", a.rm); await p.waitForTimeout(100); }
    else if (a.kb !== undefined || a.safe !== undefined || a.zoom !== undefined) { const k = a.kb !== undefined ? 'kb' : a.safe !== undefined ? 'safe' : 'zoom'; const r = await L.setToggle(p, code, k, a[k]); if (r !== 'ok') errors.push(k + ': ' + r); await p.waitForTimeout(a.after || 400); phone = clip || await L.phoneRect(p, code); if (a.shot !== false) await shot(); }
    else if (a.size) { await L.E(p, code, 'inst.setPhoneSize(a[0], a[1])', a.size); await p.waitForTimeout(a.after || 400); phone = clip || await L.phoneRect(p, code); if (a.shot !== false) await shot(); }
    else if (a.variant) { await L.E(p, code, 'inst.loadVariant(a)', a.variant); await p.waitForTimeout(a.after || 500); if (a.shot !== false) await shot(); }
    else if (a.skin) { const r = await L.setSkin(p, code, a.skin); if (r === 'no skin api') errors.push('skin: no api on the instance'); await p.waitForTimeout(a.after || 400); if (a.shot !== false) await shot(); }
    else if (a.clock !== undefined) { const v = parseClock(a.clock); const r = await L.E(p, code, "var v = a; if (v === 'due') { if (inst.toNextDeadline) { inst.toNextDeadline(); return 'toNextDeadline'; } if (inst.advanceToDue) { inst.advanceToDue(); return 'advanceToDue'; } var d = window.JU && JU.nextDeadline ? JU.nextDeadline(inst.state.data) : null; if (!d) return 'no deadline'; v = Math.max(0, d - JU.now()) + 1000; } if (inst.advanceClock) { inst.advanceClock(v); return 'advanceClock'; } if (window.JU && JU.advance) { JU.advance(v); inst.forceUpdate && inst.forceUpdate(); return 'JU.advance'; } return 'no clock api';", v); if (/^no /.test(r)) errors.push('clock: ' + r); await p.waitForTimeout(a.after || 500); if (a.shot !== false) await shot(); }
    else if (a.eval) { await L.E(p, code, a.eval); await p.waitForTimeout(a.after || 100); if (a.shot) await shot(); }
    else if (a.input) { const issue = await L.runStep(p, code, a); if (issue) errors.push(issue); if (a.shot) await shot(); }
    else if (a.expect) { const issue = await L.runStep(p, code, a); if (issue) errors.push(issue); }
    else if (a.drag) {
      const r = await L.E(p, code, "var e = sr.querySelector(a); if (!e) return null; if (inst && inst.reveal) { try { inst.reveal(e); } catch (x) { } } var b = e.getBoundingClientRect(); return { x: b.left + b.width * 0.5, y: b.top + b.height * 0.5 };", a.drag.from);
      if (!r) { errors.push('drag target missing: ' + a.drag.from); continue; } await p.waitForTimeout(120);
      const fx = a.drag.at ? r.x + a.drag.at[0] : r.x, fy = a.drag.at ? r.y + a.drag.at[1] : r.y;
      await p.mouse.move(fx, fy); await p.mouse.down(); const steps = a.drag.steps || 8;
      for (let i = 1; i <= steps; i++) { await p.mouse.move(fx + a.drag.to[0] * i / steps, fy + a.drag.to[1] * i / steps, { steps: 2 }); await p.waitForTimeout(a.drag.every || 60); if (a.drag.shots) await shot(); }
      if (!a.drag.hold) await p.mouse.up(); await p.waitForTimeout(a.after || 300); await shot();
    }
    else if (a.scroll) { const ok = await L.E(p, code, "var e = sr.querySelector(a.sel); if (!e) return false; e.scrollTop = a.to; e.dispatchEvent(new Event('scroll', { bubbles: true })); return true;", { sel: a.scroll, to: a.to || 0 }); if (!ok) errors.push('scroll target missing: ' + a.scroll); await p.waitForTimeout(a.after || 300); await shot(); }
    else if (a.fontwait) { await p.evaluate(() => document.fonts.ready); }
    else if (a.shot) { await shot(); }
    else errors.push('unknown action: ' + JSON.stringify(a));
  }
  try { L.tileFfmpeg(outdir, 'f*.png', +L.opt('cols', 6), +L.opt('scale', 300), `${outdir}/sheet.png`); } catch (e) { errors.push('sheet failed: ' + String(e.message).slice(0, 200)); }
  L.writeLog(outdir, { code, frames: n, errors });
  console.log(JSON.stringify({ frames: n, errors, sheet: `${outdir}/sheet.png` }));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
