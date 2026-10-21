// Lead review sheet: render the SAME state in every available private build (.build/SNN.html or the final deliverable),
// anonymised (no names/codes on the sheet), optionally grayscale, at a given phone size, and tile into one image.
// Usage: node settings-r2/tools/lead-sheet.cjs <outdir> <state-key> [--codes S01,S02,...] [--gray] [--w 390 --h 844] [--skin cotton|halo|sunset] [--final]
//        actions after the jump can be given with --actions '<json>' (same grammar as capture.cjs: click/wait/eval/scroll).
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs'); const path = require('path'); const { execSync } = require('child_process');
const [outdir, stateKey] = process.argv.slice(2);
const opt = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const flag = (k) => process.argv.indexOf('--' + k) >= 0;
(async () => {
  fs.mkdirSync(outdir, { recursive: true });
  const ROOT = path.resolve(__dirname, '..', '..');
  const codes = (opt('codes', '') || 'S01,S02,S03,S04,S05,S06,S07,S08,S09,S10').split(',');
  const W = +opt('w', 390), H = +opt('h', 844); const skin = opt('skin', ''); const actions = JSON.parse(opt('actions', '[]'));
  const b = await chromium.launch(); const files = []; const log = {};
  for (const code of codes) {
    const file = flag('final') ? path.join(ROOT, 'JU-SETTINGS-R2-TEN-DIRECTIONS.html') : path.join(ROOT, '.build', code + '.html');
    if (!fs.existsSync(file)) { log[code] = 'no build'; continue; }
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.goto('file://' + file + '#concept/' + code); await p.waitForTimeout(700); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    const ok = await p.evaluate(([c, k, W, H, skin]) => { const m = window.JUShell.mounts.stage['stage:' + c + ':']; if (!m) return false; const i = m.instance; i.setPhoneSize(W, H); if (k && k !== 's-home') i.jumpTo(k); if (skin) setTimeout(() => i.act('applySkin', { skin }), 120); return true; }, [code, stateKey, W, H, skin]);
    await p.waitForTimeout(900);
    for (const a of actions) {
      if (a.click) await p.evaluate(([c, s]) => { const h = document.querySelector('.stage-host[data-code="' + c + '"]'); const el = h.shadowRoot.querySelector(s); if (el) { el.scrollIntoView({ block: 'nearest' }); el.click(); } }, [code, a.click]);
      else if (a.eval) await p.evaluate(([c, js]) => { const m = window.JUShell.mounts.stage['stage:' + c + ':']; new Function('root', 'inst', js)(m.root, m.instance); }, [code, a.eval]);
      else if (a.scroll) await p.evaluate(([c, s, y]) => { const h = document.querySelector('.stage-host[data-code="' + c + '"]'); const el = h.shadowRoot.querySelector(s); if (el) el.scrollTop = y; }, [code, a.scroll, a.to || 0]);
      await p.waitForTimeout(a.wait || 500);
    }
    const r = await p.evaluate(c => { const h = document.querySelector('.stage-host[data-code="' + c + '"]'); const ph = h.shadowRoot.querySelector('.ju-phone'); const b = ph.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; }, code);
    const f = path.join(outdir, `${code}.png`); await p.screenshot({ path: f, clip: { x: r.x, y: r.y, width: r.w, height: r.h } }); files.push(f);
    log[code] = { ok, errors: errors.slice(0, 3) }; await p.close();
  }
  await b.close();
  if (files.length) {
    const py = `import sys\nfrom PIL import Image, ImageOps\nfs=${JSON.stringify(files)}\nims=[Image.open(f).convert('RGB') for f in fs]\n${flag('gray') ? 'ims=[ImageOps.grayscale(i).convert("RGB") for i in ims]\n' : ''}sc=0.5; w=int(${W}*sc); h=int(${H}*sc); cols=5; gap=10\nrows=(len(ims)+cols-1)//cols\nsh=Image.new('RGB',(cols*w+(cols+1)*gap, rows*h+(rows+1)*gap),(44,44,48))\nfor i,im in enumerate(ims):\n    r,c=divmod(i,cols); sh.paste(im.resize((w,h),Image.LANCZOS),(gap+c*(w+gap),gap+r*(h+gap)))\nsh.save('${path.join(outdir, 'sheet' + (flag('gray') ? '-gray' : '') + '.png')}',optimize=True)\n`;
    fs.writeFileSync(path.join(outdir, 'tile.py'), py); execSync(`python3 -I ${path.join(outdir, 'tile.py')}`);
  }
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify({ state: stateKey, W, H, skin, log }, null, 1));
  console.log(JSON.stringify({ state: stateKey, built: files.length, log }));
})().catch(e => { console.error(e); process.exit(1); });
