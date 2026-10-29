// my-r2 · env-probe: how much of the live environment each page lets through. Replaces the environment layer (.ju-env) with pure
// magenta, screenshots the given index states and leaves PNGs for env-count.py (pure magenta = exposed, magenta-hued = seen through).
// Usage: my-r2/tools/slot.sh timeout 600 node my-r2/tools/env-probe.cjs CNN <built.html> <outDir> [state,state,…]
// Rule (directions §0): every page, home and deep, shows the live environment — exposed + seen-through ≥ 10%.
const L = require('/home/user/JU/my-r2/tools/_lib.cjs');
const [code, file, outDir] = process.argv.slice(2);
const STATES = (process.argv[5] || 'j-home,h-home,j-d-invited,j-d-tear,h-m-review,j-d-ended,h-m-attendance').split(',');
(async () => {
  const { b, p } = await L.launch({ viewport: { width: 1000, height: 1000 } });
  await L.openConcept(p, file, code);
  await L.E(p, code, "if (window.JU && JU.shared && JU.shared.skins && inst.envRef && inst.envRef.current) JU.shared.skins.pause(inst.envRef.current); var st = document.createElement('style'); st.textContent = '.ju-env *{visibility:hidden!important}.ju-env{background:#ff00ff!important;background-image:none!important}'; (sr || document).appendChild(st); return true;");
  const out = [];
  for (const k of STATES) {
    await L.jump(p, code, k, 1100);
    await L.E(p, code, "var st = (sr || document).querySelector('style[data-envprobe]'); if (!st) { st = document.createElement('style'); st.setAttribute('data-envprobe', '1'); st.textContent = '.ju-env *{visibility:hidden!important}.ju-env{background:#ff00ff!important;background-image:none!important}'; (sr || document).appendChild(st); } return true;");
    await p.waitForTimeout(250);
    const r = await L.phoneRect(p, code); const f = `${outDir}/${code}-${k}.png`;
    await L.shot(p, r, f); out.push({ k, f });
  }
  console.log(JSON.stringify(out)); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
