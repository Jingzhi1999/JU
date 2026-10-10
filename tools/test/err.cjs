const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', e => console.log('pageerror:', e.message, '\n', (e.stack || '').split('\n').slice(0, 3).join('\n')));
  await p.goto('file:///home/user/JU/JU-My-Ju-Fable51-10-Concepts.html'); await p.waitForTimeout(500);
  const info = await p.evaluate(() => ({ preact: typeof preact, DCMini: typeof DCMini, SRC: typeof window.__JU_SOURCES, shell: typeof window.JUShell }));
  console.log(JSON.stringify(info));
  await b.close();
})();
