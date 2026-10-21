// Width robustness check: renders a concept's phone at 360×780 and 430×932 (plus 390×844 reference) for a few states and tiles them.
// Usage: JU_STANDALONE=.build/SC05.html node settings-r2/tools/widths.cjs SC05 [outdir] [states csv]   → outdir/sheet.png (+ per-shot png), prints horizontal-overflow findings.
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path'); const fs = require('fs'); const { execSync } = require('child_process');
(async () => {
  const code = process.argv[2]; const outdir = process.argv[3] || path.resolve('.build', code + '-widths'); fs.mkdirSync(outdir, { recursive: true });
  const states = (process.argv[4] || 's-home,s-fav,s-records,s-profile-edit,s-long,s-seam-feed,s-notify').split(',');
  const sizes = [[375, 812], [390, 844], [430, 932]];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 1 });
  await p.goto('file://' + (process.env.JU_STANDALONE ? path.resolve(process.env.JU_STANDALONE) : path.resolve(__dirname, '..', '..', 'JU-SETTINGS-R2-TEN-DIRECTIONS.html')) + '#concept/' + code);
  await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
  const findings = []; const fontLog = []; let n = 0;
  for (const [w, h] of sizes) {
    await p.evaluate(([c, w, h]) => { const m = window.JUShell.mounts.stage['stage:' + c + ':']; m.instance.setPhoneSize(w, h); }, [code, w, h]); await p.waitForTimeout(300);
    for (const s of states) {
      await p.evaluate(([c, k]) => { const m = window.JUShell.mounts.stage['stage:' + c + ':']; m.instance.jumpTo(k); }, [code, s]); await p.waitForTimeout(650);
      const r = await p.evaluate(c => { const host = document.querySelector('.stage-host[data-code="' + c + '"]'); const ph = host.shadowRoot.querySelector('.ju-phone'); const pr = ph.getBoundingClientRect(); const over = [];
        ph.querySelectorAll('*').forEach(el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') return; const b = el.getBoundingClientRect(); if (b.width === 0 || b.height === 0) return; if (cs.transform !== 'none') return; var anc = el.parentElement, moved = false; while (anc && anc !== ph) { var t = getComputedStyle(anc).transform; if (t && t !== 'none') { var m = t.match(/matrix\(([^)]+)\)/); if (!m) { moved = true; break; } var v = m[1].split(',').map(Number); if (Math.abs(v[4]) > 0.5 || Math.abs(v[5]) > 0.5) { moved = true; break; } } anc = anc.parentElement; } if (moved) return; if (b.right > pr.right + 2 || b.left < pr.left - 2) { let an = el.closest('[class]'); const ov = (el.parentElement && getComputedStyle(el.parentElement).overflowX) || ''; if (ov === 'hidden' || ov === 'auto' || ov === 'scroll' || ov === 'clip') return; over.push((el.tagName.toLowerCase() + '.' + String(el.className || '').split(' ').slice(0, 2).join('.')) + ' ' + Math.round(b.left - pr.left) + '…' + Math.round(b.right - pr.left)); } });
        return { x: pr.left, y: pr.top, w: pr.width, h: pr.height, over: over.slice(0, 6) }; }, code);
      if (r.over.length) findings.push(`${w}px ${s}: ${r.over.join(' | ')}`);
      const fsz = await p.evaluate(c => { const host = document.querySelector('.stage-host[data-code="' + c + '"]'); const ph = host.shadowRoot.querySelector('.ju-phone'); let max = 0, min = 99; ph.querySelectorAll('h1,h2,h3,p,span,div,button,input,label').forEach(el => { if (!el.childNodes.length || !el.textContent.trim()) return; const cs = getComputedStyle(el); if (cs.display === 'none') return; const f = parseFloat(cs.fontSize); if (f > max) max = f; if (f < min && f > 0) min = f; }); const tr = ph.querySelector('.app') ? getComputedStyle(ph.querySelector('.app')).transform : 'none'; return { max, min, tr }; }, code);
      fontLog.push({ w, s, max: fsz.max, min: fsz.min, transform: fsz.tr });
      await p.screenshot({ path: `${outdir}/f${String(n++).padStart(2, '0')}-${w}-${s}.png`, clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
    }
  }
  await b.close();
  // tile with PIL (sizes differ) via python
  const py = `import os,sys\nfrom PIL import Image, ImageDraw\nd='${outdir}'; fs=sorted(f for f in os.listdir(d) if f.startswith('f') and f.endswith('.png'))\ncols=${states.length}; W=440; H=950; pad=6\nrows=(len(fs)+cols-1)//cols\nsh=Image.new('RGB',(cols*(W+pad)+pad, rows*(H+pad+18)+pad),(230,228,224)); dr=ImageDraw.Draw(sh)\nfor i,f in enumerate(fs):\n    im=Image.open(os.path.join(d,f)); x=pad+(i%cols)*(W+pad); y=pad+(i//cols)*(H+pad+18); dr.text((x+2,y+2),f[4:-4],fill=(50,50,50)); sh.paste(im,(x,y+18))\nsh.save(os.path.join(d,'sheet.png'))\n`;
  fs.writeFileSync(path.join(outdir, 'tile.py'), py); execSync(`python3 -I ${path.join(outdir, 'tile.py')}`);
  // invariance: the largest and smallest font sizes of a state must not change with width (no page scaling), and .app must not be transformed
  const inv = []; states.forEach(st => { const rows = fontLog.filter(r => r.s === st); const maxes = new Set(rows.map(r => r.max)), mins = new Set(rows.map(r => r.min)); if (maxes.size > 1 || mins.size > 1) inv.push(`${st}: max ${[...maxes].join('/')} min ${[...mins].join('/')}`); rows.forEach(r => { if (r.transform && r.transform !== 'none') inv.push(`${st}@${r.w}: .app transform ${r.transform}`); }); });
  console.log(JSON.stringify({ code, shots: n, sheet: path.join(outdir, 'sheet.png'), overflow: findings, fontInvariance: inv, minFont: Math.min(...fontLog.map(r => r.min)) }));
})().catch(e => { console.error(e); process.exit(1); });
