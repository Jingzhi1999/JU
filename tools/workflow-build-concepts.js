export const meta = {
  name: 'ju-build-ten-concepts',
  description: 'Build the ten 「我的局」 concept artboards in parallel, then screenshot-review each and fix until the acceptance checklist passes',
  phases: [
    { title: 'Build', detail: 'one designer-engineer agent per concept' },
    { title: 'Review', detail: 'independent visual reviewers operate each concept with the capture tool' },
    { title: 'Fix', detail: 'original builder addresses confirmed findings' },
  ],
}
const ROOT = '/home/user/JU'
const codes = (args && args.codes) || ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10']
const META = JSON.parse(args.meta)
const BRIEF = (c) => `
You are a senior mobile product designer, art director, motion designer and front-end implementer. You own ONE of ten visual/motion concepts for the JU app's 「我的局」section and must deliver it complete and operable.

YOUR CONCEPT: ${c.code} ${c.name} — ${c.line}
Read, in this order, before writing any code:
1. ${ROOT}/spec/concept-contract.md  (the technical + quality contract; every rule applies)
2. ${ROOT}/spec/directions.md  (your section "${c.code} ${c.name}" is the design brief; the matrix shows what the other nine do — stay different from them)
3. ${ROOT}/spec/state-inventory.md  (the common state list all ten concepts must cover — every row, every surface, every boundary dataset)
4. ${ROOT}/spec/concept-refs.md  (your reference mapping: the real-world cases your concept translates; read the cited observations and apply the principles, do not copy their styling)
5. ${ROOT}/src/core/ju-data.js (API you must use: JU.data / JU.derive.joined / JU.derive.hosted / JU.derive.manage / JU.engine.* / JU.fmt / JU.INDEX), ${ROOT}/src/core/ju-review.js, ${ROOT}/src/core/ju-fx.js, ${ROOT}/src/core/ju-fx.css, ${ROOT}/src/core/ju-fx.svg
6. ${ROOT}/concepts/src/C00.dc.html (a working pipeline test showing the markers, panel wiring, FLIP expansion, tear drag, burn and print — copy the mechanics, NOT the look)

Deliverables (all under ${ROOT}):
- concepts/src/${c.file} — the whole concept: 390×844 phone UI + outside-phone review panel markers, covering BOTH roles (我参加的 / 我发起的), all participant states and in-event actions, host list (当前 / 草稿 / 历史), 管理这局 with all 12 surfaces, boundary datasets, and the 11 motion families, with print / tear / burn-or-void done in YOUR material language (contract §6).
- spec/motion/${c.code}.md — key visual parameters (fonts, type scale, palette, material rules, radius/shadow/edge rules, layout composition) + your three core motions broken into phases (trigger, moving object, start/end, segment durations, easing/spring, transform origin, masks, shadow changes, interrupt/replay).
- evidence/${c.code}/ — joined-home.png, hosted-home.png, detail.png, manage.png, result.png and frame-sequence folders (each with sheet.png) for: card→detail→back, print, tear, burn/void, a management action (approve), reschedule reply, cancel, end+attendance, draft delete+undo, empty state, long-title variant.

Working method (do it in this order, and keep going until everything passes):
A. Skeleton first: markers, data-props, reviewInit, initialState via JU.baseState, applyJump for every JU.INDEX surface, role/section switching, both home lists with the real derived data. Build (node src/build.js), capture joined/hosted homes with node tools/capture.cjs, LOOK at the PNGs with Read, and fix the first-glance hierarchy before going deeper. Do not proceed with a home screen you would not be proud to show.
B. Participant detail + all in-event actions (confirm/release, waitlist leave, tear → contact → copy → contacted, reschedule accept/decline, withdraw/exit with confirm → processing → ticket change → result, history stub expansion with attendance/records, add a note record). Each action goes through JU.engine and animates the returned effect.
C. Host management: 12 surfaces with full consequences (approve/reject with count changes, members/seats, waitlist, contact copy feedback, leaves, reschedule sheet with validation, replies, cancel with affected summary → burning/void → history, end → attendance stamps with correction trail, full card). Drafts delete + undo. Host home priority hierarchy.
D. Boundary datasets via the panel variants; loading / disabled / failure+retry demo (use JU.engine.setFailNext or your own one-shot demo); reduced-motion sanity (.rm) and 0.5× / scrub on the long effects.
E. Verify with tools/capture.cjs for every item in contract §7; read every sheet.png; fix blur/ghosting/overlap/white flashes/stuck objects; make sure log.json errors are empty. Then write spec/motion/${c.code}.md.

Hard rules (from the client): no alerts, no empty sheets, no button-scale-only feedback, no jumping to other modules; every retained button has a visual result inside this concept; no invented credit scores or penalties; the distinct not-attended outcomes stay distinct; applicant/contact data only on the host side; no looping gradients, floating particles or constant wobble; no Inter/Roboto/Arial; no emoji icons; text crisp after every animation; one primary motion at a time; ids prefixed with ${c.code.toLowerCase()}-.
Be ambitious about the visual quality — this round exists because the previous versions looked unappealing. Rich material, confident type, clear hierarchy, continuity of objects. Chinese typography must look good on its own.
Report at the end (final message only): what is covered, what is not and why, the evidence paths, and any contract/API bugs you hit (and how you worked around them).`
const REVIEW_SCHEMA = { type: 'object', properties: { pass: { type: 'boolean' }, findings: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string' }, area: { type: 'string' }, what: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'area', 'what', 'evidence', 'fix'] } }, summary: { type: 'string' } }, required: ['pass', 'findings', 'summary'] }
const BUILD_SCHEMA = { type: 'object', properties: { covered: { type: 'string' }, missing: { type: 'string' }, evidence: { type: 'array', items: { type: 'string' } }, bugs: { type: 'string' } }, required: ['covered', 'missing', 'evidence', 'bugs'] }
const reviewPrompt = (c, round) => `You are an exacting visual/motion reviewer (round ${round}) for concept ${c.code} ${c.name} of the JU 「我的局」 redesign. You did NOT build it; judge it as the client would, from REAL screenshots, not source.
Read ${ROOT}/spec/concept-contract.md §0 (quality bar) and §7–8 (verification, definition of done), ${ROOT}/spec/state-inventory.md, and the concept's own ${ROOT}/spec/motion/${c.code}.md. Then run \`cd ${ROOT} && node src/build.js\` and operate the concept with \`node tools/capture.cjs ${c.code} <outdir> '<actions>'\` (see the header of tools/capture.cjs; jump keys are in src/core/ju-data.js JU.INDEX). Cover at least: both home screens; 6 index jumps across participant detail states; the ticket surface with tear (use a drag action) and the contact layer; reschedule reply accept and decline; host manage: applications approve+reject, members, reschedule sheet submit, cancel sheet confirm (watch the burn/void over 8+ frames), end + attendance stamping + correction; drafts delete + undo; empty, single, drafts-only, long-title variants; 0.5× speed on one long effect; .rm reduced-motion result (use eval: inst.toggleRM()). Read EVERY sheet.png and the full-size frames where something looks off.
Grade against the client's acceptance list: first-glance hierarchy; roles clear and same system; time/place/status/action not all at one level; detail & manage quality equal to home; every entry has a complete result and a way back; key motions visible; object/text/occlusion/material continuity before-during-after; cancel/reschedule/end/empty compositions complete; long titles & many members still laid out; Chinese typography quality; no blur/ghost/overlap/white flashes/stuck objects; print/tear/burn phases genuinely present (not two rectangles separating; not particles only; not result-only); panel works (index, speed, scrub, reset, variants); console/log errors empty. Severity: blocker (must fix before the client sees it), major, minor. Be concrete: name the state/action, cite the evidence file and frame numbers, and propose the fix. pass=true only if there are no blockers and at most 3 majors. Write your findings also to ${ROOT}/evidence/${c.code}/review-${round}.md. Final message: structured output only.`
const fixPrompt = (c, review, round) => `You built concept ${c.code} ${c.name} (${ROOT}/concepts/src/${c.file}). An independent reviewer operated it and found the issues below (round ${round}). Fix every blocker and major, and the minors that are quick; keep the concept's design language; re-verify each fix with tools/capture.cjs and Read the frames; keep ${ROOT}/spec/motion/${c.code}.md and ${ROOT}/evidence/${c.code}/ current. Contract: ${ROOT}/spec/concept-contract.md.\n\nREVIEW:\n${JSON.stringify(review, null, 1)}\n\nFinal message: structured output only (what you fixed, what you declined and why, evidence paths).`

phase('Build')
const results = await pipeline(
  codes.map(code => META.find(m => m.code === code)),
  c => agent(BRIEF(c), { label: `build:${c.code}`, phase: 'Build', schema: BUILD_SCHEMA }).then(r => ({ c, build: r })),
  async (prev) => {
    const { c } = prev
    let round = 1, review = null, result = prev
    while (round <= (args.maxRounds || 2)) {
      review = await agent(reviewPrompt(c, round), { label: `review:${c.code}#${round}`, phase: 'Review', schema: REVIEW_SCHEMA })
      result = { ...result, [`review${round}`]: review }
      if (!review || review.pass) break
      const fix = await agent(fixPrompt(c, review, round), { label: `fix:${c.code}#${round}`, phase: 'Fix', schema: BUILD_SCHEMA })
      result = { ...result, [`fix${round}`]: fix }
      round++
    }
    return result
  }
)
return results.filter(Boolean).map(r => ({ code: r.c.code, build: r.build && r.build.missing, pass: Object.keys(r).filter(k => k.startsWith('review')).map(k => r[k] && r[k].pass) }))
