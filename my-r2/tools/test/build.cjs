// Build regression (my-r2): (1) build.js must not crash when the core / concepts list / docs are missing (parallel work),
// (2) with every marker present it must inject the panel, the fx svg, the core banner, the shared modules and CONCEPT in the
// right places, (3) a source with missing markers is skipped with a warning, (4) JU_ONLY filters and internal concepts need naming,
// (5) /* @shared-css */ receives the shared CSS when present, (6) window.__JU_INDEX carries the 50 states, (7) the shell data
// script never contains a raw "</script".
// node my-r2/tools/test/build.cjs      (writes only under .build/test-build/, never the shared outputs)
const fs = require('fs'); const path = require('path'); const { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..', '..'); const T = path.join(ROOT, '.build', 'test-build');
fs.rmSync(T, { recursive: true, force: true }); fs.mkdirSync(T, { recursive: true });
let fails = 0; const ok = (name, cond, info) => { if (!cond) { fails++; console.log('FAIL', name, info ? JSON.stringify(info).slice(0, 300) : ''); } };
function build(env, extra) { const r = spawnSync('node', [path.join(ROOT, 'my-r2/src/build.js')], { cwd: ROOT, env: Object.assign({}, process.env, env, extra || {}), encoding: 'utf8', timeout: 120000 }); return { code: r.status, out: r.stdout || '', err: r.stderr || '' }; }
const coreDir = fs.existsSync(path.join(ROOT, 'my-r2/src/core/ju-review.js')) ? 'my-r2/src/core' : 'src/core';
/* fixture concept with every marker */
const fixture = (opts) => `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>T01 fixture</title></head><body><x-dc><helmet><style>
body{margin:0}
${opts.noPanelCss ? '' : '/* @panel-css */'}
${opts.sharedCss ? '/* @shared-css */' : ''}
.app{position:absolute;inset:0}
</style></helmet>
<div class="ju-stage"><div class="ju-phone{{panel.phoneCls}}" style="{{panel.phoneStyle}}"><div class="app t01{{panel.rootCls}}" ref="{{rootRef}}"><p>fixture</p></div>
<!-- @fx-svg -->
</div>
<!-- @panel -->
</div></x-dc>
<script type="text/x-dc" data-dc-script data-props='{"panel":{"editor":"boolean","default":true}}'>
/* @core */
class Component extends DCLogic { constructor(p) { super(p); } renderVals() { return { panel: { show: false, phoneCls: '', phoneStyle: '', rootCls: '' }, rootRef: { current: null } }; } }
</script></body></html>`;
fs.writeFileSync(path.join(T, 'T01.dc.html'), fixture({}));
fs.writeFileSync(path.join(T, 'T02.dc.html'), fixture({ noPanelCss: true }));
fs.writeFileSync(path.join(T, 'T03.dc.html'), fixture({ sharedCss: true }));
fs.writeFileSync(path.join(T, 'concepts.json'), JSON.stringify([
  { code: 'T00', file: 'T00.dc.html', name: 'internal', line: 'x', internal: true },
  { code: 'T01', file: 'T01.dc.html', name: '夹具一', line: '全部标记' },
  { code: 'T02', file: 'T02.dc.html', name: '夹具二', line: '缺 panel-css 标记' },
  { code: 'T03', file: 'T03.dc.html', name: '夹具三', line: '有 shared-css 标记' },
  { code: 'T04', file: 'T04.dc.html', name: '夹具四', line: '源文件不存在' }
]));
fs.writeFileSync(path.join(T, 'T00.dc.html'), fixture({}));
/* (1) nothing present: no core, no list → still exit 0, still writes the standalone */
const empty = path.join(T, 'empty'); fs.mkdirSync(empty, { recursive: true });
let r = build({ JU_STANDALONE: path.join(T, 'none.html'), JU_CONCEPTS: path.join(T, 'missing.json'), JU_CORE_DIR: empty, JU_SHARED_DIR: empty, JU_EVIDENCE_INDEX: path.join(T, 'no-index.json') });
ok('empty build exits 0', r.code === 0, { code: r.code, err: r.err.slice(0, 300) });
ok('empty build warns about the missing list', /no concepts list/.test(r.err), r.err.slice(0, 200));
ok('empty build warns about missing core', /missing core/.test(r.err));
ok('empty build writes the standalone', fs.existsSync(path.join(T, 'none.html')));
{ const html = fs.readFileSync(path.join(T, 'none.html'), 'utf8'); ok('empty build: 0 sources, empty index', /__JU_SOURCES=\{\}/.test(html) && /__JU_INDEX=\[\]/.test(html)); ok('empty build keeps the shell js', /window\.JUShell/.test(html)); }
/* (2)–(7) fixtures with the real core */
r = build({ JU_STANDALONE: path.join(T, 'fx.html'), JU_CONCEPTS: path.join(T, 'concepts.json'), JU_CONCEPTS_DIR: T, JU_CORE_DIR: coreDir });
ok('fixture build exits 0', r.code === 0, { code: r.code, err: r.err.slice(0, 400) });
ok('T02 skipped with a markers warning', /markers missing.*T02/.test(r.err), r.err);
ok('T04 skipped with a no-source warning', /no source yet.*T04/.test(r.err));
ok('internal T00 not built without naming', !/T00/.test(r.out.split('built')[1] || ''), r.out);
const html = fs.readFileSync(path.join(T, 'fx.html'), 'utf8');
const m = /window\.__JU_SOURCES=(\{.*?\});window\.__JU_META=/s.exec(html); ok('data script present', !!m);
const SRC = m ? JSON.parse(m[1]) : {};
ok('built T01 and T03 only', Object.keys(SRC).sort().join() === 'T01,T03', Object.keys(SRC));
const t1 = SRC.T01 || '';
ok('markers replaced', !/@panel-css \*\/|<!-- @panel -->|<!-- @fx-svg -->|\/\* @core \*\//.test(t1));
ok('panel injected inside sc-if', /<sc-if value="\{\{panel\.show\}\}"[^>]*>\s*<aside class="ju-panel"/.test(t1));
ok('fx svg injected', /<svg[^>]*>[\s\S]*<\/svg>/.test(t1) || /fx/.test(t1));
ok('core banner + CONCEPT injected', /\/\* ---- .*ju-data\.js ---- \*\//.test(t1) && /var CONCEPT = \{"code":"T01","name":"夹具一"/.test(t1));
ok('panel css + fx css injected into @panel-css', /\.ju-panel\{/.test(t1) && /\.ju-stage\{/.test(t1));
const sharedCssPresent = fs.existsSync(path.join(ROOT, 'my-r2/src/shared')) && /shared modules:.*\.css/.test(r.out);
if (sharedCssPresent) { const t3 = SRC.T03; const i3 = t3.indexOf('.app{position:absolute;inset:0}'); const sharedBanner = '/* ---- my-r2/src/shared/'; ok('T03: shared css lands at @shared-css (after .app rule position check)', t3.indexOf(sharedBanner) > 0 && t3.indexOf(sharedBanner) < i3 && t3.indexOf('/* @shared-css */') < 0); ok('T01: shared css merged into @panel-css', t1.indexOf(sharedBanner) > 0); }
const idx = /window\.__JU_INDEX=(\[.*?\]);window\.__JU_COVERAGE=/s.exec(html); const INDEX = idx ? JSON.parse(idx[1]) : [];
ok('__JU_INDEX has 50 states', INDEX.length === 50, INDEX.length);
ok('data script has no raw </script', !/<\/script/i.test((/<script>window\.__JU_SOURCES=[\s\S]*?window\.__JU_BUILT=.*?;/.exec(html) || [''])[0]));
ok('shell routes + stats present', /window\.JUShell = \{/.test(html) && /stats: stats/.test(html));
/* JU_ONLY with the internal one named */
r = build({ JU_STANDALONE: path.join(T, 'only.html'), JU_CONCEPTS: path.join(T, 'concepts.json'), JU_CONCEPTS_DIR: T, JU_CORE_DIR: coreDir, JU_ONLY: 'T00,T03' });
ok('JU_ONLY builds the named internal concept', /built 2 concepts \(T00, T03\)/.test(r.out), r.out);
/* fonts: JU_FONTS_CSS inlines and strips the Google Fonts links */
fs.writeFileSync(path.join(T, 'fonts.css'), "@font-face{font-family:'Fixture';src:url(data:font/woff2;base64,AAAA) format('woff2')}");
r = build({ JU_STANDALONE: path.join(T, 'fonts.html'), JU_CONCEPTS: path.join(T, 'concepts.json'), JU_CONCEPTS_DIR: T, JU_CORE_DIR: coreDir, JU_FONTS_CSS: path.join(T, 'fonts.css') });
{ const h = fs.readFileSync(path.join(T, 'fonts.html'), 'utf8'); ok('fonts css inlined', /font-family:'Fixture'/.test(h)); ok('google links stripped from the shell', !/<link[^>]+fonts\.googleapis/.test(h.split('<script>window.__JU_SOURCES')[0])); }
console.log(fails ? `build-test FAILED ${fails}` : 'build-test OK'); process.exit(fails ? 1 : 0);
