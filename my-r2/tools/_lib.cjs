// my-r2/tools/_lib.cjs — shared helpers for the my-r2 review tools (not a tool itself; required by the *.cjs tools here).
// File resolution: JU_STANDALONE=<path> (a private build, see my-r2/src/build.js) wins; otherwise the deliverable
// /home/user/JU/JU-MY-R2-TEN-DIRECTIONS.html. Tools that compare several builds use .build/<CODE>.html unless --final.
// In-page access: every helper reaches a concept through window.JUShell.mounts.stage['stage:<CODE>:'] (the shell's stage
// mount) and the stage host's shadow root; concept DOM is always queried inside that shadow root, never on document.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'); const fs = require('fs'); const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const DELIVERABLE = path.join(ROOT, 'JU-MY-R2-TEN-DIRECTIONS.html');
const EVIDENCE = path.join(ROOT, 'my-r2', 'evidence');
function fileFor(code, o) {
  o = o || {};
  if (o.final) return DELIVERABLE;
  if (process.env.JU_STANDALONE) return path.resolve(process.env.JU_STANDALONE);
  if (o.preferPrivate && code) { const priv = path.join(ROOT, '.build', code + '.html'); if (fs.existsSync(priv)) return priv; }
  return DELIVERABLE;
}
function opt(k, d) { const i = process.argv.indexOf('--' + k); return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : d; }
function flag(k) { return process.argv.indexOf('--' + k) >= 0; }
/* positional arguments = everything before the first --flag */
function positionals() { const a = process.argv.slice(2); const out = []; for (const x of a) { if (x.startsWith('--')) break; out.push(x); } return out; }
const STAGE_FN = function (c) { var m = window.JUShell && window.JUShell.mounts.stage['stage:' + c + ':']; var h = document.querySelector('.stage-host[data-code="' + c + '"]'); return { m: m, inst: m && m.instance, root: m && m.root, sr: h && h.shadowRoot, host: h }; };
async function launch(o) {
  o = o || {};
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: o.viewport || { width: 1000, height: 1000 }, deviceScaleFactor: o.dsf || 1, reducedMotion: o.reducedMotion || 'no-preference' });
  await ctx.addInitScript('window.__juStage = ' + STAGE_FN.toString() + ';');
  const blocked = [];
  if (o.offline) await ctx.route('**/*', r => { const u = r.request().url(); if (/^(file|data|blob):/.test(u)) return r.continue(); blocked.push(u); return r.abort(); });
  const p = await ctx.newPage(); const errors = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  return { b, ctx, p, errors, blocked };
}
async function openConcept(p, file, code, settle) {
  await p.goto('file://' + file + '#concept/' + code); await p.waitForTimeout(settle == null ? 700 : settle);
  try { await p.evaluate(() => document.fonts.ready); } catch (e) { } await p.waitForTimeout(300);
  return p.evaluate(c => { const g = window.__juStage(c); return !!(g.inst && g.sr && g.sr.querySelector('.ju-phone')); }, code);
}
/* E(): run js inside the page with (root, inst, a, sr, host) in scope — root = the mount root, inst = the component, sr = the shadow root */
async function E(p, code, js, arg) { return p.evaluate(([c, js, a]) => { const g = window.__juStage(c); return new Function('root', 'inst', 'a', 'sr', 'host', js)(g.root, g.inst, a, g.sr, g.host); }, [code, js, arg === undefined ? null : arg]); }
async function phoneRect(p, code) { return E(p, code, "var ph = sr && sr.querySelector('.ju-phone'); if (!ph) return null; var r = ph.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height };"); }
async function shot(p, rect, file, type) { await p.screenshot(Object.assign({ path: file, clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h } }, type === 'jpeg' ? { type: 'jpeg', quality: 82 } : {})); }
async function jump(p, code, key, settle) { await E(p, code, 'inst.jumpTo(a)', key); await p.waitForTimeout(settle == null ? 650 : settle); }
async function indexKeys(p) { return p.evaluate(() => (window.__JU_INDEX && window.__JU_INDEX.length ? window.__JU_INDEX : (window.JU && window.JU.INDEX) || []).map(e => e.key)); }
async function indexList(p) { return p.evaluate(() => (window.__JU_INDEX && window.__JU_INDEX.length ? window.__JU_INDEX : (window.JU && window.JU.INDEX) || []).map(e => ({ key: e.key, group: e.group, label: e.label }))); }
/* pick + click: a real pointer click at the element's centre (at most 48px below its top) after the controller's reveal(),
   as a person would; hit-testing decides what receives it and the result says if something else covers that point.
   Several matches: the one inside an overlay (.cNN-over) wins, else the first with a box; {last:true} takes the last one;
   {js:true} uses a synthetic el.click() for targets a person cannot hit directly. */
/* "sel1, sel2" = alternatives in priority order (the first one with a visible match wins), not one CSS group */
const PICK_JS = "var alts = []; var cur = '', d = 0, q = ''; for (var i = 0; i < a.sel.length; i++) { var ch = a.sel[i]; if (q) { if (ch === q) q = ''; cur += ch; continue; } if (ch === '\"' || ch === \"'\") { q = ch; cur += ch; continue; } if (ch === '[' || ch === '(') d++; if (ch === ']' || ch === ')') d--; if (ch === ',' && d === 0) { alts.push(cur.trim()); cur = ''; continue; } cur += ch; } if (cur.trim()) alts.push(cur.trim()); var total = 0, vis = []; for (var k = 0; k < alts.length && !vis.length; k++) { var list = Array.prototype.slice.call(sr.querySelectorAll(alts[k])); total += list.length; vis = list.filter(function (e) { var b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; }); } if (!total) return { missing: true }; if (!vis.length) return { hidden: true, total: total }; var over = vis.filter(function (e) { return !!e.closest('[class*=\"-over\"]'); }); var e = a.last ? vis[vis.length - 1] : (over.length ? over[over.length - 1] : vis[0]); if (inst && inst.reveal) { try { inst.reveal(e); } catch (x) { } } if (a.js) { e.click(); return { js: true }; } var b = e.getBoundingClientRect(); var x = b.left + b.width / 2, y = b.top + Math.min(b.height / 2, 48); var hit = sr.elementFromPoint(x, y); var covered = !(hit && (hit === e || e.contains(hit) || hit.contains(e))); return { x: x, y: y, covered: covered, hit: hit ? hit.tagName.toLowerCase() + (typeof hit.className === 'string' && hit.className ? '.' + hit.className.trim().split(/\\s+/).slice(0, 3).join('.') : '') : null };";
async function clickSel(p, code, sel, o) {
  const r = await E(p, code, PICK_JS, { sel, js: !!(o && o.js), last: !!(o && o.last) });
  if (r && r.x != null) await p.mouse.click(r.x, r.y);
  return r || { missing: true };
}
/* describe a click result for logs; returns '' when it was a clean hit */
function clickIssue(r, sel) { if (!r || r.missing) return 'click target missing: ' + sel; if (r.hidden) return 'click target has no box: ' + sel; if (r.covered) return 'click target covered at its centre by ' + r.hit + ': ' + sel + ' (pointer click sent anyway)'; return ''; }
const SET_SKIN_JS = "var k = a; if (inst.setSkin) { inst.setSkin(k); return 'setSkin'; } if (inst.applySkin) { inst.applySkin(k); return 'applySkin'; } if (window.JU && JU.engine && JU.engine.applySkin && inst.act) { inst.act('applySkin', { skin: k }); return 'act:applySkin'; } if (window.JU && JU.engine && JU.engine.setSkin && inst.act) { inst.act('setSkin', { skin: k }); return 'act:setSkin'; } return 'no skin api';";
async function setSkin(p, code, skin) { return E(p, code, SET_SKIN_JS, skin); }
/* review-state toggles the R2 mixin provides (toggleKb / toggleSafe / toggleZoom); returns 'ok' | 'no api' */
async function setToggle(p, code, name, on) { return E(p, code, "var k = a.k, want = !!a.on, r = inst.state.review || {}; var fn = inst['toggle' + k.charAt(0).toUpperCase() + k.slice(1)]; if (!fn) return 'no api'; if (!!r[k] !== want) fn.call(inst); return 'ok';", { k: name, on }); }
/* animations still running inside the phone (optionally only those longer than minMs) */
const RUNNING_JS = "var ph = sr.querySelector('.ju-phone'); if (!ph || !ph.getAnimations) return []; return ph.getAnimations({ subtree: true }).filter(function (an) { var t = an.effect && an.effect.getTiming ? an.effect.getTiming() : null; return an.playState === 'running' && t && (typeof t.duration === 'number' ? t.duration : 0) > (a || 0); }).map(function (an) { var t = an.effect.getTiming(); return (an.animationName || an.id || 'transition') + ':' + Math.round(t.duration); });";
async function runningAnimations(p, code, minMs) { return E(p, code, RUNNING_JS, minMs || 0); }
/* ffmpeg contact sheet of same-size PNG frames matching glob (f*.png) */
function tileFfmpeg(outdir, glob, cols, scale, out) {
  const n = fs.readdirSync(outdir).filter(f => new RegExp('^' + glob.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$').test(f)).length; if (!n) return false;
  const rows = Math.ceil(n / cols);
  execSync(`ffmpeg -y -loglevel error -reinit_filter 0 -framerate 1 -pattern_type glob -i '${path.join(outdir, glob)}' -vf "scale=${scale}:-1,tile=${cols}x${rows}:padding=4:margin=4:color=white" -frames:v 1 -update 1 '${out}'`);
  return true;
}
/* PIL contact sheet (frames of different sizes, optional labels / grayscale); rows = [[file, ...], ...] */
function tilePy(outdir, rows, out, o) {
  o = o || {}; const labels = o.labels || null;
  const py = `from PIL import Image, ImageDraw, ImageOps\nimport os\nrows=${JSON.stringify(rows)}\nlabels=${labels ? JSON.stringify(labels) : 'None'}\nsc=${o.scale || 0.5}; gap=${o.gap || 8}; lab=${labels ? 18 : 0}\nims=[[Image.open(f).convert('RGB') for f in r] for r in rows]\n${o.gray ? 'ims=[[ImageOps.grayscale(i).convert("RGB") for i in r] for r in ims]\n' : ''}W=max(int(i.width*sc) for r in ims for i in r); H=max(int(i.height*sc) for r in ims for i in r); cols=max(len(r) for r in ims)\nsh=Image.new('RGB',(cols*(W+gap)+gap, len(ims)*(H+gap+lab)+gap),(${o.bg || '40,40,44'}))\nd=ImageDraw.Draw(sh)\nfor ri,r in enumerate(ims):\n    for ci,im in enumerate(r):\n        x=gap+ci*(W+gap); y=gap+ri*(H+gap+lab)\n        if labels and ri < len(labels) and ci < len(labels[ri]): d.text((x+2,y+2),str(labels[ri][ci]),fill=(230,230,230))\n        sh.paste(im.resize((int(im.width*sc),int(im.height*sc)),Image.LANCZOS),(x,y+lab))\nsh.save(${JSON.stringify(out)},optimize=True)\n`;
  fs.writeFileSync(path.join(outdir, 'tile.py'), py); execSync(`python3 -I ${path.join(outdir, 'tile.py')}`);
}
function writeLog(outdir, obj) { fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify(obj, null, 1)); }
function loadFlows() { return JSON.parse(fs.readFileSync(path.join(__dirname, 'flows.json'), 'utf8')); }
/* run one flow step inside a concept (used by rm-check / flow-compare / capture's "flow" action); returns an issue string or '' */
async function runStep(p, code, st) {
  if (st.click) { const r = await clickSel(p, code, st.click, st); await p.waitForTimeout(st.after || 120); const issue = clickIssue(r, st.click); return (st.optional && (r.missing || r.hidden)) ? '' : issue; }
  if (st.wait) { await p.waitForTimeout(st.wait); return ''; }
  if (st.scrollEnd) { const ok = await E(p, code, "var el = null; a.split(',').some(function (s) { el = Array.prototype.slice.call(sr.querySelectorAll(s.trim())).filter(function (e) { return e.getBoundingClientRect().height > 0; })[0]; return !!el; }); if (!el) return false; el.scrollTop = el.scrollHeight; el.dispatchEvent(new Event('scroll', { bubbles: true })); return true;", st.scrollEnd); await p.waitForTimeout(st.after || 200); return ok ? '' : 'scroll container missing: ' + st.scrollEnd; }
  if (st.input) { const ok = await E(p, code, "var el = sr.querySelector(a.sel); if (!el) return false; el.focus(); var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; var set = Object.getOwnPropertyDescriptor(proto, 'value').set; set.call(el, a.value); el.dispatchEvent(new Event('input', { bubbles: true, composed: true })); el.dispatchEvent(new Event('change', { bubbles: true, composed: true })); return true;", st.input); await p.waitForTimeout(st.after || 100); return ok ? '' : 'input missing: ' + st.input.sel; }
  if (st.key) { if (st.focus) { const ok = await E(p, code, "var el = sr.querySelector(a); if (!el) return false; if (inst && inst.reveal) { try { inst.reveal(el); } catch (x) { } } el.focus(); return true;", st.focus); if (!ok) return 'focus target missing: ' + st.focus; } for (let i = 0; i < (st.times || 1); i++) { await p.keyboard.press(st.key); await p.waitForTimeout(40); } await p.waitForTimeout(st.after || 120); return ''; }
  if (st.expectSel) { const ok = await E(p, code, "return a.split(',').some(function (s) { return Array.prototype.slice.call(sr.querySelectorAll(s.trim())).some(function (e) { var b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; }); });", st.expectSel); return ok ? '' : 'expected element not visible: ' + st.expectSel + (st.name ? ' (' + st.name + ')' : ''); }
  if (st.expect) { let ok = false, err = ''; try { ok = await E(p, code, st.expect); } catch (e) { err = e.message; } return ok ? '' : 'expectation failed' + (st.name ? ' (' + st.name + ')' : '') + ': ' + st.expect.slice(0, 120) + (err ? ' — ' + err : ''); }
  if (st.eval) { await E(p, code, st.eval); await p.waitForTimeout(st.after || 100); return ''; }
  return 'unknown step: ' + JSON.stringify(st);
}
module.exports = { chromium, path, fs, execSync, ROOT, DELIVERABLE, EVIDENCE, fileFor, opt, flag, positionals, launch, openConcept, E, phoneRect, shot, jump, indexKeys, indexList, clickSel, clickIssue, PICK_JS, setSkin, setToggle, runningAnimations, tileFfmpeg, tilePy, writeLog, loadFlows, runStep };
