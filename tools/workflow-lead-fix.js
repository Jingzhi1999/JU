export const meta = {
  name: 'ju-lead-fix-round',
  description: 'Per concept: merge the independent review reports with the lead review, fix, then verify with a fresh reviewer; repeat once if blockers remain',
  phases: [
    { title: 'Fix', detail: 'one builder-role agent per concept applies reviewer + lead findings' },
    { title: 'Verify', detail: 'fresh reviewer re-operates the concept and checks every finding' },
  ],
}
const ROOT = '/home/user/JU'
const META = JSON.parse(args.meta)
const codes = (args && args.codes) || META.map(m => m.code)
const maxRounds = (args && args.maxRounds) || 2
const SCHEMA_FIX = { type: 'object', properties: { fixed: { type: 'array', items: { type: 'string' } }, declined: { type: 'array', items: { type: 'string' } }, evidence: { type: 'array', items: { type: 'string' } } }, required: ['fixed', 'declined', 'evidence'] }
const SCHEMA_VERIFY = { type: 'object', properties: { pass: { type: 'boolean' }, open: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string' }, what: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'what', 'evidence', 'fix'] } }, summary: { type: 'string' } }, required: ['pass', 'open', 'summary'] }

const fixPrompt = (c, extra, round) => `You are the builder of concept ${c.code} ${c.name} (${ROOT}/concepts/src/${c.file}) in the JU 「我的局」 ten-concept redesign. Round ${round} of the lead's fix pass.
Inputs to read first: ${ROOT}/spec/concept-contract.md (all of it, esp. §0 quality bar, §6 print/tear/burn phases, §10 conventions); ${ROOT}/spec/lead-review.md (the design lead's findings — rows for ${c.code} and the "全部" rows apply to you; the "已认可的部分" list names local strengths you must PROTECT); every independent review report that exists for this concept: ${ROOT}/evidence/${c.code}/review-*.md (and their evidence folders); ${ROOT}/spec/motion/${c.code}.md; ${ROOT}/spec/directions.md (your direction card — keep the concept's identity).
${extra ? 'Open items from the last verification:\n' + extra + '\n' : ''}
Task: fix every blocker and major from the review reports and every 高/中 row of the lead review for ${c.code}, plus quick minors. For the shared "管理页结构雷同" row, rework the 申请审核 surface (and where it helps, members/attendance) so its COMPOSITION and the form of the approve/decline action express your concept (not just its colours) — keep all semantics (applicant name, verification, note, time, 谢绝 / 发出邀请, in-place result, count and seat change). Do not flatten the concept into generic UI; do not regress protected strengths. All writes through JU.engine; timers via this.after; ids prefixed ${c.code.toLowerCase()}-; overlays .${c.code.toLowerCase()}-over; data-rid / data-act conventions.
Verify every fix yourself: JU_STANDALONE=${ROOT}/.build/${c.code}.html node src/build.js, then JU_STANDALONE=${ROOT}/.build/${c.code}.html node tools/coverage.cjs ${c.code} ${ROOT}/evidence/${c.code}/fix-r${round}/coverage (must be 50/50, 0 errors) and tools/capture.cjs flows for each fixed item into ${ROOT}/evidence/${c.code}/fix-r${round}/<flow>; Read every sheet.png you produce. Refresh ${ROOT}/evidence/${c.code}/joined-home.png, hosted-home.png, detail.png, manage.png, result.png from the fixed build (capture + copy the right frame). Update ${ROOT}/spec/motion/${c.code}.md where parameters changed (mark changed values). Write a short changelog to ${ROOT}/evidence/${c.code}/fix-r${round}.md (finding → change → evidence path; declined → reason).
Final message: structured output only.`

const verifyPrompt = (c, round) => `You are a fresh, exacting reviewer for concept ${c.code} ${c.name} of the JU 「我的局」 redesign (verification after fix round ${round}). You did not build it. Read ${ROOT}/spec/concept-contract.md (§0, §6, §7–8, §10), ${ROOT}/spec/lead-review.md (rows for ${c.code} and "全部"), all ${ROOT}/evidence/${c.code}/review-*.md, and ${ROOT}/evidence/${c.code}/fix-r${round}.md (the builder's changelog). Build privately: cd ${ROOT} && JU_STANDALONE=${ROOT}/.build/verify-${c.code}.html node src/build.js; then operate with JU_STANDALONE=${ROOT}/.build/verify-${c.code}.html node tools/capture.cjs / tools/coverage.cjs into ${ROOT}/evidence/${c.code}/verify-r${round}/. For EVERY finding in the reviews and the lead rows, reproduce the original scenario and decide fixed / not fixed from your own frames (Read the sheets). Then do a quick regression sweep: both homes, card→detail→back, print, tear, cancel destruction at 0.5×, end+attendance, drafts undo, empty + long variants, fail→retry, reduced motion. Severity: blocker / major / minor. pass=true only with zero blockers and ≤2 majors open. Write your verdict to ${ROOT}/evidence/${c.code}/verify-r${round}.md. Final message: structured output only.`

phase('Fix')
const results = await pipeline(
  codes.map(code => META.find(m => m.code === code)),
  async (c) => {
    let round = 1, extra = '', out = { code: c.code }
    while (round <= maxRounds) {
      const fix = await agent(fixPrompt(c, extra, round), { label: `fix:${c.code}#${round}`, phase: 'Fix', schema: SCHEMA_FIX })
      out[`fix${round}`] = fix
      const v = await agent(verifyPrompt(c, round), { label: `verify:${c.code}#${round}`, phase: 'Verify', schema: SCHEMA_VERIFY })
      out[`verify${round}`] = v
      if (!v || v.pass) break
      extra = JSON.stringify(v.open, null, 1)
      round++
    }
    return out
  }
)
return results.filter(Boolean).map(r => ({ code: r.code, rounds: Object.keys(r).filter(k => k.startsWith('verify')).map(k => ({ k, pass: r[k] && r[k].pass, open: r[k] ? r[k].open.length : null, blockers: r[k] ? r[k].open.filter(o => o.severity === 'blocker').length : null, summary: r[k] && r[k].summary })) }))
