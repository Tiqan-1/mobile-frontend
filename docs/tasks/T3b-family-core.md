# T3b — Family core: types, flag, PIN gate, mock API

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

There is no local database. Storage is MMKV.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [ ] `LessonSource` discriminated union + family types
- [ ] `FEATURE_FAMILY` flag
- [ ] PIN gate; PIN in **encrypted** MMKV and never in Redux
- [ ] Mock API covering every endpoint in [`family-contract.md`](../api/family-contract.md)
- [ ] Exposed as react-query hooks, matching T2d's conventions
- [ ] Swap to the real API is a single boundary

---

**Depends on:** T2d. **Parallel-safe with:** T3a.

## Goal

Build the foundation the Family feature sits on — and a **mock backend** so T3c and T3d can build and demo the whole thing before the real endpoints exist.

## Owns

```
src/features/family/types/**    src/features/family/api/**
src/features/family/gate/**     src/features/family/storage/**
src/config/index.ts             (FEATURE_FAMILY flag)
```

Not screens (T3c), not sync (T3d), not the player (T3a).

## Read first

[`docs/api/family-contract.md`](../api/family-contract.md) — the contract you're implementing against. Your mock must match it **exactly**, including error codes, because the swap to the real backend should be a one-module change.

---

## Context

The backend team hasn't built this yet. Everything here runs against a local mock behind `FEATURE_FAMILY`, backed by whichever local storage you pick in step 3.

**The insight that keeps this small:** the existing domain model already *is* a curriculum. `Program → Level → Task → Lesson` maps onto *curriculum → unit → day → item*. A parent-authored curriculum is a `Program` with `ownerType: 'guardian'` and `visibility: 'private'`. **No new content entities.**

---

## Work

### 1. Types — `src/features/family/types/`

Extend `@/types/program` additively:

```ts
// additions to Program
ownerType?: 'org' | 'guardian';    // default 'org'
visibility?: 'public' | 'private'; // default 'public'

// addition to Lesson — keep existing `type` and `url` populated
source?: LessonSource;

type LessonSource =
  | { kind: 'hosted';  mediaId: string; playbackUrl: string; posterUrl?: string; durationSec?: number }
  | { kind: 'youtube'; videoId: string; startSec?: number; endSec?: number }
  | { kind: 'pdf';     url: string }
  | { kind: 'link';    url: string };

interface GuardianLink {
  id: string; guardianId: string; learnerId: string;
  status: 'pending' | 'active' | 'revoked';
  createdAt: string; linkedAt?: string;
}

interface LessonProgress {
  lessonId: string; taskId: string; levelId: string; subscriptionId: string;
  startedAt: string; finishedAt?: string;
  watchedSec: number; completedPct: number; backgroundedCount: number;
}
```

Write a `toLessonSource(lesson: Lesson): LessonSource` adapter that derives a `source` from legacy `type` + `url`, so `FocusPlayer` works on existing content unchanged. This is what lets the feature ship before the backend does.

### 2. Feature flag

`FEATURE_FAMILY` in `src/config/index.ts`, read from `process.env.EXPO_PUBLIC_FEATURE_FAMILY` — `babel-preset-expo` inlines `EXPO_PUBLIC_*` at build time (`CLAUDE.md` §0.3). **Default off.** Every Family entry point checks it. With it off, the app must behave exactly as it does today — verify that, don't assume it.

### 3. Local storage — you choose it

> **There is no local database any more.** An earlier draft of this brief assumed WatermelonDB. On 2026-08-17 it was found to be **entirely unused** (`src/db/* → useProgress → nothing`) and removed along with `src/db/`, `useProgress.ts`, `@nozbe/*` and the legacy-decorators Babel plugin. There is no `progress` table and no existing data to migrate — this is a clean slate.

**Recommendation: MMKV.** It's already a dependency, already carries an `encryptionKey` from T0, and already backs redux-persist. What you're storing is a handful of flat, key-addressable collections:

- `guardian_links` — a short list
- `family_programs` — parent-authored `Program` trees, serialized whole
- `lesson_progress` — a flat map keyed by `lessonId`, which is exactly the shape the sync contract's last-write-wins semantics want

None of that needs relational queries, reactive observers, or migrations. Build a small typed repository module over MMKV and keep the storage detail behind the `FamilyApi` interface, so swapping later costs one file.

**Only reach for `@op-engineering/op-sqlite` if** you find you genuinely need relational queries or expect thousands of progress rows per learner. Justify it in your report if you do — and do **not** reintroduce a reactive ORM for this.

Whatever you pick, **version your persisted shape from day one** (a `schemaVersion` key plus a migrate-on-read function). The old setup had an empty `migrations.ts` because nobody planned for change; don't repeat that.

### 4. Mock API — `src/features/family/api/`

Implement every endpoint in the contract, against your local storage layer, behind **one interface**:

```ts
export interface FamilyApi { /* one method per contract endpoint */ }
export const familyApi: FamilyApi = USE_MOCK ? mockFamilyApi : httpFamilyApi;
```

`httpFamilyApi` can be stubs that throw for now — the point is that the seam exists and the swap is trivial.

Mock rules:
- Match the contract's response shapes and error codes exactly (404 unknown invite, 409 already linked, 403 wrong guardian)
- Simulate realistic latency, so the UI's loading states get exercised
- Support both roles on one device via a dev toggle — you'll need to demo parent and learner without two accounts
- Seed data for development

Expose it through **react-query hooks** matching T2d's conventions, not raw calls.

### 5. PIN gate — `src/features/family/gate/`

Parent screens sit behind a PIN.

- Stored in MMKV **using the `encryptionKey` T0 added** — never plaintext, and never in Redux (it persists to disk).
- Set on first Family use; verified on entry; a reset path that requires re-authentication.
- A `<ParentGate>` wrapper or a `useParentGate()` hook that T3c composes.

This replaces the swipe-sequence `isSU` easter egg in `Menu` in spirit — **but don't touch `Menu`**, it's T2f's file. Note the overlap in your report.

A PIN is a speed bump against a curious child, not a security boundary. Don't gate anything genuinely sensitive behind it alone.

---

## Acceptance criteria

1. With `FEATURE_FAMILY=false`, the app is byte-for-byte behaviourally identical to today.
2. Every contract endpoint has a mock implementation and a react-query hook.
3. The persisted shape is versioned, and a migrate-on-read path exists and is tested (even though there is no legacy data today).
4. PIN is stored encrypted; verified; resettable.
5. `toLessonSource()` correctly maps all three legacy `type` values, with tests.
6. Swapping `USE_MOCK` compiles (even though HTTP calls throw).
7. `yarn lint`, `yarn test` green.

## Report back

- Any place the contract was ambiguous — that's feedback for the backend team **before** they build.
- Which storage you chose and why (MMKV unless you can justify otherwise).
- The `Menu`/`isSU` overlap, for T2f.
