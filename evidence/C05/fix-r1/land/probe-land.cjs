// probe: open a list row, close, and sample every animation frame: overlay mounted, head rect (in the overlay), row rect + opacity
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const [jump, rowSel, backSel, pre, mid] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C05'); await p.waitForTimeout(900);
  const res = await p.evaluate(async ([jump, rowSel, backSel, pre, mid]) => {
    const m = window.JUShell.mounts.stage['stage:C05:']; const inst = m.instance; const h = document.querySelector('.stage-host[data-code="C05"]').shadowRoot;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    inst.jumpTo(jump); await wait(700);
    if (pre) { new Function('root', 'inst', pre)(h, inst); await wait(1500); }
    const row = h.querySelector(rowSel); row.querySelector('.c05-hit').click(); await wait(1400);
    const id = row.getAttribute('data-rid'); if (mid) { const steps = mid.split('||'); for (const st of steps) { new Function('root', 'inst', st)(h, inst); await wait(+((st.match(/\/\*(\d+)\*\//) || [0, 900])[1])); } }
    h.querySelector(backSel).click();
    const out = []; const t0 = performance.now();
    await new Promise(done => { const tick = () => { const t = performance.now() - t0; const ov = h.querySelector('.c05-over.c05-full'); const r = h.querySelector('.c05-piece[data-rid="' + id + '"]');
      const ash = ov ? ov.querySelector(".c05-pieceash.on .c05-ashhead") : null; const hd = ash || (ov ? ov.querySelector(".c05-sheet>.c05-cloth>.c05-pc") : null); const rr = r ? r.getBoundingClientRect() : null; const hr = hd ? hd.getBoundingClientRect() : null;
      out.push([Math.round(t), ov ? ov.className.replace(/c05-over c05-full |c05-detail |c05-manage /g, '') : '-', hr ? Math.round(hr.top) + '/' + Math.round(hr.height) : '', rr ? Math.round(rr.top) + '/' + Math.round(rr.height) : '', r ? getComputedStyle(r).opacity : '']);
      if (t < 1100) requestAnimationFrame(tick); else done(); }; requestAnimationFrame(tick); });
    return out;
  }, [jump, rowSel, backSel, pre || '', mid || '']);
  const keep = res.filter((x, i) => i === 0 || x[1] !== res[i - 1][1] || x[4] !== res[i - 1][4] || (x[0] > 520 && x[0] < 720));
  console.log(keep.map(x => x.join('  ')).join('\n')); console.log('errors', errors);
  await b.close();
})();
