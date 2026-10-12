// Baseline (HEAD = the version verify-r1 passed, before this final pass): RM ON / OFF, draft undo bar + copy toast only.
// usage: JU_STANDALONE=<head build> node baseline-probe.cjs <out.json>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const file = path.resolve(process.env.JU_STANDALONE); const out = process.argv[2]; const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const rm of [true, false]) {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('file://' + file + '#concept/C08'); await p.waitForTimeout(1200);
    const E = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C08:']; return (new Function('root', 'inst', js))(m.root, m.instance); }, js);
    const o = { rm }; if (rm) await E('inst.toggleRM()'); await sleep(200);
    await E(`inst.jumpTo('h-drafts')`); await sleep(rm ? 500 : 1500);
    await E(`root.querySelector('.c08-blk[data-rid="draft-reading"] .c08-del').click()`); const t0 = Date.now(); let seen = null, last = null; let at800 = null; const samples = [];
    while (Date.now() - t0 < 11500) { const u = await E(`return !!root.querySelector('.c08-undo')`); const el = Date.now() - t0; if (u) { if (seen == null) seen = el; last = el; } if (at800 == null && el >= 800) at800 = u; if (samples.length < 15) samples.push([el, u ? 1 : 0]); await sleep(50); }
    o.undo = { firstSeenMs: seen, lastSeenMs: last, barAt800: at800, samples, draftsAfter: await E('return inst.state.data.drafts.map(d => d.id)') };
    await E(`inst.jumpTo('j-d-contact')`); await sleep(rm ? 700 : 2500);
    await E(`root.querySelector('.c08-pane [data-act="copy"]').click()`); const tt = Date.now(); let on = null, off = null;
    while (Date.now() - tt < 4000) { const s = await E(`const t = root.querySelector('.c08-toast'); return !!(t && t.classList.contains('in'))`); const el = Date.now() - tt; if (s && on == null) on = el; if (!s && on != null && off == null) { off = el; break; } await sleep(20); }
    o.copyToast = { onMs: on, offMs: off }; o.errors = errors; res[rm ? 'rmOn' : 'rmOff'] = o; await p.close();
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); await b.close();
})();
