// Same-flow comparison across concepts (差异检查 3 / 正常速度录屏替代): runs the SAME real-click flow in every concept at 1× and
// records the phone through a CDP screencast (compositor frames with real timestamps, i.e. every frame the browser painted,
// cropped to the phone), one row per concept, so the spatial organisation of each concept's transition can be compared side by
// side at normal speed. The default 进入—操作—返回 flow yields ≈ 24–32 frames (the headless screencast paints 8–14 fps while
// something moves; re-run with a longer --span if a run ends below 24); --max keeps at most N frames per segment (evenly spread,
// first and last kept) so the sheet stays readable. Frame labels: "fK/N +Tms" = the K-th of N painted frames, T ms after the
// first painted frame of that segment (the screencast's timestamps lag the paint by a varying ≈ 100–300 ms, so times since the
// click are not claimed; the spacing between frames is real).
// Usage: node my-r2/tools/flow-compare.cjs <outdir> [--codes C01,C02,...] [--flow enter-back] [--final] [--skin cotton] [--speed 1]
//        [--span 1400] (ms recorded after each click) [--max 16] (frames kept per click) [--shots] (fallback: timed screenshots instead of the screencast)
//        [--vw 480 --vh 1000] (viewport: small keeps the screencast frame rate up; the phone must fit inside)
//   files: .build/<CODE>.html per concept (private builds) unless --final (the deliverable) or JU_STANDALONE (one file for all)
//   flows: my-r2/tools/flows.json (enter-back = home → first row → detail → back; tear-contact-copy; end-attend; …)
//   output: outdir/<CODE>-NN.jpg frames, outdir/sheet.png (rows = concepts), outdir/log.json (how each click landed, frame times, fps)
const L = require('./_lib.cjs'); const fs = L.fs, path = L.path;
const [outdir] = L.positionals();
if (!outdir) { console.error('usage: node my-r2/tools/flow-compare.cjs <outdir> [--codes C01,C02] [--flow enter-back] [--final]'); process.exit(2); }
(async () => {
  fs.mkdirSync(outdir, { recursive: true });
  const codes = L.opt('codes', 'C01,C02,C03,C04,C05,C06,C07,C08,C09,C10').split(','); const skin = L.opt('skin', ''); const speed = +L.opt('speed', 1);
  const span = +L.opt('span', 1400), max = +L.opt('max', 16); const flowName = L.opt('flow', 'enter-back'); const useShots = L.flag('shots');
  const flow = L.loadFlows()[flowName]; if (!flow) { console.error('unknown flow: ' + flowName); process.exit(2); }
  /* a narrow viewport (the shell lays the rail above the stage below 900px, so the phone sits at the left edge): the screencast
     encodes the whole viewport per frame, and a small one keeps the frame rate up (≈ 2–3× more frames than at 1000×1000) */
  const { b, p, errors } = await L.launch({ viewport: { width: +L.opt('vw', 480), height: +L.opt('vh', 1000) } }); const rows = []; const log = {};
  const cdp = useShots ? null : await p.context().newCDPSession(p);
  for (const code of codes) {
    const file = L.fileFor(code, { final: L.flag('final'), preferPrivate: true });
    if (!fs.existsSync(file)) { log[code] = 'no build'; continue; }
    const start = errors.length;
    const ok = await L.openConcept(p, file, code, 800); if (!ok) { log[code] = 'not mounted'; continue; }
    await L.E(p, code, 'inst.reset(); inst.setSpeed(a)', speed); if (skin) await L.setSkin(p, code, skin); await p.waitForTimeout(400);
    if (flow.jump) await L.jump(p, code, flow.jump, 500);
    const box = await L.phoneRect(p, code); const frames = []; const how = []; let fps = [];
    const still = async (label) => { const f = path.join(outdir, `${code}-${String(frames.length).padStart(2, '0')}.jpg`); await L.shot(p, box, f, 'jpeg'); frames.push({ f, label, t: null }); };
    /* one recorded segment: start the screencast, click, record for `span` ms, keep ≤ max frames with their real times */
    const segment = async (label, act) => {
      if (useShots) { await act(); const t0 = Date.now(); let k = 0; while (Date.now() - t0 < span) { await still(label + ' +' + (Date.now() - t0) + 'ms'); k++; } return; }
      const raw = []; const onFrame = async (ev) => { raw.push({ t: ev.metadata.timestamp, data: ev.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { } };
      cdp.on('Page.screencastFrame', onFrame);
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 78, maxWidth: 1400, maxHeight: 1400, everyNthFrame: 1 });
      await p.waitForTimeout(80); const t0 = Date.now() / 1000; await act(); await p.waitForTimeout(span);
      try { await cdp.send('Page.stopScreencast'); } catch (e) { } cdp.off('Page.screencastFrame', onFrame);
      const seg = raw.filter(r => r.t >= t0 - 0.05).sort((x, y) => x.t - y.t); fps.push(seg.length ? Math.round(seg.length / span * 1000) : 0);
      if (!seg.length) { await still(label + ' (no frames painted)'); return; }
      const keep = seg.length <= max ? seg : Array.from({ length: max }, (_, i) => seg[Math.round(i * (seg.length - 1) / (max - 1))]);
      /* frame times are relative to the FIRST painted frame of the segment: the screencast's own timestamps lag the paint by a
         pipeline delay (≈ 100–300 ms, varying with the ack round trip), so "since click" would mislead; the spacing is real */
      const tf = seg[0].t;
      for (const r of keep) { const f = path.join(outdir, `${code}-${String(frames.length).padStart(2, '0')}.jpg`); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); frames.push({ f, label: label + ' f' + (seg.indexOf(r) + 1) + '/' + seg.length + ' +' + Math.round((r.t - tf) * 1000) + 'ms', t: r.t - tf, crop: true }); }
    };
    await still('起点');
    for (const st of flow.steps) {
      if (st.click) { let r; await segment(st.click.replace(/\[data-act="?|"?\]|\[data-rid\]\[data-origin\]/g, '').split(',')[0].trim() || 'click', async () => { r = await L.clickSel(p, code, st.click, st); }); const issue = (st.optional && (r.missing || r.hidden)) ? 'skipped (optional, not present)' : L.clickIssue(r, st.click); how.push((issue || 'click') + ' ← ' + st.click); }
      else if (st.wait) { await p.waitForTimeout(Math.min(st.wait, 300)); }
      else { const issue = await L.runStep(p, code, st); if (issue) how.push(issue); }
    }
    await p.waitForTimeout(300); await still('终态');
    /* screencast frames are the whole viewport: crop them to the phone (the still frames are already clipped) */
    const toCrop = frames.filter(x => x.crop).map(x => x.f);
    if (toCrop.length) { const py = `from PIL import Image\nimport json\nbox=${JSON.stringify(box)}\nfor f in ${JSON.stringify(toCrop)}:\n    im=Image.open(f)\n    sx=im.width/${await p.evaluate(() => window.innerWidth)}; sy=im.height/${await p.evaluate(() => window.innerHeight)}\n    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=82)\n`; fs.writeFileSync(path.join(outdir, 'crop.py'), py); L.execSync(`python3 -I ${path.join(outdir, 'crop.py')}`); }
    rows.push({ code, frames }); log[code] = { how, fps, errors: errors.slice(start, start + 3), frames: frames.length };
  }
  await b.close();
  if (rows.length) L.tilePy(outdir, rows.map(r => r.frames.map(x => x.f)), path.join(outdir, 'sheet.png'), { scale: 0.34, gap: 6, labels: rows.map(r => r.frames.map(x => x.label)) });
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify({ flow: flowName, title: flow.title, skin, speed, span, max, screencast: !useShots, labels: rows[0] ? rows[0].frames.map(x => x.label) : [], log }, null, 1));
  console.log(JSON.stringify({ flow: flowName, rows: rows.length, frames: rows[0] ? rows[0].frames.length : 0, sheet: path.join(outdir, 'sheet.png'), log }));
})().catch(e => { console.error(e); process.exit(1); });
