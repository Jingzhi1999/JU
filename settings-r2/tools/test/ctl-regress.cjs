// Controller regression (headless, no browser): exercises jus-ctl.js through a fake component.
// node settings-r2/tools/test/ctl-regress.cjs
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.resolve(__dirname, '..', '..', '..');
const ctx = { window: {}, setTimeout, clearTimeout, Date, Intl, JSON, Math, Array, Object, String, Number }; ctx.window.window = ctx.window; ctx.window.setTimeout = setTimeout; ctx.window.clearTimeout = clearTimeout; ctx.window.Intl = Intl;
for (const f of ['src/core/ju-fx.js', 'settings-r2/src/core/jus-data.js', 'settings-r2/src/core/jus-ctl.js', 'settings-r2/src/core/jus-review.js']) vm.runInNewContext(fs.readFileSync(path.join(R, f), 'utf8'), ctx);
const J = ctx.window.JUS; let fails = 0; const ok = (n, c) => { if (!c) { fails++; console.log('FAIL', n); } };
function C(props) { this.props = props || {}; this.state = {}; }
C.prototype.setState = function (p) { const s = typeof p === 'function' ? p(this.state) : p; if (s) this.state = Object.assign({}, this.state, s); };
C.prototype.initialState = function (v) { return Object.assign({}, J.baseState(v)); };
C.prototype.forceUpdate = function () {};
J.mixin(C);
const c = new C({ persist: false }); c.reviewInit({ code: 'T00', name: 't' });
const tick = (ms) => new Promise(r => setTimeout(r, ms));
const path_ = () => c.state.nav.stack.map(x => x.s).join('>');
(async () => {
  c.go('profile'); await tick(420); ok('go profile', path_() === 'home>profile' && c.state.nav.phase === 'idle');
  c.go('profile-edit'); await tick(420); ok('pf open', c.state.pf && c.state.pf.name === '阿禾');
  c.pfInput('name', ''); c.pfInput('wx', 'a b'); c.pfSave(); ok('invalid errors', c.state.pf.errors.name && c.state.pf.errors.wx);
  { const realSet = c.setState; const q = []; c.setState = function (p) { q.push(p); }; c.pfInput('name', '阿禾二'); c.pfInput('wx', 'ahe_ju'); c.setState = realSet; q.forEach(p => c.setState(p)); ok('same-tick inputs do not resurrect cleared errors', !c.state.pf.errors.name && !c.state.pf.errors.wx && c.state.pf.name === '阿禾二' && c.state.pf.wx === 'ahe_ju'); }
  c.pfInput('name', '阿禾二'); c.pfInput('wx', 'ahe_ju'); c.pfInput('email', 'he.a@stern.nyu.edu'); c.pfSave(); ok('unverified email blocked', c.state.pf.errors.email === J.COPY.profileErrors.mailUnverified);
  c.pfSendCode(); ok('code sent', c.state.pf.codeState === 'sent' && /^\d{6}$/.test(c.state.data.you.emailPending.code));
  c.pfInput('code', '000000'); c.pfVerify(); ok('wrong code', c.state.pf.errors.code === J.COPY.profileErrors.codeWrong);
  c.pfInput('code', c.state.data.you.emailPending.code); c.pfVerify(); ok('verified', c.state.pf.codeState === 'verified');
  c.armFail(); c.pfSave(); await tick(520); ok('fail keeps input', c.state.pf.failed && c.state.pf.name === '阿禾二' && c.state.data.you.name === '阿禾');
  c.pfSave(); await tick(520); ok('retry saves', c.state.data.you.name === '阿禾二' && c.state.data.you.email === 'he.a@stern.nyu.edu' && c.state.data.you.emailVerified);
  ok('snapshot untouched', c.state.data.joined[0].snapshot.name === '阿禾');
  await tick(700); ok('returns after save', path_() === 'home>profile');
  c.go('profile-edit'); await tick(420); c.pfInput('name', '改了'); c.back(); ok('unsaved sheet', c.state.sheet && c.state.sheet.kind === 'unsaved' && path_() === 'home>profile>profile-edit');
  c.sheetKeep(); ok('keep stays', !c.state.sheet && path_() === 'home>profile>profile-edit' && c.state.pf.name === '改了');
  c.back(); c.sheetDiscard(); await tick(420); ok('discard returns', path_() === 'home>profile' && c.state.pf === null);
  c.go('profile-edit'); await tick(420); c.pfInput('email', 'x.y@stern.nyu.edu'); c.pfSendCode(); const code = c.state.data.you.emailPending.code;
  J.advance(6 * 60000); await tick(800); ok('expiry detected by tick', c.state.pf.codeState === 'expired');
  c.pfInput('code', code); c.pfVerify(); ok('verify after expiry rejected', c.state.pf.errors.code === J.COPY.profileErrors.codeExpired);
  c.pfSendCode(); ok('resend recovers', c.state.pf.codeState === 'sent');
  c.pfInput('email', 'other@stern.nyu.edu'); ok('changing email resets code', c.state.pf.codeState === 'none');
  c.back(); c.sheetDiscard(); await tick(420); c.home();
  c.go('records'); await tick(420); c.go('record-detail', { id: 'rec-hike2' }); await tick(420); c.go('record-dispute', { id: 'rec-hike2' }); await tick(420);
  c.formSubmit('dispute', 'rec-hike2'); ok('form min length', c._tf('dispute', 'rec-hike2').errors.text);
  c._tfSet('dispute', 'rec-hike2', { text: '我当天到场了', files: [{ name: '聊天截图.png', size: 120000 }] });
  c.back(); ok('form unsaved guard', c.state.sheet && c.state.sheet.form === 'dispute:rec-hike2'); c.sheetKeep();
  c.armFail(); c.formSubmit('dispute', 'rec-hike2'); await tick(520); ok('form fail keeps text', c._tf('dispute', 'rec-hike2').failed && c._tf('dispute', 'rec-hike2').text === '我当天到场了');
  c.formSubmit('dispute', 'rec-hike2'); await tick(520); ok('dispute filed', c.state.data.records.find(r => r.id === 'rec-hike2').appeals.length === 1);
  await tick(700); ok('form returns to detail', path_() === 'home>records>record-detail');
  c.home(); c.go('notify'); await tick(420); c.notifyRequest(); await tick(420); ok('system prompt', c.state.ui.sys && c.state.data.notify.permission === 'requesting');
  c.notifyAnswer('denied'); ok('denied', c.state.data.notify.permission === 'denied'); c.notifyRequest(); ok('denied cannot re-request', c.state.data.notify.permission === 'denied' && !c.state.ui.sys);
  c.home(); c.go('appearance'); await tick(420); c.skinPick('halo'); ok('preview only', c.state.ui.skinPreview === 'halo' && c.state.data.appearance.skin === 'cotton'); c.back(); await tick(420); ok('leaving clears preview', !c.state.ui.skinPreview && c.state.data.appearance.skin === 'cotton');
  c.go('appearance'); await tick(420); c.skinPick('sunset'); c.skinApply(); ok('apply', c.state.data.appearance.skin === 'sunset' && !c.state.ui.skinPreview);
  c.home(); c.go('city'); await tick(420); c.setState({ ui: Object.assign({}, c.state.ui, { cityQ: '东京' }) }); ok('city none', c.ctlVals().city.none); c.cityPick('LA'); ok('city set', c.state.data.prefs.city === 'LA' && c.state.data.events.hotpot.city === 'NYC');
  c.home(); c.go('favorites'); await tick(420); const order0 = J.derive.favorites(c.state.data).all.map(r => r.id).join(',');
  c.favRemove('exhibit'); ok('remove', J.derive.favorites(c.state.data).count === 2 && c.state.ui.undo.id === 'exhibit'); c.favUndo(); ok('undo restores order', J.derive.favorites(c.state.data).all.map(r => r.id).join(',') === order0);
  c.favToggle('theater'); ok('fav joined keeps ticket', J.derive.joinedRow(c.state.data, 'theater').ticket.torn === true && J.derive.joinedRow(c.state.data, 'theater').stage === 'going');
  c.root('find'); await tick(420); ok('root find', path_() === 'seam-feed' && c.state.nav.phase === 'idle');
  c.root('mine'); await tick(420); c.go('seam-report', { id: 'jazz' }); await tick(420);
  c._tfSet('report', 'jazz', { text: '有人在包厢里反复劝酒' }); c.formSubmit('report', 'jazz'); ok('report needs who', c._tf('report', 'jazz').errors.who);
  c._tfSet('report', 'jazz', { who: ['host'] }); c.formSubmit('report', 'jazz'); await tick(520); const rep = c.state.data.reports.find(r => r.eventId === 'jazz'); ok('report submitted not accepted', rep && rep.status === 'submitted');
  await tick(700); ok('report returns to mine', path_() === 'seam-mine');
  c.root('settings'); await tick(420); c.go('account'); await tick(420); c.acctEnd(); ok('account sheet', c.state.sheet.kind === 'account-end'); c.acctConfirm(); ok('session ended keeps data', c.state.data.session.kind === 'ended' && c.state.data.reports.length >= 3); c.acctRestart(); ok('restart', c.state.data.session.kind === 'demo');
  let bad = 0;
  for (const e of J.INDEX) { const st = c.initialState(e.variant || 'default'); st.review = c.state.review; c.state = Object.assign({}, c.state, st); try { c.ctlJump(e); const v = c.ctlVals(); const want = e.open.surface; if (!v.nav.on[want]) { bad++; console.log('surface not on', e.key); } if (want === 'profile-edit' && !v.pf.on) { bad++; console.log('pf missing', e.key); } if (/record-(detail|supplement|dispute|appeal)/.test(want) && !v.rec) { bad++; console.log('rec missing', e.key); } if (/report-(detail|supplement)/.test(want) && !v.rep) { bad++; console.log('rep missing', e.key); } if (/supplement|dispute|appeal|feedback|seam-report/.test(want) && !v.form.on) { bad++; console.log('form missing', e.key); } } catch (err) { bad++; console.log('ERR', e.key, err.message); } }
  ok('all index jumps render a view model', bad === 0);
  const ex = J.INDEX.find(x => x.key === 's-profile-code-expired'); c.state = Object.assign({}, c.state, c.initialState('default')); c.ctlJump(ex); ok('expired jump', c.state.pf.codeState === 'expired' && J.derive.emailPending(c.state.data).expired);
  console.log(fails ? `FAILED ${fails}` : `ctl-regress OK (${J.INDEX.length} index entries)`); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
