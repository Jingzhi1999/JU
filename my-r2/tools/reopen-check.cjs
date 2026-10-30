// Re-open check (my-r2): after a real 进入—操作—返回 (open 公园慢跑 3K, tear the printed ticket, back home), jump the same concept to
// 「已出票待撕」(j-d-tear) and verify the ticket comes back whole: the controller says printed + canTear, and the tear CTA is on screen,
// opaque and the topmost element at its centre. Catches ritual / CTA state that outlives the ticket it belonged to (C06, 2026-10-30).
// node my-r2/tools/reopen-check.cjs [C01 …] [--file <html>] [--rm]
const L = require('./_lib.cjs'); const path = L.path;
const codes = L.positionals().length ? L.positionals() : ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'];
const FILE = L.opt('file', '') ? path.resolve(L.opt('file')) : L.fileFor(null);
(async () => {
  const out = {};
  for (const code of codes) {
    const { b, p } = await L.launch(L.flag('rm') ? { reducedMotion: 'reduce' } : {});
    const issues = [];
    try {
      await L.openConcept(p, FILE, code, 900);
      const f = L.loadFlows()['enter-op-back']; await L.jump(p, code, f.jump, 900);
      for (const st of f.steps) { const iss = await L.runStep(p, code, st); if (iss) issues.push('flow: ' + iss.slice(0, 140)); }
      await L.jump(p, code, 'j-d-tear', 900); await p.waitForTimeout(3500);
      const s = await L.E(p, code, "var t = inst.ctlVals().ticket; var e = sr.querySelector('button[data-act=\"tear-now\"]') || sr.querySelector('button[data-act=\"tear\"]'); var o = { state: t.state, canTear: !!(t.tear && t.tear.canTear), cta: !!e }; if (e) { var r = e.getBoundingClientRect(), cs = getComputedStyle(e), op = 1, n = e; while (n && n.nodeType === 1) { op *= +getComputedStyle(n).opacity; n = n.parentElement || (n.parentNode && n.parentNode.host) || null; } var hit = sr.elementFromPoint ? sr.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null; o.opacity = Math.round(op * 100) / 100; o.visible = cs.visibility; o.onTop = !!(hit && (hit === e || e.contains(hit))); o.h = Math.round(r.height); o.cls = e.className; if (!o.onTop && hit) o.hit = hit.tagName + '.' + String(hit.className).split(' ').slice(0, 3).join('.'); o.y = Math.round(r.top); } return o;");
      out[code] = s;
      if (s.state !== 'printed' || !s.canTear) issues.push('ticket not back to printed / canTear: ' + JSON.stringify(s));
      else if (!s.cta || s.opacity < 0.9 || s.visible !== 'visible' || !s.onTop || !s.h) issues.push('tear CTA not usable: ' + JSON.stringify(s));
    } catch (e) { issues.push('fatal: ' + e.message); }
    finally { await b.close(); }
    out[code] = Object.assign(out[code] || {}, { issues });
    console.log(code, issues.length ? 'ISSUES ' + issues.join(' | ') : 'ok', JSON.stringify(out[code]));
  }
  console.log(JSON.stringify({ file: FILE, rm: L.flag('rm'), ok: Object.values(out).filter(x => !x.issues.length).length + '/' + codes.length }));
})();
