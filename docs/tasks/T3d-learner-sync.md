# T3d — Learner side and progress sync

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

- [ ] `TodayLessons` surfaces personal curricula alongside org programs
- [ ] Progress telemetry on lesson open / close / finish
- [ ] PDF read position bridged from the Redux `documents` slice
- [ ] Sync worker with an offline queue
- [ ] End-to-end on two simulators: parent authors → learner consumes → parent sees completion

---

**Depends on:** T3b, T3a. **Parallel-safe with:** T3c.

## Goal

The child's side: personal curricula appear alongside org programs, and progress flows back to the parent.

## Owns

```
src/features/family/sync/**     src/features/family/learner/**
src/screens/TodayLessons/**
```

⚠️ **`TodayLessons` was refactored by T2f.** Read their report before you start — build on what they left, don't undo it.

---

## Part 1 — Personal curricula in `TodayLessons`

`TodayLessons` (244 LOC pre-refactor) is the child's daily surface, using `react-native-calendars`.

Guardian-authored programs arrive as ordinary `Subscription`s — that's the whole point of modelling a curriculum as a `Program`. So mostly this **already works**. What's needed:

- A visual distinction between org programs and a parent's curriculum. Keep it warm — *"من والدك"* ("from your parent"), not a compliance badge. A child should feel looked after, not monitored.
- Merge cleanly when both exist on the same day.
- Empty state when the parent hasn't assigned anything yet.

Behind `FEATURE_FAMILY`. With the flag off, `TodayLessons` behaves exactly as T2f left it.

---

## Part 2 — Progress telemetry

`FocusPlayer` (T3a) emits `onStart`, `onProgress(watchedSec)`, `onComplete`, and a background-event count. Read T3a's report for the exact API.

Capture into `LessonProgress`:

```ts
{ lessonId, taskId, levelId, subscriptionId,
  startedAt, finishedAt?, watchedSec, completedPct, backgroundedCount }
```

Rules:

- **`watchedSec` is monotonic.** Re-watching accumulates; scrubbing backwards doesn't decrement.
- `completedPct` from `watchedSec / durationSec`. For a trimmed YouTube lesson, the denominator is `endSec - startSec`, **not** the full video — getting this wrong makes every trimmed lesson look incomplete.
- `backgroundedCount` increments on `AppState` change to `background`/`inactive` *while a lesson is playing*. Ignore transitions outside playback.
- Also capture PDF lessons. `PDFViewerScreen` tracks read position by dispatching `setCurrentPage` to the Redux `documents` slice (**not** via any database — WatermelonDB was removed as dead code). Bridge that into the same progress shape rather than inventing a second model.

Write locally first, always. The app must work fully offline.

---

## Part 3 — Sync worker

`POST /api/progress/sync` with a batch of `LessonProgress`, tracking a `syncedAt` marker per entry in whatever local storage T3b chose.

- **Batch, don't chatter.** Flush on app background, on lesson completion, and periodically — not on every progress tick.
- **Idempotent.** The contract specifies last-write-wins per `lessonId` with `watchedSec` taking the max. Resends must be safe.
- **Retry with backoff.** Failure is normal; never lose local data on a failed sync.
- Mark rows `synced_at` only on confirmed success.
- Handle clock skew — a device with a wrong clock shouldn't corrupt ordering. Prefer server time for `syncedAt`.

Against T3b's mock this is local, but write it as though the network is unreliable, because it will be.

---

## Part 4 — Privacy

The child should be able to see **who is linked to them and what is shared**. A simple read-only screen: "بابا can see your progress on: [curriculum]".

This isn't decoration. A monitoring feature a child doesn't know about is a different product from one they do, and the second is the one worth building. It also matters for app-store review and for whatever consent requirements apply to minors in your jurisdiction.

---

## Acceptance criteria

1. A parent-assigned curriculum appears in `TodayLessons` alongside org programs, visually distinguished.
2. `FEATURE_FAMILY=false` → `TodayLessons` is exactly as T2f left it.
3. Watching a video lesson produces a correct `LessonProgress` row: accurate `watchedSec`, correct `completedPct` **including for trimmed lessons**, `backgroundedCount` only counting during playback.
4. PDF lessons produce progress in the same shape.
5. Airplane mode: progress records locally, survives an app restart, syncs when connectivity returns.
6. Sync is idempotent — force a duplicate batch, confirm no corruption and no double-counting.
7. The child-facing privacy screen exists.
8. Two-device (or two-simulator) end-to-end: child watches → parent's `LearnerDetail` reflects it.
9. RTL, dark mode, `yarn lint`, `yarn test` green.

## Report back

- The trimmed-lesson `completedPct` calculation — this is the easiest thing here to get subtly wrong.
- Sync batching/retry strategy.
- What T2f had changed in `TodayLessons` and how you built on it.
- Anything about the progress contract the backend team should know before implementing.
