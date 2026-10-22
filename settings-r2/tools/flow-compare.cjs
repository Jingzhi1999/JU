// Same-flow comparison across concepts (差异检查 3): runs the SAME representative flow in every concept at normal speed —
// home → open 个人资料 → 编辑 → change 称呼 → 保存 (pending → saved → returns) → back to home — and tiles fixed-time frames,
// one row per concept, so the spatial organisation of each concept's transition can be compared side by side.
// Real pointer clicks (at the centre of the concept's marked control: [data-origin="profile"], [data-act="edit"], [data-act="save"],
// [data-act="back"]) are used; if a control is missing or the click changes nothing, the shared controller is driven directly
// (inst.go / inst.pfSave / inst.back) and the log says so.
// Usage: node settings-r2/tools/flow-compare.cjs <outdir> [--codes S01,S02,...] [--final] [--skin cotton] [--speed 1]
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs'); const path = require('path'); const { execSync } = require('child_process');
const outdir = process.argv[2]; const opt = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; }; const flag = (k) => process.argv.indexOf('--' + k) >= 0;
(async () => {
  fs.mkdirSync(outdir, { recursive: true });
  const ROOT = path.resolve(__dirname, '..', '..');
  const codes = opt('codes', 'S01,S02,S03,S04,S05,S06,S07,S08,S09,S10').split(','); const skin = opt('skin', ''); const speed = +opt('speed', 1);
  const b = await chromium.launch(); const rows = []; const log = {};
  for (const code of codes) {
    const file = flag('final') ? path.join(ROOT, 'JU-SETTINGS-R2-TEN-DIRECTIONS.html') : path.join(ROOT, '.build', code + '.html');
    if (!fs.existsSync(file)) { log[code] = 'no build'; continue; }
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.goto('file://' + file + '#concept/' + code); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
    const E = (js, arg) => p.evaluate(([c, js, a]) => { const m = window.JUShell.mounts.stage['stage:' + c + ':']; return new Function('root', 'inst', 'a', js)(m.root, m.instance, a); }, [code, js, arg]);
    await E("inst.reset(); if (a.skin) inst.act('applySkin', { skin: a.skin }); inst.setSpeed(a.speed);", { skin, speed }); await p.waitForTimeout(500);
    const box = await p.evaluate(c => { const h = document.querySelector('.stage-host[data-code="' + c + '"]'); const r = h.shadowRoot.querySelector('.ju-phone').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; }, code);
    const frames = []; const how = [];
    /* JPEG frames: PNG encoding of a full-screen colour field takes ~500ms and made the timed frames land late (S02) */
    const shot = async (label) => { const f = path.join(outdir, `${code}-${String(frames.length).padStart(2, '0')}.jpg`); await p.screenshot({ path: f, clip: box, type: 'jpeg', quality: 82 }); frames.push({ f, label }); };
    /* a real pointer click at the marked element's centre (hit-testing decides which child receives it, as for a person) */
    const clickOr = async (sel, fallback, label) => {
      const pt = await E("const el = root.querySelector(a); if (!el) return null; const r = el.getBoundingClientRect(); if (!r.width || !r.height) return null; return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 48) };", sel);
      if (!pt) { await E(fallback); how.push(label + ':ctl'); return; }
      const before = await E("return JSON.stringify([inst.state.nav.stack.map(x => x.s), inst.state.nav.phase, inst.state.pf && inst.state.pf.saving])");
      await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(30);
      const after = await E("return JSON.stringify([inst.state.nav.stack.map(x => x.s), inst.state.nav.phase, inst.state.pf && inst.state.pf.saving])");
      if (before === after) { await E(fallback); how.push(label + ':ctl(click had no effect)'); } else how.push(label + ':click');
    };
    await shot('首页');
    await clickOr('[data-origin="profile"]', "inst.go('profile')", 'open');
    for (const t of [60, 160, 300]) { await p.waitForTimeout(t === 60 ? 60 : t - (t === 160 ? 60 : 160)); await shot('进入资料 ' + t + 'ms'); }
    await p.waitForTimeout(300);
    await clickOr('[data-act="edit"]', "inst.go('profile-edit')", 'edit');
    for (const t of [80, 300]) { await p.waitForTimeout(t === 80 ? 80 : 220); await shot('编辑 ' + t + 'ms'); }
    await p.waitForTimeout(300);
    await E("const i = root.querySelector('[data-field=name]'); if (i) { i.value = '阿禾二'; i.dispatchEvent(new Event('input', { bubbles: true })); } else inst.pfInput('name', '阿禾二');"); await p.waitForTimeout(120);
    await clickOr('[data-act="save"]', "inst.pfSave()", 'save');
    for (const t of [120, 420, 760, 1100]) { await p.waitForTimeout(t === 120 ? 120 : t === 420 ? 300 : t === 760 ? 340 : 340); await shot('保存 ' + t + 'ms'); }
    await p.waitForTimeout(400);
    const depth = await E("return inst.state.nav.stack.length");
    if (depth > 1) { await clickOr('[data-act="back"]', "inst.back()", 'back'); for (const t of [80, 300]) { await p.waitForTimeout(t === 80 ? 80 : 220); await shot('返回 ' + t + 'ms'); } }
    await p.waitForTimeout(400); await shot('回到首页');
    rows.push({ code, frames }); log[code] = { how, errors: errors.slice(0, 3), frames: frames.length };
    await p.close();
  }
  await b.close();
  const py = `from PIL import Image, ImageDraw\nrows=${JSON.stringify(rows.map(r => r.frames.map(x => x.f)))}\nsc=0.34\nims=[[Image.open(f).convert('RGB') for f in r] for r in rows]\nw=int(ims[0][0].width*sc); h=int(ims[0][0].height*sc); cols=max(len(r) for r in ims); gap=6\nsh=Image.new('RGB',(cols*(w+gap)+gap, len(ims)*(h+gap)+gap),(40,40,44))\nfor ri,r in enumerate(ims):\n    for ci,im in enumerate(r):\n        sh.paste(im.resize((w,h),Image.LANCZOS),(gap+ci*(w+gap),gap+ri*(h+gap)))\nsh.save('${path.join(outdir, 'sheet.png')}',optimize=True)\n`;
  fs.writeFileSync(path.join(outdir, 'tile.py'), py); execSync(`python3 -I ${path.join(outdir, 'tile.py')}`);
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify({ skin, speed, labels: rows[0] ? rows[0].frames.map(x => x.label) : [], log }, null, 1));
  console.log(JSON.stringify({ rows: rows.length, sheet: path.join(outdir, 'sheet.png'), log }));
})().catch(e => { console.error(e); process.exit(1); });
