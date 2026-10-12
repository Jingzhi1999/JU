// timeline probe: node probe.cjs <scenario> → JSON transitions
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = '/home/user/JU/.build/verify-C04.html';
const scen = process.argv[2];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto('file://' + path + '#concept/C04'); await p.waitForTimeout(800);
  const ev = (js, arg) => p.evaluate(([js, arg]) => { const m = window.JUShell.mounts.stage['stage:C04:']; const root = m.root, inst = m.instance; return new Function('root', 'inst', 'arg', js)(root, inst, arg); }, [js, arg]);
  const sleep = (ms) => p.waitForTimeout(ms);
  const snapD = `const q=s=>root.querySelector(s); const t=e=>e?e.textContent.trim().replace(/\\s+/g,' '):null;
    const pass=q('.pane .pass'); return JSON.stringify({sheet:!!q('.sheet.in'), tag:t(q('.pane .ph .tag')), state:t(q('.pane .ph .state')), pass: pass? pass.className:null, seat:t(q('.pane .pass .seatno')), result:t(q('.pane .result h3')), back: q('.pane .back')? q('.pane .back').disabled:null, acts:t(q('.pane .acts')), contact:!!q('.pane .contact'), vd: (()=>{const v=q('.pane .pass .frame'); return v? getComputedStyle(v).opacity:null})()});`;
  const snapM = `const q=s=>root.querySelector(s); const t=e=>e?e.textContent.trim().replace(/\\s+/g,' '):null;
    return JSON.stringify({sheet:!!q('.sheet.in'), life:t(q('.pane.mg .ph .life')), sub:t(q('.pane.mg .ph .sub')), cstage: q('.pane.mg .cstage')? q('.pane.mg .cstage').className:null, end:!!q('.pane.mg .endcomp'), caps:!!q('.pane.mg .capsrow'), mem:t(q('.pane.mg .mgsec .sec-h')), crack:(()=>{const c=q('.pane.mg .cstage .crack path'); return c? getComputedStyle(c).strokeDashoffset+'|'+getComputedStyle(c).strokeDasharray.slice(0,12):null})()});`;
  const watch = async (snap, ms) => { const out = []; let last = ''; const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await ev(snap); if (s !== last) { out.push([Date.now() - t0, JSON.parse(s)]); last = s; } await sleep(25); } return out; };
  let res = {};
  const speed = +(process.argv[3] || 1);
  if (scen === 'exit') {
    await ev(`inst.jumpTo('j-d-withdraw')`); await sleep(900); await ev(`inst.setSpeed(${speed})`); await sleep(50);
    await ev(`root.querySelector('.sheet [data-act="exit"]').click()`);
    res = await watch(snapD, speed === 1 ? 6000 : 10000);
  } else if (scen === 'decline') {
    await ev(`inst.jumpTo('j-d-reschedule')`); await sleep(900); await ev(`root.querySelector('.pane .bar2 .weak').click()`); await sleep(800); await ev(`inst.setSpeed(${speed})`); await sleep(50);
    await ev(`root.querySelector('.sheet [data-act="decline"]').click()`);
    res = await watch(snapD, speed === 1 ? 6000 : 10000);
  } else if (scen === 'cancel') {
    await ev(`inst.jumpTo('h-m-cancel')`); await sleep(1000); await ev(`inst.setSpeed(${speed})`); await sleep(50);
    await ev(`root.querySelector('.sheet [data-act="cancel"]').click()`);
    res = await watch(snapM, speed === 1 ? 7000 : 12000);
  } else if (scen === 'first') {
    await ev(`inst.jumpTo('j-history')`); await sleep(700); await ev(`inst.setSpeed(${speed})`);
    await ev(`root.querySelector('.stack.j .rw[data-rid="ramen"] .spine').click()`);
    res = await watch(snapD, speed === 1 ? 6000 : 10000);
  } else if (scen === 'print') {
    await ev(`inst.jumpTo('j-d-invited')`); await sleep(900); await ev(`inst.setSpeed(${speed})`); await ev(`root.querySelector('.pane .acts .cta').click()`); await sleep(1300);
    await ev(`const r=root.querySelector('.rules .rs'); r.scrollTop=99999; r.dispatchEvent(new Event('scroll'))`); await sleep(500);
    await ev(`root.querySelector('.rules [data-act="confirm"]').click()`);
    const snapP = `const q=s=>root.querySelector(s); const t=e=>e?e.textContent.trim().replace(/\\s+/g,' '):null; const pass=q('.pane .pass'); return JSON.stringify({rules:q('.rules')?q('.rules').className:null, tag:t(q('.pane .ph .tag')), state:t(q('.pane .ph .state')), pass: pass? pass.className:null, passVis: pass? getComputedStyle(pass).visibility+'/'+getComputedStyle(pass).opacity:null, hint:t(q('.pane .passwrap + .help')), weak: q('.pane .bar2 .weak')? q('.pane .bar2 .weak').disabled:null});`;
    res = await watch(snapP, speed === 1 ? 4500 : 8000);
  }
  console.log(JSON.stringify({ scen, speed, errors, res }, null, 0).replace(/\],\[/g, '],\n['));
  await b.close();
})();
