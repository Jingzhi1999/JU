// Keyboard occlusion check (my-r2): with the panel's keyboard simulation on (--kb 300px inset on .ju-phone), focus each text input
// of the surfaces that have one (改时间 date/time fields; 局内记录 / 举报补充 textarea) and verify the focused field's bottom edge
// stays above the keyboard; also checks the primary action ([data-act=ok|propose|submit|report], button[type=submit]) is reachable
// and that no clipped ancestor (.app / .ju-phone) was scrolled to achieve it.
// Usage: JU_STANDALONE=.build/C01.html node my-r2/tools/kb-check.cjs C01 [outdir] [states csv]
//   a state is "<index key>" or "<index key>+<selector to click first>" (opens the sheet that holds the input), e.g.
//   h-m-reschedule,j-d-ended+[data-act="report"]   (the default)
const L = require('./_lib.cjs'); const fs = L.fs, path = L.path;
const [code, outArg, statesArg] = L.positionals();
if (!code) { console.error('usage: node my-r2/tools/kb-check.cjs <CODE> [outdir] [states csv]'); process.exit(2); }
(async () => {
  const outdir = outArg || path.resolve('.build', code + '-kb'); fs.mkdirSync(outdir, { recursive: true });
  const states = (statesArg || 'h-m-reschedule,j-d-ended+[data-act="report"]').split(',');
  const { b, p, errors } = await L.launch();
  const ok = await L.openConcept(p, L.fileFor(code), code, 900);
  if (!ok) { console.log(JSON.stringify({ code, error: 'concept not mounted', errors })); await b.close(); process.exit(1); }
  const findings = []; let n = 0; const detail = [];
  for (const spec of states) {
    const [st, pre] = spec.split('+');
    /* jump first and let it settle: jumpTo lowers the keyboard in its own render, so reading review.kb in the same tick would
       see the previous state's value; then open the sheet (if asked), then raise the keyboard */
    await L.jump(p, code, st, 450);
    if (pre) { const r = await L.clickSel(p, code, pre); const issue = L.clickIssue(r, pre); if (issue) findings.push(`${st}: ${issue}`); await p.waitForTimeout(500); }
    const kb = await L.setToggle(p, code, 'kb', true); if (kb !== 'ok') { findings.push(`${st}: no toggleKb on the instance`); continue; }
    await p.waitForTimeout(700);
    const r = await L.E(p, code, "var ph = sr.querySelector('.ju-phone'); var pr = ph.getBoundingClientRect(); var kbPx = parseFloat(getComputedStyle(ph).getPropertyValue('--kb')) || 300; var kbTop = pr.bottom - kbPx;\n" +
      "var inputs = Array.prototype.slice.call(ph.querySelectorAll('input:not([type=hidden]):not([type=range]):not([type=checkbox]):not([type=radio]):not([type=file]),textarea')).filter(function (el) { var cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getBoundingClientRect().width > 0 && !el.closest('.ju-panel'); });\n" +
      "var out = []; inputs.forEach(function (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } if (inst.reveal) inst.reveal(el); else el.scrollIntoView({ block: 'nearest' }); var b = el.getBoundingClientRect(); out.push({ name: el.getAttribute('data-field') || el.name || el.placeholder || el.tagName.toLowerCase(), bottom: Math.round(b.bottom - pr.top), top: Math.round(b.top - pr.top), kbTop: Math.round(kbTop - pr.top), hidden: b.bottom > kbTop || b.top < pr.top }); });\n" +
      "var app = ph.querySelector('.app'); var shifted = (app && app.scrollTop) || ph.scrollTop || 0;\n" +
      "var acts = Array.prototype.slice.call(ph.querySelectorAll('[data-act=\"ok\"],[data-act=\"propose\"],[data-act=\"submit\"],[data-act=\"report\"],button[type=submit]')).filter(function (el) { var bb = el.getBoundingClientRect(); return bb.width > 0 && bb.height > 0 && !el.closest('.ju-panel'); }); var act = acts.length ? acts[acts.length - 1] : null; if (act && inst.reveal) inst.reveal(act); var ab = act ? act.getBoundingClientRect() : null;\n" +
      "return { x: pr.left, y: pr.top, w: pr.width, h: pr.height, kbPx: kbPx, inputs: out, shifted: shifted, action: ab ? { act: act.getAttribute('data-act') || act.tagName.toLowerCase(), bottom: Math.round(ab.bottom - pr.top), hidden: ab.bottom > kbTop } : null };");
    if (!r.inputs.length) findings.push(`${st}: no text input found on this surface`);
    r.inputs.filter(i => i.hidden).forEach(i => findings.push(`${st}: input ${i.name} bottom ${i.bottom} > keyboard top ${i.kbTop}`));
    if (!r.action) findings.push(`${st}: no primary action ([data-act=ok|propose|submit|report]) visible`);
    else if (r.action.hidden) findings.push(`${st}: primary action ${r.action.act} under keyboard (bottom ${r.action.bottom})`);
    if (r.shifted) findings.push(`${st}: the app itself was scrolled by ${r.shifted}px (a clipped ancestor moved)`);
    detail.push({ state: st, inputs: r.inputs, action: r.action, kbPx: r.kbPx });
    await L.shot(p, { x: r.x, y: r.y, w: r.w, h: r.h }, `${outdir}/f${String(n++).padStart(2, '0')}-${st}.png`);
    await L.setToggle(p, code, 'kb', false); await p.waitForTimeout(150);
  }
  await b.close();
  L.writeLog(outdir, { code, findings, detail, errors });
  console.log(JSON.stringify({ code, shots: n, findings, errors: errors.length }));
})().catch(e => { console.error(e); process.exit(1); });
