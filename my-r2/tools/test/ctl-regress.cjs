// Controller regression in a real browser: opens the private build of C00 (my-r2 wiring reference) with Playwright and drives the
// shared core through REAL clicks / keys / scrolls — 50 index jumps, nine click flows, the review clock, copy failure, keyboard tear,
// sheet focus, reduced motion. Usage:
//   JU_STANDALONE=/home/user/JU/.build/C00.html node my-r2/tools/test/ctl-regress.cjs
// The page is served over http://127.0.0.1 (a file:// page cannot be granted clipboard permission, and the copy path must be real).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const http = require('http');
const FILE = path.resolve(process.env.JU_STANDALONE || '/home/user/JU/.build/C00.html'); const CODE = process.env.JU_CODE || 'C00';
let fails = 0, passes = 0; const ok = (n, c, extra) => { if (c) passes++; else { fails++; console.log('FAIL', n, extra == null ? '' : JSON.stringify(extra)); } };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const html = fs.readFileSync(FILE, 'utf8');
  const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
  const server = http.createServer((req, res) => { const u = decodeURIComponent((req.url || '/').split('?')[0]); const fp = path.join(path.dirname(FILE), u); if (u !== '/' && u !== '/' + path.basename(FILE) && fs.existsSync(fp) && fs.statSync(fp).isFile()) { res.setHeader('content-type', MIME[path.extname(fp)] || 'application/octet-stream'); fs.createReadStream(fp).pipe(res); return; } res.setHeader('content-type', 'text/html; charset=utf-8'); res.end(html); }); await new Promise(r => server.listen(0, '127.0.0.1', r)); const url = 'http://127.0.0.1:' + server.address().port + '/' + path.basename(FILE) + '#concept/' + CODE;
  const b = await chromium.launch();
  const run = async (opts, fn) => { const ctx = await b.newContext(Object.assign({ viewport: { width: 1000, height: 1000 } }, opts)); try { await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: url.split('/').slice(0, 3).join('/') }); } catch (e) { } const p = await ctx.newPage(); const errors = []; p.on('pageerror', e => errors.push('page: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); }); await p.goto(url); await p.waitForTimeout(700); await p.evaluate(() => { const m = window.JUShell.mounts.stage[Object.keys(window.JUShell.mounts.stage)[0]]; const i = m && m.instance; const S = window.JU && window.JU.shared && window.JU.shared.skins; if (S && i && i.envRef && i.envRef.current) S.pause(i.envRef.current); }); /* headless SwiftShader: the live skin engine would drop the page to ~7 rAF/s and stall every rAF-driven ritual (see ctl-api §14) */ await fn(p, errors); await ctx.close(); return errors; };
  const inst = (p, js, arg) => p.evaluate(([js, arg]) => { const m = window.JUShell.mounts.stage['stage:' + (window.__JU_META[0].code) + ':']; const inst = m.instance, root = m.root; return new Function('inst', 'root', 'arg', 'JU', js)(inst, root, arg, window.JU); }, [js, arg]);
  const phone = (p) => p.locator('.stage-host.on .ju-phone');
  const click = async (p, sel, opts) => { const l = phone(p).locator(sel).first(); await l.scrollIntoViewIfNeeded().catch(() => { }); await l.click(Object.assign({ timeout: 4000 }, opts || {})); await p.waitForTimeout((opts && opts.after) || 120); };
  /* a real pointer click at the element's current box WITHOUT scrolling anything first (for scroll-memory checks) */
  const clickAt = async (p, sel) => { const bb = await phone(p).locator(sel).first().boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + Math.min(bb.height / 2, 40)); await p.waitForTimeout(120); };
  const surface = (p) => inst(p, 'return inst.state.nav.stack[inst.state.nav.stack.length-1].s');
  const stage = (p, id) => inst(p, 'return inst.state.data.joined.filter(function(x){return x.eventId===arg})[0].stage', id);
  const text = (p) => phone(p).evaluate(el => el.textContent);
  /* settle = the fixed wait AND the navigation back at rest: under heavy machine load (several Chromium builders, live WebGL
     backgrounds) a 360ms nav timer can land long after 450ms, and a click measured mid-slide hits empty space */
  const settled = async (p, ms) => { await p.waitForTimeout(ms || 450); const t0 = Date.now(); while (Date.now() - t0 < 4000) { const ph = await p.evaluate(() => { try { const m = window.JUShell.mounts.stage['stage:' + window.__JU_META[0].code + ':']; return m.instance.state.nav.phase; } catch (e) { return 'idle'; } }); if (ph === 'idle') break; await p.waitForTimeout(100); } };
  const banned = /扣分|信用分|信用等级|剩余次数|(?<!不会自动|不自动|不)处罚/;  /* 「不会自动处罚」是 V27 原文的否定句，允许 */
  /* wait until a condition holds (the shared rituals are async: fonts.ready + rig.ready + rAF + the real 2.3s print) */
  const until = async (p, js, ms, step) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 4000)) { if (await inst(p, js)) return true; await p.waitForTimeout(step || 100); } return false; };
  const GRAB = '[data-tear] [role="button"]';

  /* ---------------- 1. index: 50 jumps, renderVals, surfaces, console, banned words ---------------- */
  let errs = await run({}, async (p) => {
    const idx = await p.evaluate(() => window.JU.INDEX.map(e => ({ key: e.key, open: e.open || null, role: e.role, section: e.section || 'current' })));
    ok('index has 50 entries', idx.length === 50, idx.length);
    let bad = [];
    for (const e of idx) {
      await inst(p, `inst.jumpTo(arg.key); return true;`, e); await p.waitForTimeout(300);
      const got = await inst(p, `try { var v = inst.renderVals(); var c = v.c; var top = inst.state.nav.stack[inst.state.nav.stack.length-1]; return { ok: true, cur: top.s, depth: inst.state.nav.stack.length, role: inst.state.role, section: inst.state.section, sheet: !!inst.state.sheet, surf: !!root.querySelector('[data-surface="' + top.s + '"]'), contact: !!(c.ticket.on && c.ticket.contact.on), manageOn: c.manage.on && !c.manage.missing }; } catch (err) { return { ok: false, err: String(err && err.stack || err).slice(0, 300) }; }`);
      const want = e.open ? ({ contact: 'ticket', 'reschedule-reply': 'reply', withdraw: 'ticket' }[e.open.surface] || e.open.surface) : 'home';
      if (!got.ok) bad.push(e.key + ' renderVals threw: ' + got.err);
      else { if (got.cur !== want || !got.surf) bad.push(e.key + ' surface ' + got.cur + ' (want ' + want + ')'); if (got.role !== e.role || got.section !== e.section) bad.push(e.key + ' role/section ' + got.role + '/' + got.section); if (e.open && got.depth < 2) bad.push(e.key + ' stack depth ' + got.depth); if (e.open && e.open.surface === 'contact' && !got.contact) bad.push(e.key + ' contact layer closed'); if (e.open && (e.open.surface === 'withdraw' || /^(reschedule|cancel|end|card)$/.test(e.open.tab || '')) && !got.sheet) bad.push(e.key + ' sheet missing'); if (e.open && e.open.surface === 'manage' && !got.manageOn) bad.push(e.key + ' manage missing'); }
      const t = await text(p); const m = t.match(banned); if (m) bad.push(e.key + ' banned word ' + m[0]);
    }
    ok('all 50 jumps reach their surface with a clean renderVals and no banned words', bad.length === 0, bad.slice(0, 6));
  });
  ok('no console / page errors during the 50 jumps', errs.length === 0, errs.slice(0, 4));

  /* ---------------- 2. nine real click flows ---------------- */
  errs = await run({}, async (p) => {
    // (a) detail + back with scroll memory
    await inst(p, `root.querySelector('[data-scroller="home"]').scrollTop = 120; root.querySelector('[data-scroller="home"]').dispatchEvent(new Event('scroll'))`); await p.waitForTimeout(60);
    const hc = await inst(p, `return root.querySelector('[data-surface="home"]').style.getPropertyValue('--hc')`); ok('--hc written on scroll', +hc > 0.9 && +hc <= 1, hc);
    await clickAt(p, '[data-rid="livehouse"]'); await settled(p); ok('row → reply (livehouse is 改期待答复)', await surface(p) === 'reply');
    const from = await inst(p, `return inst.state.nav.stack[1].from && inst.state.nav.stack[1].key`); ok('origin rect + key captured', from === 'row-livehouse', from);
    await click(p, '[data-surface="reply"] [data-act="back"]'); await settled(p); ok('back → home', await surface(p) === 'home');
    const st = await inst(p, `return root.querySelector('[data-scroller="home"]').scrollTop`); ok('scroll position restored after back', st === 120, st);
    const land = await inst(p, `return inst.state.ui.landKey`); ok('landing key marks the origin row', land === 'row-livehouse', land);
    await inst(p, `root.querySelector('[data-scroller="home"]').scrollTop = 0`);
    await click(p, '[data-rid="brunch"]'); await settled(p); ok('row → detail', await surface(p) === 'detail');
    /* under heavy machine load (several Chromium builders at once) the 300ms exit timer can land after a fixed 450ms wait: poll */
    await click(p, '[data-surface="detail"] [data-act="back"]'); ok('back → home (detail)', await until(p, `return inst.state.nav.stack[inst.state.nav.stack.length - 1].s === 'home' && inst.state.nav.phase === 'idle'`, 2500), await inst(p, `return inst.state.nav.phase + ' / ' + inst.state.nav.stack.map(function (e) { return e.s; }).join('>') + ' / ' + inst.state.nav.dir`));
    // (b) read → confirm → formed → ticket printing
    await click(p, '[data-rid="brunch"] [data-act="cta"]'); await settled(p); ok('CTA → read (stack home>read: no unvisited detail underneath)', await inst(p, `return inst.state.nav.stack.map(function(x){return x.s}).join('>')`) === 'home>read');
    const disabledBefore = await phone(p).locator('[data-surface="read"] [data-act="confirm"]').first().isDisabled(); ok('confirm disabled before reading to the end', disabledBefore);
    await inst(p, `var s = root.querySelector('[data-scroller="read"]'); s.scrollTop = s.scrollHeight; s.dispatchEvent(new Event('scroll'));`); await p.waitForTimeout(80);
    ok('reading to the end enables confirm', !(await phone(p).locator('[data-surface="read"] [data-act="confirm"]').first().isDisabled()));
    await inst(p, `inst.armFail()`); await click(p, '[data-surface="read"] [data-act="confirm"]', { after: 10 }); ok('处理中 visible (busy ≥ processMs before the engine runs)', await until(p, `return !!inst.state.ui.busy.confirm`, 500, 20) && (await text(p)).indexOf('处理中') >= 0); await settled(p, 600);
    ok('armed failure lands in place with 重试', (await phone(p).locator('[data-surface="read"] [data-act="retry"]').count()) === 1 && await stage(p, 'brunch') === 'invited');
    await click(p, '[data-surface="read"] [data-act="retry"]'); await settled(p, 600); ok('retry confirms → formed → tear', await stage(p, 'brunch') === 'tear' && (await inst(p, `return inst.state.ui.fx.type`)) === 'formed');
    await click(p, '[data-surface="read"] [data-act="ticket"]'); await settled(p); ok('查看票根 → ticket printing', await surface(p) === 'ticket' && (await inst(p, `return inst.ctlVals().ticket.state`)) === 'printing');
    const noStubBtn = await phone(p).locator('[data-act="tear-now"]').count(); ok('no tear button while printing', noStubBtn === 0);
    ok('printed after the shared print ritual (≈2.3s + rig ready)', await until(p, `return inst.ctlVals().ticket.state === 'printed'`, 7000)); ok('stub rig mounted + grab layer focusable', (await phone(p).locator(GRAB).count()) === 1);
    // (c) tear by keyboard (Enter on the stub) → contact → copy (real clipboard) → 已加微信
    await phone(p).locator(GRAB).first().focus(); await p.keyboard.press('Enter');
    ok('Enter on the grab layer tears: the write happens at detach (≈360ms), before the fall', await until(p, `return inst.state.data.joined[0].stage === 'contact'`, 2500) && (await inst(p, `return inst.ctlVals().ticket.state`)) === 'torn');
    ok('contact layer revealed by the module after the fall (1080ms + 300ms)', await until(p, `return !!root.querySelector('[data-contact-reveal][data-revealed="true"]')`, 4000));
    ok('action button shown 850ms after the fall', await until(p, `return !!root.querySelector('[data-contact-action][data-shown="true"]')`, 3000));
    await click(p, '[data-contact-reveal] [data-act="copy"]'); await p.waitForTimeout(300);
    const clip = await p.evaluate(() => navigator.clipboard.readText().catch(() => '')); const copyOk = await inst(p, `return inst.state.ui.copy && inst.state.ui.copy.ok`);
    ok('copy reports success only after the real clipboard write', copyOk === true && clip === 'ameng.nyc', { copyOk, clip });
    await click(p, '[data-contact-action]'); await settled(p, 500); ok('已加微信 → going (write first, the module paints 待赴约 after)', await stage(p, 'brunch') === 'going' && (await inst(p, `return root.querySelector('[data-contact-action] [data-slot="actionLabel"]').textContent`)) === '待赴约');
    // (d) reschedule accept (livehouse) + decline (fresh)
    await inst(p, `inst.reset('default')`); await p.waitForTimeout(150);
    await click(p, '[data-rid="livehouse"]'); await settled(p); ok('reschedule row → reply', await surface(p) === 'reply'); ok('reissued ticket printed (原定 line + 时间已改 mark)', await until(p, `return inst.ctlVals().ticket.state === 'printed'`, 7000) && (await inst(p, `return !root.querySelector('[data-surface="reply"] [data-slot="previous"]').hidden && !root.querySelector('[data-surface="reply"] [data-slot="mark"]').hidden`)));
    await click(p, '[data-act="accept"]'); ok('accept = tear new ticket → going (微信沿用) + toast', await until(p, `return inst.state.data.joined[1].stage === 'going'`, 2500) && (await text(p)).indexOf('已接受改期') >= 0);
    await inst(p, `inst.reset('default')`); await p.waitForTimeout(150); await click(p, '[data-rid="livehouse"]'); await settled(p); await until(p, `return inst.ctlVals().ticket.state === 'printed'`, 7000);
    await click(p, '[data-surface="reply"] [data-act="decline"]'); await p.waitForTimeout(150); ok('decline → confirm sheet', (await phone(p).locator('.c00-over [data-act="ok"]').count()) === 1);
    await click(p, '.c00-over [data-act="ok"]'); await settled(p, 600); ok('declined → burn result on the ticket (JURitual.burn B running on the stage)', await stage(p, 'livehouse') === 'declined' && (await inst(p, `return inst.ctlVals().ticket.result && inst.ctlVals().ticket.result.burn`)) === true && (await inst(p, `var st = root.querySelector('[data-surface="reply"] .c00-stage'); return st && st.dataset.state === 'burning' && !!st.querySelector('[data-burn] canvas')`)) === true);
    await click(p, '[data-surface="reply"] [data-act="ok"]'); await settled(p); ok('查看退出结果 → history', await surface(p) === 'history');
    // (e) waitlist leave
    await inst(p, `inst.reset('default')`); await p.waitForTimeout(150); await click(p, '[data-rid="vintage"]'); await settled(p); ok('waitlist door', await surface(p) === 'waitlist' && (await text(p)).indexOf('L**') >= 0);
    await click(p, '[data-act="leave-queue"]'); await p.waitForTimeout(120); await click(p, '.c00-over [data-act="ok"]'); await settled(p, 600); ok('left queue → result', await stage(p, 'vintage') === 'queue_left' && (await text(p)).indexOf('已退出候补') >= 0);
    // (f) host: approve / reject → counts + seats
    await inst(p, `inst.reset('default')`); await p.waitForTimeout(150); await click(p, '[data-role-tab="hosted"]'); await settled(p); ok('role switch', (await inst(p, `return inst.state.role`)) === 'hosted');
    await click(p, '[data-rid="bar"]'); await settled(p); ok('host row → manage review', await surface(p) === 'manage' && (await inst(p, `return inst.state.nav.stack[1].p.intent`)) === 'review');
    const before = await inst(p, `var v = inst.ctlVals().manage; return { apps: v.apps.count, reserved: v.head.progress.reserved, roster: v.roster.rows.length, status: v.head.status }`);
    await click(p, '[data-section="apps"] [data-act="approve"]'); await settled(p, 600);
    const after = await inst(p, `var v = inst.ctlVals().manage; return { apps: v.apps.count, reserved: v.head.progress.reserved, roster: v.roster.rows.length, handled: v.apps.handled, status: v.head.status, fx: inst.state.ui.fx.type }`);
    ok('approve → 待审 −1 · 预留 +1 · roster +1 · result in place', after.apps === before.apps - 1 && after.reserved === before.reserved + 1 && after.roster === before.roster + 1 && after.handled === 1 && after.fx === 'invited' && (await text(p)).indexOf('已发出邀请') >= 0, { before, after });
    await click(p, '[data-section="apps"] [data-act="reject"]'); await settled(p, 600);
    const after2 = await inst(p, `var v = inst.ctlVals().manage; return { apps: v.apps.count, reserved: v.head.progress.reserved, status: v.head.status, badge: inst.ctlVals().hosted.badge }`);
    ok('reject → 待审 −1 · seats unchanged · head status + badge recomputed', after2.apps === 0 && after2.reserved === after.reserved && after2.status === '2 人已预留 · 等确认' && after2.badge === 1, after2);
    // (g) reschedule → replies
    await click(p, '[data-surface="manage"] [data-act="back"]'); await settled(p); await click(p, '[data-rid="wine"]'); await settled(p);
    await click(p, '[data-act="propose"]'); await p.waitForTimeout(150); ok('reschedule sheet opens with ok disabled (same time)', await phone(p).locator('.c00-over [data-act="ok"]').first().isDisabled());
    await phone(p).locator('[data-field="time"]').first().fill('20:30'); await p.waitForTimeout(80); ok('new time enables ok', !(await phone(p).locator('.c00-over [data-act="ok"]').first().isDisabled()));
    await click(p, '.c00-over [data-act="ok"]'); await settled(p, 600);
    const g = await inst(p, `var v = inst.ctlVals().manage; return { on: v.replies.on, total: v.replies.total, when: v.head.when.time, toast: inst.state.toast && inst.state.toast.text, status: v.head.status }`);
    ok('改时间 → 答复区 4 人 · 局卡时间重印 · toast', g.on && g.total === 4 && g.when === '20:30' && g.toast === '已改时间 · 等 4 位成员答复' && g.status === '4 人未答复新时间', g);
    // (h) cancel → history
    await click(p, '[data-surface="manage"] [data-act="back"]'); await settled(p); await click(p, '[data-rid="cards"]'); await settled(p);
    await click(p, '[data-act="cancel"]'); await p.waitForTimeout(150); ok('cancel sheet lists affected people', (await text(p)).indexOf('会受影响的人') >= 0);
    await click(p, '.c00-over [data-act="ok"]'); await settled(p, 600);
    const h = await inst(p, `var v = inst.ctlVals().manage; return { cancelled: v.head.cancelled, status: v.head.status, fx: inst.state.ui.fx.type, roster1: v.roster.rows[1] && v.roster.rows[1].stateText, arrange: v.arrange.canCancel }`);
    ok('cancelled → head 已取消 · void roster · no more arrange actions · fx cancelled', h.cancelled && h.status === '已取消' && h.fx === 'cancelled' && h.roster1 === '取消前已确认' && !h.arrange, h);
    await click(p, '[data-surface="manage"] [data-act="back"]'); await settled(p); await click(p, '[data-section-tab="history"]'); await settled(p);
    ok('cancelled event sits in host history', (await phone(p).locator('[data-rid="cards"]').count()) === 1 && (await text(p)).indexOf('票根作废') >= 0);
    // (i) end → attendance → stamp → correct → trail
    await inst(p, `inst.reset('default')`); await p.waitForTimeout(150); await click(p, '[data-role-tab="hosted"]'); await settled(p); await click(p, '[data-rid="wine"]'); await settled(p);
    await click(p, '[data-act="end"]'); await p.waitForTimeout(150); await click(p, '.c00-over [data-act="ok"]'); await settled(p, 600);
    const i1 = await inst(p, `var v = inst.ctlVals().manage; return { intent: v.intent, att: v.attendance.on, rows: v.attendance.rows.length, rec: v.attendance.rec, status: v.head.status }`);
    ok('记为散场 → intent attendance · 4 rows · status N 人出席未记录', i1.intent === 'attendance' && i1.att && i1.rows === 4 && i1.rec === 0 && i1.status === '4 人出席未记录', i1);
    await click(p, '[data-section="attendance"] [data-act="attend-present"]'); await p.waitForTimeout(120);
    const i2 = await inst(p, `var v = inst.ctlVals().manage; var r = v.attendance.rows[0]; return { rec: v.attendance.rec, fresh: r.stampFresh, next: v.attendance.focusNext === v.attendance.rows[1].id, focused: (function(){ var a = root.getRootNode().activeElement; return a && a.closest('[data-rid]') && a.closest('[data-rid]').getAttribute('data-rid'); })(), nextId: v.attendance.rows[1].id }`);
    ok('出席 writes at once · stamp fresh · focus moves to the next person', i2.rec === 1 && i2.fresh && i2.next && i2.focused === i2.nextId, i2);
    await click(p, '[data-section="attendance"] [data-rid] [data-act="correct"]'); await p.waitForTimeout(80); await click(p, '[data-section="attendance"] [data-act="attend-absent"]'); await p.waitForTimeout(120);
    const i3 = await inst(p, `var r = inst.ctlVals().manage.attendance.rows[0]; return { v: r.value, trail: r.trail, show: r.showTrail, focused: (function(){ var a = root.getRootNode().activeElement; return a && a.closest('[data-rid]') && a.closest('[data-rid]').getAttribute('data-rid'); })(), id: r.id }`);
    ok('更正 leaves a trail', i3.v === 'absent' && i3.show && i3.trail.length === 2 && i3.trail[0].indexOf('更正 出席 → 未出席') === 0, i3);
    ok('更正 keeps focus on the corrected person (C03 report)', i3.focused === i3.id, i3);
    // (j) drafts: delete → undo (original slot)
    await click(p, '[data-surface="manage"] [data-act="back"]'); await settled(p); await click(p, '[data-section-tab="drafts"]'); await settled(p);
    const d0 = await inst(p, `return inst.ctlVals().hosted.drafts.map(function(x){return x.id}).join(',')`);
    await click(p, '[data-act="delete"]', { after: 20 }); ok('deleted → ghost collapsing + undo bar', (await inst(p, `var h = inst.ctlVals().hosted; return h.undo.on && h.drafts[0] && h.drafts[0].ghost && inst.state.data.drafts.length === 0`)) === true);
    await p.waitForTimeout(400); ok('ghost gone, empty state while undo is open', (await inst(p, `var h = inst.ctlVals().hosted; return h.drafts.length === 0 && h.empty.on && h.undo.on`)) === true);
    await click(p, '[data-act="undo"]'); await p.waitForTimeout(80); ok('undo restores the draft in its slot', (await inst(p, `return inst.ctlVals().hosted.drafts.map(function(x){return x.id}).join(',')`)) === d0 && (await inst(p, `return inst.ctlVals().hosted.undo.on`)) === false);
  });
  ok('no console / page errors during the click flows', errs.length === 0, errs.slice(0, 4));

  /* ---------------- 3. clock: tick only with deadline rows, settle on advance, queue promotion ---------------- */
  errs = await run({}, async (p) => {
    await inst(p, `JU.resetClock(); inst.reset('default')`); await p.waitForTimeout(1300);
    ok('countdown tick runs on 我参加的 · 当前', (await inst(p, `return !!(inst._keyed && inst._keyed.tick)`)) === true);
    const l1 = await inst(p, `return inst.ctlVals().joined.lead.left.text`); await p.waitForTimeout(1200); const l2 = await inst(p, `return inst.ctlVals().joined.lead.left.text`); ok('countdown changes every second', l1 !== l2, [l1, l2]);
    await click(p, '[data-section-tab="history"]'); await p.waitForTimeout(1300); ok('tick stops when no deadline row is visible', (await inst(p, `return !(inst._keyed && inst._keyed.tick)`)) === true);
    await click(p, '[data-section-tab="current"]'); await settled(p);
    await inst(p, `inst.advanceClock(65 * 60000 + 1000)`); await p.waitForTimeout(150);
    const q1 = await inst(p, `var it = inst.state.data.joined.filter(function(x){return x.eventId==='vintage'})[0]; return { pos: it.queuePos, fx: inst.state.ui.fx.type, settled: inst.state.ui.settled }`);
    ok('+65min: 花卷 expires → Leon invited → my queue position 2 → 1 (effects emitted)', q1.pos === 1 && q1.settled >= 1, q1);
    await inst(p, `inst.advanceClock(4 * 3600000)`); await p.waitForTimeout(150);
    const q2 = await inst(p, `var v = inst.ctlVals().joined; return { brunch: inst.state.data.joined[0].stage, closed: v.groups.closed.map(function(r){return r.id}), left: v.groups.closed[0].leftText }`);
    ok('+5h05: my brunch reservation expires → 未成行 · 预留已到期 · 00:00:00', q2.brunch === 'expired' && q2.closed.indexOf('brunch') >= 0, q2);
    await inst(p, `inst.toNextDeadline()`); await p.waitForTimeout(150);
    const q3 = await inst(p, `var it = inst.state.data.joined.filter(function(x){return x.eventId==='vintage'})[0]; return { stage: it.stage, pos: it.queuePos, label: inst.ctlVals().joined.current.filter(function(r){return r.id==='vintage'})[0].label }`);
    ok('到最近到期: Leon expires → my turn → invited_queue (候补轮到 · 已预留)', q3.stage === 'invited_queue' && q3.label === '候补轮到 · 已预留', q3);
    await click(p, '[data-role-tab="hosted"]'); await settled(p); await click(p, '[data-rid="cards"]'); await settled(p);
    const q4 = await inst(p, `var v = inst.ctlVals().manage; return { leaves: v.leaves.rows.map(function(l){return l.nick+':'+l.text}), queue: v.queue.on, roster: v.roster.rows.map(function(r){return r.nick+':'+r.stateText}) }`);
    ok('host side settled: Leon 预留到期 in 离开记录, one freed seat → 西西 invited in order, 小满 still queued (cards capacity 3)', q4.leaves.some(x => x === 'Leon:预留到期') && q4.queue && q4.roster.some(x => x === '西西:已预留'), q4);
    await inst(p, `JU.resetClock()`);
  });
  ok('no console / page errors during the clock checks', errs.length === 0, errs.slice(0, 4));

  /* ---------------- 4. copy failure branch (armed) + retry ---------------- */
  errs = await run({}, async (p) => {
    await inst(p, `inst.jumpTo('j-d-contact')`); ok('jumped contact layer revealed', await until(p, `return !!root.querySelector('[data-contact-reveal][data-revealed="true"]')`, 3000)); await inst(p, `inst.armCopyFail()`);
    await click(p, '[data-contact-reveal] [data-act="copy"]'); await p.waitForTimeout(300);
    const f = await inst(p, `return { fail: inst.state.ui.copy && inst.state.ui.copy.ok === false, toast: inst.state.toast && inst.state.toast.text, armed: inst.state.data.flags.copyFailNext, retry: !!root.querySelector('.c00-copyfail [data-act="retry"]'), hint: root.querySelector('[data-surface="ticket"]').textContent.indexOf('长按') >= 0, moduleErr: root.querySelector('[data-contact-reveal] .ju-form-error').textContent }`);
    ok('armed copy failure → the module shows its own error (the only message: no toast on top), the controller keeps manual hint + 重试, flag consumed', f.fail && !f.toast && !f.armed && f.retry && f.hint && f.moduleErr === '复制失败，请长按账号复制', f);
    await click(p, '.c00-copyfail [data-act="retry"]'); await p.waitForTimeout(300);
    ok('retry copies for real', (await inst(p, `return inst.state.ui.copy && inst.state.ui.copy.ok`)) === true && (await p.evaluate(() => navigator.clipboard.readText())) === 'dantat.coffee');
  });
  ok('no errors during copy checks', errs.length === 0, errs.slice(0, 4));

  /* ---------------- 5. tear gesture: half drag snaps back, full drag tears; sheet focus (Tab cycle / Esc / return) ---------------- */
  errs = await run({}, async (p) => {
    await inst(p, `inst.jumpTo('j-d-tear')`); ok('jumped ticket: settled paper + stub rig', await until(p, `var g = root.querySelector('[data-tear] [role="button"]'); return !!g && root.querySelector('[data-surface="ticket"] .c00-stage').dataset.state === 'ready'`, 4000));
    const grab = phone(p).locator(GRAB).first(); const bb = await grab.boundingBox(); const y = bb.y + bb.height * 0.55;
    await p.mouse.move(bb.x + 24, y); await p.mouse.down(); await p.mouse.move(bb.x + 24 + 60, y, { steps: 6 }); await p.waitForTimeout(60);
    const mid = await inst(p, `return inst._tearRig ? inst._tearRig.p : -1`); ok('drag maps to the rig progress (below SNAP .5)', mid > 0.1 && mid < 0.5, mid);
    await p.mouse.up(); await p.waitForTimeout(500); ok('release below threshold retracts, nothing written', (await inst(p, `return inst._tearRig ? inst._tearRig.p : -1`)) < 0.1 && await stage(p, 'run3k') === 'tear');
    await p.mouse.move(bb.x + 24, y); await p.mouse.down(); await p.mouse.move(bb.x + 24 + 200, y, { steps: 10 }); await p.mouse.up();
    ok('drag past SNAP auto-completes: detach writes first, then the stub falls', await until(p, `return inst.state.data.joined.filter(function(x){return x.eventId==='run3k'})[0].stage === 'contact'`, 2500) && (await inst(p, `return inst.ctlVals().ticket.state`)) === 'torn');
    // sheet focus: open exit sheet from the header link
    await inst(p, `inst.jumpTo('j-d-going')`); await p.waitForTimeout(300);
    await click(p, '[data-surface="ticket"] [data-act="exit"]'); await p.waitForTimeout(150);
    const fo = await inst(p, `var a = root.getRootNode().activeElement; return { inDialog: !!(a && a.closest('[role="dialog"]')), tag: a && a.tagName, act: a && a.getAttribute('data-act') }`);
    ok('sheet open → focus enters the dialog (first control)', fo.inDialog, fo);
    await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); const cyc = await inst(p, `var a = root.getRootNode().activeElement; return !!(a && a.closest('[role="dialog"]'))`); ok('Tab cycles inside the dialog', cyc);
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    const back = await inst(p, `var a = root.getRootNode().activeElement; return { sheet: !!inst.state.sheet, act: a && a.getAttribute('data-act') }`);
    ok('Esc closes and focus returns to the trigger', !back.sheet && back.act === 'exit', back);
  });
  ok('no errors during tear / focus checks', errs.length === 0, errs.slice(0, 4));

  /* ---------------- 6. reduced motion (system prefers-reduced-motion): flows complete with final states ---------------- */
  errs = await run({ reducedMotion: 'reduce' }, async (p) => {
    ok('rmSys detected', (await inst(p, `return inst.state.review.rmSys`)) === true);
    await click(p, '[data-rid="brunch"] [data-act="cta"]'); await p.waitForTimeout(120); ok('rm: read reached instantly', await surface(p) === 'read');
    await inst(p, `var s = root.querySelector('[data-scroller="read"]'); s.scrollTop = s.scrollHeight; s.dispatchEvent(new Event('scroll'));`); await p.waitForTimeout(60);
    await click(p, '[data-surface="read"] [data-act="confirm"]'); await settled(p, 600); ok('rm: 处理中 still real time, then formed', await stage(p, 'brunch') === 'tear');
    await click(p, '[data-surface="read"] [data-act="ticket"]'); ok('rm: printed at once (JuPrint 1ms, no 2.3s print)', await until(p, `return inst.ctlVals().ticket.state === 'printed'`, 1500));
    await phone(p).locator(GRAB).first().focus(); await p.keyboard.press('Enter');
    ok('rm: Enter tears at once (direct detach) + contact layer at 0ms', await until(p, `return inst.state.data.joined[0].stage === 'contact' && !!root.querySelector('[data-contact-reveal][data-revealed="true"]')`, 1500)); await p.waitForTimeout(250);
    const anims = await inst(p, `var ph = root.querySelector('.ju-phone'); var long = []; (ph.getAnimations ? ph.getAnimations({ subtree: true }) : []).forEach(function (a) { var t = a.effect && a.effect.getTiming ? a.effect.getTiming() : null; if (t && t.duration > 1 && a.playState === 'running') long.push((a.animationName || 'transition') + ':' + t.duration); }); return long;`);
    ok('rm: no animation longer than 1ms is running', anims.length === 0, anims);
    await inst(p, `inst.jumpTo('h-m-cancel')`); await p.waitForTimeout(200); await click(p, '.c00-over [data-act="ok"]'); await settled(p, 600);
    ok('rm: cancel completes with the stable end state', (await inst(p, `return inst.ctlVals().manage.head.status`)) === '已取消');
  });
  ok('no errors under reduced motion', errs.length === 0, errs.slice(0, 4));

  await b.close(); server.close();
  console.log((fails ? 'FAILED ' + fails + ' / ' : 'ctl-regress OK · ') + passes + ' checks passed');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
