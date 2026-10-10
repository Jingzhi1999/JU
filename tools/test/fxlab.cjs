const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { execSync } = require('child_process'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto('file:///home/user/JU/JU-My-Ju-Fable51-10-Concepts.html#concept/C00'); await p.waitForTimeout(1200);
  const host = await p.$('.stage-host.on');
  const dir = '/home/user/JU/tools/test/fx'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  let n = 0; const shot = async () => { await p.screenshot({ path: `${dir}/f${String(n++).padStart(2, '0')}.png`, clip: { x: 240, y: 90, width: 400, height: 560 } }); };
  const clickBtn = (t) => p.evaluate(([h, t]) => { [...h.shadowRoot.querySelectorAll('.fxrow button')].find(b => b.textContent === t).click(); }, [host, t]);
  await clickBtn('出票'); for (let i = 0; i < 6; i++) { await p.waitForTimeout(330); await shot(); }
  await p.waitForTimeout(400);
  // drag tear: find stub element position
  const r = await p.evaluate(h => { const e = h.shadowRoot.querySelector('.fx-side.stub'); const b = e.getBoundingClientRect(); return { x: b.left + b.width * 0.15, y: b.top + b.height * 0.85 }; }, host);
  await p.mouse.move(r.x, r.y); await p.mouse.down();
  for (let i = 1; i <= 6; i++) { await p.mouse.move(r.x - i * 12, r.y + i * 14, { steps: 3 }); await p.waitForTimeout(80); await shot(); }
  await p.mouse.up(); for (let i = 0; i < 3; i++) { await p.waitForTimeout(260); await shot(); }
  await clickBtn('燃烧'); for (let i = 0; i < 8; i++) { await p.waitForTimeout(330); await shot(); }
  execSync(`ffmpeg -y -loglevel error -framerate 1 -pattern_type glob -i '${dir}/f*.png' -vf "scale=300:-1,tile=6x4:padding=4:margin=4:color=white" '${dir}/sheet.png'`);
  console.log('frames', n); await b.close();
})();
