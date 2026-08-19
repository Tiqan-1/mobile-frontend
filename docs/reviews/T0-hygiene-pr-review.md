# T0-Hygiene PR Review

> **Branch:** `feat/T0-hygiene`
> **Reviewer:** opencode (automated review); re-verified, corrected, and fixed 2026-08-18; owner reviewed the fixes same day and clarified risk on two items
> **Re-verified against:** `628a2e6` (HEAD), working tree
> **Baseline:** `tsc` 170 errors, `yarn lint` crashes (ESLint 8 vs unicorn@61), `yarn test` 3 fail / 1 pass

> **Correction note (this is the load-bearing one — read it before the tables below):** the original review flagged three "Critical" items. All three turned out to need correction, not the fix the review suggested:
> - **`.env` tracked with a real Telegram token / Sentry DSN** — the review said untrack it. Wrong: `CLAUDE.md` §9 documents the owner removed `.env` from `.gitignore` *deliberately* in `06fa36e`. On top of that, **the owner has now confirmed (2026-08-18) both values are dummy/test data, not production secrets** — so there's no rotation to do either. This item is closed.
> - **`App.tsx`'s hardcoded Sentry DSN** — genuinely inconsistent with the `EXPO_PUBLIC_*` pattern used elsewhere, so a first pass switched it to `process.env.EXPO_PUBLIC_SENTRY_DSN`. The owner reverted that back to the literal. Since the value itself is confirmed dummy, the literal carries no risk either way — the revert stands as the current, intentional state.
> - **Login's "Fast Login Dev" `__DEV__` button (`m@m.com`/`Aa@123123`)** — a first pass removed it, reading the brief's own C8 checkpoint (which claimed this was already done) as the bar to hit. The owner reverted that too and confirmed **it's a dummy test account — no risk.** It's `__DEV__`-gated, which means Metro's dead-code elimination strips the whole block from release bundles; it never ships regardless.
>
> Net effect: nothing about secrets or dummy credentials needs further action. What's genuinely fixed and still standing from this pass is the `Fastlane/Fastfile` `patch-package` bug (Serious #4) — real crash risk, unrelated to the secrets question, not reverted.

---

## Pass Criteria

| Criterion | Status | Notes |
|---|---|---|
| `yarn lint:rules` | ✅ Pass | 0 errors, 15 warnings (all `perfectionist/sort-union-types`, pre-existing, outside Owns) |
| `yarn test` | ⚠️ Partial | 1/2 suites pass. `App.test.tsx` (real smoke test of `src/App.tsx`) passes. `Skeleton.test.tsx` fails — pre-existing, T2d's blocker (`__mocks__/TestAppWrapper.tsx`, see A6) |
| `tsc --noEmit` | 147 errors | Only T0's own files cleaned; rest are T2b/T2d/T2e/T2f's |
| `--frozen-lockfile` | Not tested | Needs CI run |
| Android APK build | Verified separately | `assembleDebug` succeeded 46m32s, 676/676 tasks (see brief's Part E note) |
| `.env` tracked with Telegram token / Sentry DSN | ✅ No risk | Deliberate tracking (`CLAUDE.md` §9) + owner-confirmed dummy values. Closed. |
| Sentry DSN hardcoded in `App.tsx` | ✅ No risk | Same dummy value as `.env`. Owner's call to keep it inline. Closed. |
| Login / ForgotPassword dummy dev credentials | ✅ No risk | Owner-confirmed dummy test account, `__DEV__`-gated, never ships. Closed. |
| `Fastlane/Fastfile` `patch-package` call | ✅ Fixed | Real crash risk, unrelated to the above — line removed, stands |

---

## Closed — no risk, owner-confirmed (2026-08-18)

### 1. `.env`'s Telegram bot token and Sentry DSN

Both values are dummy/test data, confirmed by the repo owner. `.env` stays tracked and out of `.gitignore` on purpose (`06fa36e`) — that was always deliberate; what this pass adds is that there's nothing sensitive in it to protect in the first place. No rotation, no untracking, no further action. `docs/tasks/README.md`'s "Secrets" section and `T0-hygiene.md`'s C2 checkpoint have been updated to match.

### 2. `App.tsx`'s inline Sentry DSN literal (`src/App.tsx:17`)

Same dummy value as `.env`'s `EXPO_PUBLIC_SENTRY_DSN`. A first pass swapped it for `process.env.EXPO_PUBLIC_SENTRY_DSN` for consistency with `telegram.ts`'s pattern; the owner reverted it back to the literal. Purely a style/consistency question now, not a risk question — left as the owner set it.

### 3. Login's "Fast Login Dev" button (`src/screens/auth/Login/index.tsx:163-171`) and `ForgotPassword`'s `__DEV__ ? 'm@m.com' : ''` default (`src/screens/auth/ForgotPassword/index.tsx:24`)

Both are the same dummy test-account pattern. Owner-confirmed no risk. Both are `__DEV__`-gated (Login's explicitly; ForgotPassword's via the ternary), so Metro strips them from release bundles — they're dev-only even leaving the source as-is. No further action on either.

---

## Fixed and standing — unrelated to the above

### 4. Fastlane iOS lane called removed `patch-package`

`Fastlane/Fastfile:110` ran `yarn(command: "patch-package")` in the iOS `beta` lane. `patch-package` was removed from `package.json` in T0's A3 (confirmed gone — no dependency, no `postinstall`, no `patches/` dir). This call would fail on any real iOS release build — a genuine crash risk, nothing to do with secrets or dummy data. **Fixed:** line removed, not reverted.

---

## Serious — reported, not fixed (outside Owns or not yet actionable)

### 5. Bundle identifier mismatch — partially resolved

| Location | Bundle ID | Status |
|---|---|---|
| `app.json` iOS / Android | `com.binaa` | — |
| `Fastlane/APPCONST` (both platforms) | `com.binaa` | ✅ Already matches — fixed prior to this pass. (`docs/tasks/README.md`'s note claiming `com.ebda3.binaa` was stale; corrected there too.) |
| `Fastlane/Appfile` iOS | `com.dl.sdccards` (commented out, inactive) | Not fixed — `Fastlane/Appfile` is not in T0's `Owns` list (only `Fastlane/Fastfile` is). Confirmed inert: every Fastfile action passes `app_identifier:`/`package_name:` explicitly from `APPCONST`, so `Appfile`'s stale values are never actually consulted. Cosmetic debt, not a live bug. |
| `Fastlane/Appfile` Android | `''` (empty) | Same as above — inert, not fixed, not in Owns |

### 6. Huawei `client_secret` — claim doesn't match current Fastfile; no live bug

Earlier reports (the brief, `docs/tasks/README.md`) described the Huawei client secret as wired to `Fastlane/Fastfile` via `ENV.fetch("HUAWEI_CLIENT_SECRET")`. **Current `Fastlane/Fastfile` has no Huawei AppGallery upload lane at all** — no `client_secret:` reference anywhere in the file. Only `Fastlane/.env.example` (placeholder) and `Fastlane/Pluginfile`'s `fastlane-plugin-huawei_appgallery_connect` gem exist; there's no actual `Fastlane/.env` and nothing currently reads it. Not a crash risk today (dead code can't crash), but the "done" claim doesn't hold up — either the lane was never actually added, or it was added and lost in a later commit. Building a real Huawei lane is new functionality, not a hygiene fix — flagged for whoever owns the Huawei release path. **Unrelated to the secret-rotation question**: the Huawei *client secret itself* (a real AppGallery Connect credential, separate from anything in `.env`) is still a legitimate outstanding rotation — see Outstanding Human Actions below.

---

## Additional — Missing from Review

### A2. Theme / colors broken at runtime (`ThemeContext` + `colors`)
`ThemeContext.tsx` compares stale `isDark` and calls `toDark()`/`toLight()` which mutate `var PALETTE` in `colors.ts`. Dark mode is broken; `Login/index.tsx` (T0-owned) still imports `PALETTE` directly (line 17) — not fixed this pass, out of C2/C8's scope, T2a owns the full theme fix.

### A3. `navigation/types.ts` references globals without imports
Imports `Lesson`, `Program`, `Subscription` but relies on implicit globals rather than named imports. Separately, `Subscription` currently resolves from `react-redux`, not `@/types/program` — a live type-correctness bug, not just noise. Not T0-owned. Reported.

### A4. `store/index.ts` — MMKV has no `encryptionKey`
`new MMKV()` with no `encryptionKey`; auth `token`/`refreshToken` persisted in plaintext. Blocked on T2d's file ownership (T0's C3 checkpoint is explicitly `⏸️ blocked`, not silently skipped).

### A5. `typography.ts` imports dead `react-native-render-html`
Nothing in `src/` consumes the `systemFonts` export this produces. T6 deletes the dependency; T2a removes the import. Not T0-owned.

### A6. `Skeleton.test.tsx` blocked by `__mocks__/TestAppWrapper.tsx`
Wrapper imports `queryClient, storage` from `@/App`; `App.tsx` exports neither (no `QueryClientProvider`). Pre-existing, not a T0 harness gap. T2d owns.

### A7. `package-old.json` still tracked
Stale duplicate of `package.json` pre-migration. Not in T0's enumerated deletion list — reported, not deleted.

### A8. `Gemfile` `plugins_path` case mismatch
Points at lowercase `fastlane/Pluginfile`; real directory is `Fastlane` (capital F). Works only on case-insensitive macOS; breaks Linux CI. Not in T0's `Owns` list. Reported.

---

## What's Done Well

- **C1 (subscriptionSlice):** `state.items = action.payload` restored. Confirmed.
- **C2 (secrets):** Telegram via `process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN ?? ''`; Sentry DSN and Login/ForgotPassword dummy credentials confirmed no-risk by the owner (see Closed section above).
- **C4 (API):** `isTest = isDevApi` driven by `__DEV__`. `EXPO_PUBLIC_API_URL` overrides when set.
- **C6 (Menu dispatch):** `setisSUAuth` moved from render body to `useEffect`. Correct.
- **C7 (Fastlane):** `Integer#max` crash fixed. `APP_VERSION_NAME` reads from `app.json`. `patch-package` call removed (this pass, standing).
- **C8 (Login):** `.catch` added; `initialValues` no longer defaults to a real-looking credential; the dev-only shortcut button is confirmed dummy and intentionally kept.
- **B3 (Jest):** Solid config — `moduleNameMapper`, `transformIgnorePatterns`, custom resolver for worklets, proper `setupFiles`/`setupFilesAfterEnv`.
- **B1 (ESLint):** Flat config well-structured with T0-owned comments explaining every disabled rule.
- **Part E (CI):** Complete workflow with prebuild → gradle, JUnit upload, non-blocking type-check ratchet.
- **Part D (Deletions):** Root `App.tsx`, `OldThem/**`, `Example/**` all removed. `src/screens/index.ts` updated.

---

## What's remaining

Everything below is a real, still-open item — nothing here was downgraded by the dummy-data clarification:

- **C3 (MMKV `encryptionKey`)** — blocked on `src/store/index.ts`, T2d's file, not T0's `Owns`.
- **Huawei AppGallery client secret rotation** — a real, separate credential from anything in `.env`; still outstanding, human-only.
- **Android upload keystore reset** — password `12345678` is in git history; still outstanding, human-only.
- **A real Huawei upload lane in `Fastlane/Fastfile`** — doesn't exist yet (Serious #6); new functionality, unowned.
- **`Fastlane/Appfile`'s stale bundle IDs** — inert but not cleaned up; not in T0's `Owns`.
- **A2–A8 above** — theme/dark-mode, `navigation/types.ts`, MMKV encryption, dead `render-html` import, `Skeleton.test.tsx` blocker, `package-old.json`, `Gemfile` case mismatch — all reported, none T0-owned, all tracked in `docs/tasks/README.md`'s unowned open items.
- **`docs/tasks/README.md`'s "Secrets" and unowned-items sections** were updated alongside this file to match the owner's clarification and the current Fastfile/APPCONST state — worth a quick read if working from that file instead of this one.

---

## Outstanding Human Actions

| # | Credential | Status | How to rotate |
|---|---|---|---|
| 1 | Telegram bot token | ✅ Closed — confirmed dummy, no action needed | — |
| 2 | Huawei AppGallery client secret | Still outstanding | AppGallery Connect → API client → regenerate → update `Fastlane/.env` (once a real Huawei lane exists — see Serious #6) |
| 3 | Android upload keystore | Still outstanding | Password is `12345678` in git history. Play Console → upload-key reset |

---

## Summary

Of the original three "Critical" findings, all three needed correction rather than the fix the review proposed: the tracked `.env` and the hardcoded Sentry DSN and Login dev credentials are all confirmed dummy/no-risk by the repo owner, and `.env`'s tracking is deliberate per `CLAUDE.md` §9. The one Serious finding that was a genuine, unrelated bug — `Fastlane/Fastfile`'s dead `patch-package` call, which would crash any real iOS release build — is fixed and stands. The bundle-identifier and Huawei-secret items are partly resolved (`APPCONST` already matched `app.json`) and partly not actionable within T0's `Owns` list or without new functionality. Two credential rotations remain genuinely outstanding — Huawei's client secret and the Android upload keystore — both unrelated to the dummy-data items closed in this pass. `tsc`/`lint`/`test` counts are unchanged from baseline re-measurement (147 / 0 errors+15 warnings / 1 of 2 suites).
