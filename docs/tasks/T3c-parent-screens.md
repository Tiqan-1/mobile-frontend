# T3c — Parent screens

> **Before you start:** read [`CLAUDE.md` §0](../../CLAUDE.md) — the working agreement. In short: **don't commit or push unless asked in this session**; never hand-edit `android/`/`ios/` (they're generated — `app.json` + config plugins instead); install with `npx expo install`, not `yarn add`; stay inside your `Owns` list and report anything outside it rather than fixing it; keep changes surgical (§0.8).
>
> **Keep the Status & checkpoints block below current as you work** — it lives in this file, not in a central tracker. Set the status when you start, tick each checkpoint only once you've *verified* it, and update it again when you stop. If you stop mid-brief, name the exact checkpoint you stopped at.

---

## Status & checkpoints

| | |
|---|---|
| **Status** | ⚪ not started |
| **Owner** | — |
| **Branch** | — |
| **Last updated** | 2026-08-17 |

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [ ] `FamilyHome`
- [ ] `LearnerDetail`
- [ ] `CurriculumBuilder`
- [ ] `LessonEditor`
- [ ] `ParentSettings`
- [ ] Built from the component layer — nothing bespoke inlined
- [ ] Arabic-first, RTL verified on a device

---

**Depends on:** T3b. **Parallel-safe with:** T3d.

## Goal

The parent's side: link a child, author a curriculum, review progress.

## Owns

```
src/features/family/screens/**
src/navigation/   (the Family route additions only — coordinate with whoever last touched it)
```

Not the learner side (T3d), not the player (T3a), not the core (T3b — consume its hooks, don't extend them; if a hook is missing, ask T3b).

## Read first

[`docs/api/family-contract.md`](../api/family-contract.md) and T3b's output.

---

## The scenario you're building

Parent and child each have their own account on their own device.

1. **Link** — parent generates a 6-character invite code; child enters it in their app.
2. **Author** — parent creates *"صيف ٢٠٢٦ — رياضيات وقرآن"*: Levels (weeks) → Tasks (days) → Lessons (items). For a YouTube URL they paste the link and can **trim it** — "just 3:20 to 11:05".
3. **Assign** — the linked learner is auto-subscribed.
4. **Review** — completion, time-on-task, streak, what's overdue.

Everything behind `FEATURE_FAMILY` and the PIN gate from T3b.

---

## Screens

### `FamilyHome`

Entry point. Linked learners with today's status at a glance; empty state driving to "Add a learner". Behind the PIN gate.

### `LinkLearner`

Generates a code via `POST /api/family/invites`, shows it large and legible with its expiry, and offers share-sheet text. Handles regeneration.

The code alphabet excludes ambiguous characters (`0`/`O`, `1`/`I`) — display it in a way that survives being read aloud over the phone, because that's how it will actually be transmitted.

### `CurriculumBuilder`

The hard one. A `Program` → `Level` → `Task` → `Lesson` tree editor.

Design constraint: **a parent is not a course designer.** Don't render the raw four-level hierarchy. Lead with "how many weeks?" and "which days?", generate the Level/Task skeleton, and let them fill days with items. The nesting is an implementation detail — it should never appear in the UI as "Level" and "Task".

Arabic-first, RTL. Dates via the existing `react-native-calendars` (already used in `TodayLessons`) for consistency.

### `LessonEditor`

Add or edit one lesson: title, type, and source.

- **YouTube**: paste a URL → extract the video ID (reuse the parsing from T3a's `FocusPlayer`, don't rewrite it) → preview → optional start/end trim. The trim UI wants a scrubber with two handles and live `mm:ss` readouts; a pair of text inputs is an acceptable v1 if time is short.
- **Hosted**: pick a file → `POST /api/family/media/upload-url` → direct upload → poll for transcode. Show real progress; video uploads are slow and a spinner with no percentage feels broken.
- **PDF / link**: URL entry with validation.

### `LearnerDetail`

Progress for one learner: completion this week, time-on-task, streak, overdue items. From `GET /api/family/learners/{id}/progress`.

If you show `backgroundedCount`, frame it as information — *"left the app 3 times during this lesson"* — not as a violation. It exists to start a conversation, not to accuse a child. **Do not build blocking or punishment on it.**

### `ParentSettings`

PIN change, linked-learner management, unlink (with confirmation — it stops progress reporting).

---

## Notes

**Use the component layer.** Everything comes from `@/components/atoms` and `molecules` post-T2b. If you need something new and generic, build it as a molecule and export it from the barrel — don't inline a bespoke button.

**Arabic-first.** Every string through `t()` with real keys, in both `ar.json` and `en.json`. Test the whole flow in RTL — form layouts and the tree editor are where RTL breaks.

**Offline.** The mock is local, so everything works offline by construction. Make sure the UI doesn't assume that once the real API lands — authoring should queue, not fail, on a bad connection.

---

## Acceptance criteria

1. Full flow works against the mock: link → author (multi-week, multiple lessons per day) → assign → review.
2. Parent screens are unreachable without the PIN.
3. `FEATURE_FAMILY=false` hides every entry point cleanly — no dead nav entries, no crashes.
4. YouTube URL parsing handles `youtu.be/`, `?v=`, and playlist URLs; trim values persist and are honoured by `FocusPlayer`.
5. Hosted upload shows real progress and handles the async transcode.
6. Entire flow verified in **RTL and Arabic**, and in dark mode.
7. No hardcoded strings.
8. `yarn lint`, `yarn test` green.

## Report back

- Curriculum-builder UX decisions, especially how you hid the four-level hierarchy.
- Anything the contract makes awkward — real feedback for the backend team.
- Missing pieces you needed from T3b.
