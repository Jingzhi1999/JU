// Final evidence shots (my-r2, 任务书 §12): the same states and the same real-click rituals in every concept, taken from ONE build
// (the deliverable by default), written as the named stills evidence-index.py indexes:
//   my-r2/evidence/<CODE>/home-joined.png home-hosted.png detail.png manage.png history.png empty.png result.png
//   my-r2/evidence/<CODE>/ritual-{print,tear,burn,stamp}/{1-trigger,2-develop,3-settled}.png + sheet.png
//   my-r2/evidence/<CODE>/final-shots.json (frames, timings, issues)
// node my-r2/tools/final-shots.cjs [C01 C02 ...] [--file <html>]     (env JU_STANDALONE also works; default = the deliverable)
// The environment engine is paused before every still (same frame in every concept); rituals keep the engine paused too, so the
// only motion in a frame is the ritual. Ritual frames are timed from the controller's own state (printing → printed, torn, burned,
// stamp fresh), not from a fixed clock, so slow software rendering does not move the "settled" frame.
const L = require('./_lib.cjs'); const fs = L.fs, path = L.path;
const codes = L.positionals().length ? L.positionals() : ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'];
const FILE = L.opt('file', '') ? path.resolve(L.opt('file')) : L.fileFor(null);
const STILLS = [['home-joined', 'j-home'], ['home-hosted', 'h-home'], ['detail', 'j-d-gathering'], ['manage', 'h-m-attendance'], ['history', 'j-history'], ['empty', 'b-empty']];
const PAUSE_ENV = 'if (window.JU && JU.shared && JU.shared.skins && inst.envRef && inst.envRef.current) JU.shared.skins.pause(inst.envRef.current); return 1;';
(async () => {
  const report = {};
  for (const code of codes) {
    const out = path.join(L.EVIDENCE, code); fs.mkdirSync(out, { recursive: true });
    const { b, p, errors } = await L.launch({ viewport: { width: 1000, height: 1000 } });
    const log = { file: FILE, frames: [], issues: [] }; report[code] = log;
    try {
      if (!(await L.openConcept(p, FILE, code, 900))) { log.issues.push('concept not mounted'); continue; }
      const pause = () => L.E(p, code, PAUSE_ENV);
      const rect = async () => L.phoneRect(p, code);
      const settle = async (maxMs) => { const t0 = Date.now(); while (Date.now() - t0 < (maxMs || 2500)) { const n = await L.runningAnimations(p, code, 0); if (!n || !n.length) break; await p.waitForTimeout(80); } };
      const until = async (js, maxMs) => { const t0 = Date.now(); while (Date.now() - t0 < maxMs) { let ok = false; try { ok = await L.E(p, code, js); } catch (e) { } if (ok) return Date.now() - t0; await p.waitForTimeout(60); } return -1; };
      const snap = async (file, label) => { const r = await rect(); await L.shot(p, r, file); log.frames.push({ file: path.relative(L.ROOT, file), label }); };
      await pause();
      /* 1. the six required stills (+ empty) */
      for (const [name, key] of STILLS) { await L.jump(p, code, key, 900); await pause(); await settle(2500); await p.waitForTimeout(250); await snap(path.join(out, name + '.png'), key); }
      /* 2. a stable result after a key operation: 阅读并确认 → 成局出票 (flow read-confirm), shot once the ticket has printed */
      { const f = L.loadFlows()['read-confirm']; await L.jump(p, code, f.jump, 800); await pause();
        for (const st of f.steps) { const issue = await L.runStep(p, code, st); if (issue) log.issues.push('read-confirm: ' + issue); }
        await until("var t = inst.ctlVals().ticket; return !t.on || t.state === 'printed' || t.state === 'torn';", 9000); await settle(2500); await p.waitForTimeout(400);
        await snap(path.join(out, 'result.png'), 'read-confirm result'); }
      /* 3. rituals: trigger · development · settled */
      const ritual = async (name, run) => { const dir = path.join(out, 'ritual-' + name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); const shots = []; try { await run(async (k, label) => { const f = path.join(dir, k + '.png'); await snap(f, name + ' ' + label); shots.push(f); }); } catch (e) { log.issues.push(name + ': ' + e.message); } if (shots.length) L.tilePy(dir, [shots], path.join(dir, 'sheet.png'), { scale: 0.5, labels: [shots.map(f => path.basename(f, '.png'))] }); };
      /* print: home → the 公园慢跑 3K row (ticket not printed yet in a fresh dataset) */
      await ritual('print', async (s) => {
        await L.jump(p, code, 'j-home', 900); await pause();
        const r = await L.clickSel(p, code, '[data-rid="run3k"]'); const iss = L.clickIssue(r, 'run3k row'); if (iss) log.issues.push('print: ' + iss);
        await p.waitForTimeout(180); await s('1-trigger', 'click +180ms');
        const tp = await until("var t = inst.ctlVals().ticket; return t.on && t.state === 'printing';", 4000); await p.waitForTimeout(1100); await s('2-develop', 'printing +1100ms (printing began after ' + tp + 'ms)');
        await until("var t = inst.ctlVals().ticket; return t.on && t.state === 'printed';", 9000); await settle(2000); await p.waitForTimeout(300); await s('3-settled', 'printed');
      });
      /* tear: the button equivalent on the printed ticket */
      await ritual('tear', async (s) => {
        const r = await L.clickSel(p, code, '[data-act="tear-now"], [data-act="tear"]'); const iss = L.clickIssue(r, 'tear button'); if (iss) log.issues.push('tear: ' + iss);
        await p.waitForTimeout(160); await s('1-trigger', 'tear +160ms');
        await p.waitForTimeout(520); await s('2-develop', 'tear +680ms');
        await until("var it = inst.state.data.joined.filter(function (x) { return x.eventId === 'run3k'; })[0]; return !!(it && it.ticket && it.ticket.torn) && inst.state.ui.ticket.contactOpen;", 6000); await settle(2500); await p.waitForTimeout(300); await s('3-settled', 'torn + contact open');
      });
      /* burn: 拒绝改期 on the reissued Livehouse ticket (variant B on the original ticket) */
      await ritual('burn', async (s) => {
        await L.jump(p, code, 'j-d-reschedule', 900); await pause();
        await until("var t = inst.ctlVals().ticket; return !t.on || t.state === 'printed';", 6000);
        let r = await L.clickSel(p, code, '[data-act="decline"]'); let iss = L.clickIssue(r, 'decline'); if (iss) log.issues.push('burn: ' + iss); await p.waitForTimeout(420);
        r = await L.clickSel(p, code, '[class*="-over"] [data-act="ok"], [data-act="ok"]'); iss = L.clickIssue(r, 'confirm decline'); if (iss) log.issues.push('burn: ' + iss);
        await p.waitForTimeout(600); await s('1-trigger', 'confirm +600ms');
        await p.waitForTimeout(2400); await s('2-develop', 'confirm +3000ms');
        await until("return !!(inst.state.ui.burned && inst.state.ui.burned.livehouse);", 12000); await settle(2500); await p.waitForTimeout(400); await s('3-settled', 'burned');
      });
      /* stamp: 出席 for the first unrecorded person on the attendance page */
      await ritual('stamp', async (s) => {
        await L.jump(p, code, 'h-m-attendance', 900); await pause(); await settle(2000);
        const r = await L.clickSel(p, code, '[data-act="attend-present"]'); const iss = L.clickIssue(r, 'attend-present'); if (iss) log.issues.push('stamp: ' + iss);
        await p.waitForTimeout(200); await s('1-trigger', 'present +200ms');
        await p.waitForTimeout(1000); await s('2-develop', 'present +1200ms');
        await p.waitForTimeout(1900); await settle(2000); await s('3-settled', 'present +3.1s');
      });
      log.errors = errors.slice(0, 10);
    } catch (e) { log.issues.push('fatal: ' + e.message); }
    finally { fs.writeFileSync(path.join(out, 'final-shots.json'), JSON.stringify(log, null, 1)); await b.close(); }
    console.log(code, log.frames.length + ' frames', log.issues.length ? 'issues: ' + log.issues.join(' | ') : 'ok');
  }
  console.log(JSON.stringify({ codes: codes.length, frames: Object.values(report).reduce((a, r) => a + r.frames.length, 0), issues: Object.fromEntries(Object.entries(report).map(([c, r]) => [c, r.issues.length])) }));
})();
