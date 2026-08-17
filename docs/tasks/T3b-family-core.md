# T3b — Family core: types, flag, PIN gate, mock API

**Depends on:** T2d. **Parallel-safe with:** T3a.

## Goal

Build the foundation the Family feature sits on — and a **mock backend** so T3c and T3d can build and demo the whole thing before the real endpoints exist.

## Owns

```
src/features/family/types/**    src/features/family/api/**
src/features/family/gate/**     src/db/**
src/config/index.ts             (FEATURE_FAMILY flag)
```

Not screens (T3c), not sync (T3d), not the player (T3a).

## Read first

[`docs/api/family-contract.md`](../api/family-contract.md) — the contract you're implementing against. Your mock must match it **exactly**, including error codes, because the swap to the real backend should be a one-module change.

---

## Context

The backend team hasn't built this yet. Everything here runs against a local mock backed by WatermelonDB, behind `FEATURE_FAMILY`.

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

`FEATURE_FAMILY` in `src/config/index.ts`, driven from `.env`. **Default off.** Every Family entry point checks it. With it off, the app must behave exactly as it does today — verify that, don't assume it.

### 3. WatermelonDB schema

Current: schema v1, one table `progress` (`subscription_id`, `level_id`, `task_id`, `completed`, `completed_at`, `synced_at`). Model at `src/db/models/Progress.ts`, empty `migrations.ts`.

Add tables for `guardian_links`, `family_programs` (+ levels/tasks/lessons), and `lesson_progress`, and **extend `progress` to lesson granularity** — it's currently task-level, but progress is reported per lesson.

**Write real migrations.** `migrations.ts` is empty because the schema has never changed; this is the first change, and getting the pattern right now matters. Existing users have `progress` rows — don't drop them.

Models use **legacy decorators** (`@babel/plugin-proposal-decorators`). Follow the existing `Progress.ts` style, but type the fields properly — the current model is untyped.

> If T1a's spike replaced WatermelonDB, apply all of this to the replacement instead. The shape holds either way.

### 4. Mock API — `src/features/family/api/`

Implement every endpoint in the contract, against WatermelonDB, behind **one interface**:

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
3. WatermelonDB migrations run cleanly against a **pre-existing** database with `progress` rows — test the upgrade path, not just a fresh install.
4. PIN is stored encrypted; verified; resettable.
5. `toLessonSource()` correctly maps all three legacy `type` values, with tests.
6. Swapping `USE_MOCK` compiles (even though HTTP calls throw).
7. `yarn lint`, `yarn test` green.

## Report back

- Any place the contract was ambiguous — that's feedback for the backend team **before** they build.
- The migration strategy for existing `progress` rows.
- The `Menu`/`isSU` overlap, for T2f.
