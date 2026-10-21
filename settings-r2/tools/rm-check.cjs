// System reduced-motion check: emulate prefers-reduced-motion: reduce, open the concept, run a few core actions and verify
// (a) the mixin reports rmSys, (b) the result states are reached, (c) no animation longer than 1ms is running after the action.
// Usage: JU_STANDALONE=.build/S01.html node settings-r2/tools/rm-check.cjs S01 [outdir]
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const code = process.argv[2]; const outdir = process.argv[3] || path.resolve('.build', code + '-rm'); fs.mkdirSync(outdir, { recursive: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 1000 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto('file://' + (process.env.JU_STANDALONE ? path.resolve(process.env.JU_STANDALONE) : path.resolve(__dirname, '..', '..', 'JU-SETTINGS-R2-TEN-DIRECTIONS.html')) + '#concept/' + code);
  await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
  const rmSys = await p.evaluate(c => window.JUShell.mounts.stage['stage:' + c + ':'].instance.state.review.rmSys, code);
  const steps = ['s-profile-edit', 's-profile-saved', 's-fav', 's-notify-request', 's-appearance-preview', 's-record-dispute', 's-account-confirm'];
  const findings = []; let n = 0;
  for (const st of steps) {
    await p.evaluate(([c, k]) => { window.JUShell.mounts.stage['stage:' + c + ':'].instance.jumpTo(k); }, [code, st]); await p.waitForTimeout(250);
    const anim = await p.evaluate(c => { const host = document.querySelector('.stage-host[data-code="' + c + '"]'); const ph = host.shadowRoot.querySelector('.ju-phone'); const long = []; (ph.getAnimations ? ph.getAnimations({ subtree: true }) : []).forEach(a => { const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : null; if (t && t.duration > 1 && a.playState === 'running') long.push((a.animationName || a.id || 'transition') + ':' + t.duration); }); const root = ph.querySelector('.app'); return { long: long.slice(0, 5), cls: root ? root.className : '' }; }, code);
    if (anim.long.length) findings.push(`${st}: running animations > 1ms: ${anim.long.join(', ')}`);
    const r = await p.evaluate(c => { const host = document.querySelector('.stage-host[data-code="' + c + '"]'); const pr = host.shadowRoot.querySelector('.ju-phone').getBoundingClientRect(); return { x: pr.left, y: pr.top, w: pr.width, h: pr.height }; }, code);
    await p.screenshot({ path: `${outdir}/f${String(n++).padStart(2, '0')}-${st}.png`, clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
  }
  await b.close();
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify({ code, rmSys, findings, errors }, null, 1));
  console.log(JSON.stringify({ code, rmSys, findings, errors: errors.length }));
})().catch(e => { console.error(e); process.exit(1); });
