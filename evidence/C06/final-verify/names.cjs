// independent full-name probe + screenshots. node names.cjs <standalone> <outdir> [rm]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path'); const { execSync } = require('child_process');
const [file, outdir, rmArg] = process.argv.slice(2); const RM = rmArg === 'rm';
(async () => {
  fs.rmSync(outdir, { recursive: true, force: true }); fs.mkdirSync(outdir, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(file) + '#concept/C06'); await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
  const run = js => p.evaluate(js => { const m = window.JUShell.mounts.stage['stage:C06:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  if (RM) { await run('inst.toggleRM()'); await p.waitForTimeout(200); }
  const phone = await p.evaluate(() => { const r = document.querySelector('.stage-host[data-code="C06"]').shadowRoot.querySelector('.ju-phone').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
  const cases = [];
  const keys = await p.evaluate(() => window.JU.INDEX.filter(e => e.open).map(e => e.key)); keys.forEach(k => cases.push({ label: k, steps: [`inst.jumpTo('${k}')`] }));
  const L = (label, list, tap, more) => cases.push({ label, steps: [`inst.jumpTo('${list}')`, `root.querySelector('.c06-obj[data-rid="${tap}"]').click()`].concat(more || []) });
  // real taps from the lists (lift path, not instant jump)
  L('tap j-history ramen', 'j-history', 'r-ramen');
  L('tap j-history boardgame', 'j-history', 'r-boardgame');
  L('tap j-history mahjong', 'j-history', 'r-mahjong');
  L('tap j-history jazz', 'j-history', 'r-jazz');
  L('long tap brunch', 'b-long', 'r-brunch');
  L('long tap brunch +rules slip', 'b-long', 'r-brunch', [`root.querySelector('.c06-over [data-act="confirm"]').click()`]);
  L('long tap brunch +release slip', 'b-long', 'r-brunch', [`root.querySelector('.c06-over [data-act="release"]').click()`]);
  L('long tap livehouse', 'b-long', 'r-livehouse');
  L('long tap livehouse +decline slip', 'b-long', 'r-livehouse', ['WAIT:2500', `root.querySelector('.c06-over [data-act="decline"]').click()`]);
  L('long tap bar', 'b-long-h', 'r-bar');
  L('long tap bar +members', 'b-long-h', 'r-bar', [`inst.setTab('members')`]);
  L('long tap bar +plan', 'b-long-h', 'r-bar', [`inst.setTab('plan')`]);
  L('long tap bar +card slip', 'b-long-h', 'r-bar', [`inst.openSlip('card')`]);
  L('long tap bar +cancel slip', 'b-long-h', 'r-bar', [`inst.hostSlip('cancel')`]);
  L('long tap bar +reschedule slip', 'b-long-h', 'r-bar', [`inst.hostSlip('reschedule')`]);
  const lines = []; const shots = [];
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    for (const js of c.steps) { if (js.startsWith('WAIT:')) { await p.waitForTimeout(+js.slice(5)); continue; } try { await run(js); } catch (e) { errors.push(c.label + ': ' + e.message); } await p.waitForTimeout(js.includes('jumpTo') ? 900 : 1300); }
    await p.waitForTimeout(600);
    const r = await p.evaluate(() => {
      const m = window.JUShell.mounts.stage['stage:C06:']; const inst = m.instance; const s = inst.state; const v = s.view || {}; const root = document.querySelector('.stage-host[data-code="C06"]').shadowRoot;
      const ph = root.querySelector('.ju-phone').getBoundingClientRect();
      let title = null;
      if (v.name === 'draft') { const d = window.JU.derive.hosted(s.data).drafts.filter(x => x.id === v.id)[0]; title = d && d.title; }
      else if (v.name === 'manage') { const mg = inst.mg(v.id); title = mg && mg.event.title; }
      else if (v.name === 'detail') { const rr = window.JU.derive.rowById(s.data, v.id); title = rr && rr.event.title; }
      if (!title) return { view: v.name, title: null, hits: [] };
      const over = root.querySelector('.c06-over');
      const all = Array.from(root.querySelectorAll('*')).filter(e => (e.textContent || '').indexOf(title) >= 0 && !Array.from(e.children).some(ch => (ch.textContent || '').indexOf(title) >= 0));
      const hits = all.map(el => {
        const where = (el.closest('.c06-held,.c06-sheet,.c06-slip,.c06-fullcard,.c06-obj') || {}).className || '?';
        let visible = true; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.3) { visible = false; break; } }
        const rc = el.getBoundingClientRect(); if (rc.width < 4 || rc.height < 4) visible = false;
        const inPhone = rc.top >= ph.top - 1 && rc.bottom <= ph.bottom + 1 && rc.left >= ph.left - 1 && rc.right <= ph.right + 1;
        const cs = getComputedStyle(el); const ellipsis = el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible';
        const clamp = (cs.webkitLineClamp && cs.webkitLineClamp !== 'none') ? el.scrollHeight > el.clientHeight + 4 : (cs.overflow !== 'visible' && el.scrollHeight > el.clientHeight + 4);
        // clipped by an ancestor box (excluding scroll containers whose content just scrolls)?
        let clipped = false; for (let e = el.parentElement; e && e.nodeType === 1 && e !== root.host; e = e.parentElement) { const ec = getComputedStyle(e); if (ec.overflowX !== 'visible' || ec.overflowY !== 'visible') { const pr = e.getBoundingClientRect(); if (rc.right > pr.right + 2 || rc.left < pr.left - 2 || (rc.bottom > pr.bottom + 2 && ec.overflowY === 'hidden') || (rc.top < pr.top - 2 && ec.overflowY === 'hidden')) { clipped = true; break; } } }
        const inOverlay = !!(over && over.contains(el));
        return { tag: el.tagName.toLowerCase(), cls: String(el.className || '').trim().split(/\s+/)[0], where: String(where).trim().split(/\s+/).slice(0, 2).join('.'), visible, inPhone, ellipsis, clamp, clipped, inOverlay, top: Math.round(rc.top - ph.top), full: visible && inPhone && !ellipsis && !clamp && !clipped };
      });
      return { view: v.name + '/' + (v.tab || v.mode || '') + (v.slip ? ' slip=' + v.slip : ''), phase: v.phase, nameCut: !!v.nameCut, title, hits };
    });
    const ov = r.hits.filter(h => h.inOverlay);
    const ok = ov.some(h => h.full);
    const best = ov.filter(h => h.full).map(h => h.top).sort((a, b) => a - b)[0];
    lines.push(`${ok ? 'OK  ' : 'MISS'} ${String(i).padStart(2, '0')} ${c.label} [${r.view}${r.nameCut ? ' nameCut' : ''}] 「${r.title}」 firstFullAt=${best == null ? '-' : best + 'px'} :: ` + ov.map(h => `${h.tag}.${h.cls}@${h.where}=${h.full ? 'FULL' : (!h.visible ? 'hidden' : !h.inPhone ? 'offscreen' : h.ellipsis ? 'ELLIPSIS' : h.clamp ? 'CLAMP' : 'CLIPPED')}(${h.top})`).join(' | '));
    const f = `${outdir}/n${String(i).padStart(2, '0')}.png`; await p.screenshot({ path: f, clip: phone }); shots.push(f);
  }
  lines.push('errors: ' + JSON.stringify(errors));
  fs.writeFileSync(`${outdir}/probe.txt`, lines.join('\n') + '\n'); console.log(lines.join('\n'));
  execSync(`ffmpeg -y -loglevel error -framerate 1 -i '${outdir}/n%02d.png' -vf "scale=260:-1,tile=8x${Math.ceil(shots.length / 8)}:padding=4:margin=4:color=white" -frames:v 1 '${outdir}/sheet.png'`);
  await b.close();
})();
