// Keyboard occlusion check: with the panel's keyboard simulation (300px inset) on, focus each text input of the given states
// and verify the focused field's bottom edge stays above the keyboard; also checks the primary action (data-act=save / [type=submit]) is reachable.
// Usage: JU_STANDALONE=.build/S01.html node settings-r2/tools/kb-check.cjs S01 [outdir] [states csv]
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const code = process.argv[2]; const outdir = process.argv[3] || path.resolve('.build', code + '-kb'); fs.mkdirSync(outdir, { recursive: true });
  const states = (process.argv[4] || 's-profile-edit,s-record-supplement,s-feedback,s-report-supplement,s-city').split(',');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  await p.goto('file://' + (process.env.JU_STANDALONE ? path.resolve(process.env.JU_STANDALONE) : path.resolve(__dirname, '..', '..', 'JU-SETTINGS-R2-TEN-DIRECTIONS.html')) + '#concept/' + code);
  await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
  const findings = []; let n = 0;
  for (const st of states) {
    /* jump first and let it settle: jumpTo lowers the keyboard in its own render (and s-kb raises it again), so reading
       review.kb in the same tick saw the previous state's value and skipped raising it */
    await p.evaluate(([c, k]) => { const m = window.JUShell.mounts.stage['stage:' + c + ':']; m.instance.jumpTo(k); }, [code, st]); await p.waitForTimeout(450);
    await p.evaluate(([c]) => { const m = window.JUShell.mounts.stage['stage:' + c + ':']; if (!m.instance.state.review.kb) m.instance.toggleKb(); }, [code]); await p.waitForTimeout(700);
    const r = await p.evaluate(c => { const host = document.querySelector('.stage-host[data-code="' + c + '"]'); const ph = host.shadowRoot.querySelector('.ju-phone'); const pr = ph.getBoundingClientRect(); const kbTop = pr.bottom - 300;
      const inputs = [...ph.querySelectorAll('input:not([type=hidden]):not([type=range]):not([type=checkbox]):not([type=radio]):not([type=file]),textarea')].filter(el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getBoundingClientRect().width > 0; });
      const inst = window.JUShell.mounts.stage['stage:' + c + ':'].instance; const out = []; inputs.forEach(el => { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } if (inst.reveal) inst.reveal(el); else el.scrollIntoView({ block: 'nearest' }); const b = el.getBoundingClientRect(); out.push({ name: el.name || el.getAttribute('data-field') || el.placeholder || el.tagName, bottom: Math.round(b.bottom - pr.top), kbTop: Math.round(kbTop - pr.top), hidden: b.bottom > kbTop || b.top < pr.top }); });
      const app = ph.querySelector('.app'); const shifted = (app && app.scrollTop) || ph.scrollTop || 0; if (inst.reveal && act0()) inst.reveal(act0()); function act0() { return ph.querySelector('[data-act="save"],[data-act="submit"],button[type=submit]'); } const act = act0(); const ab = act ? act.getBoundingClientRect() : null;
      return { x: pr.left, y: pr.top, w: pr.width, h: pr.height, inputs: out, shifted: shifted, action: ab ? { bottom: Math.round(ab.bottom - pr.top), hidden: ab.bottom > kbTop } : null }; }, code);
    r.inputs.filter(i => i.hidden).forEach(i => findings.push(`${st}: input ${i.name} bottom ${i.bottom} > keyboard top ${i.kbTop}`));
    if (r.action && r.action.hidden) findings.push(`${st}: primary action under keyboard (bottom ${r.action.bottom})`);
    if (r.shifted) findings.push(`${st}: the app itself was scrolled by ${r.shifted}px (a clipped ancestor moved)`);
    await p.screenshot({ path: `${outdir}/f${String(n++).padStart(2, '0')}-${st}.png`, clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
  }
  await b.close();
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify({ code, findings }, null, 1));
  console.log(JSON.stringify({ code, shots: n, findings }));
})().catch(e => { console.error(e); process.exit(1); });
