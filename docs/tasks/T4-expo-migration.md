# T4 — Migrate to Expo (SDK 57 / CNG)

> **Before you start:** read [`CLAUDE.md` §0](../../CLAUDE.md) — the working agreement. In short: **don't commit or push unless asked in this session**; never hand-edit `android/`/`ios/` (they're generated — `app.json` + config plugins instead); install with `npx expo install`, not `yarn add`; stay inside your `Owns` list and report anything outside it rather than fixing it; keep changes surgical (§0.8).
>
> **Keep the Status & checkpoints block below current as you work** — it lives in this file, not in a central tracker. Set the status when you start, tick each checkpoint only once you've *verified* it, and update it again when you stop. If you stop mid-brief, name the exact checkpoint you stopped at.

---

## Status & checkpoints

| | |
|---|---|
| **Status** | ✅ done as a migration — **all remaining work is [T6](T6-expo-hardening.md)** |
| **Owner** | Mahmoud + Claude Code |
| **Branch** | landed on `feat/expo`, committed as `62a8459` / `99b3689` |
| **Last updated** | 2026-08-18 |

The project is on Expo SDK 57 / CNG and stays there. Phases E (iOS), F (Expo-native wins) and G (EAS) were never done and are now **[T6](T6-expo-hardening.md)**, along with the platform decisions this brief deferred. **Pusher was removed, not migrated** — that stayed an [unowned open item](README.md#unowned-open-items), deliberately, because it's an architecture choice rather than migration work.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [x] P1 — babel plugin fix
- [x] Phase A — reversible prep
- [x] Phase B — `app.json` native config
- [x] Phase C — metro config (plus 2 runtime crashes found and fixed afterwards)
- [x] Phase D — prebuild + Android, **static parts only**
- [x] Phase D — live Android build verified during T0 (`expo prebuild -p android --no-install` → `assembleDebug` → APK, 676/676 tasks)
- [x] Migration reviewed and committed by the owner
- [x] Phase E — iOS → **moved to [T6](T6-expo-hardening.md)**
- [x] Phase F — `expo-image` and the other wins → **moved to [T6](T6-expo-hardening.md)**
- [x] Phase G — EAS Build → **moved to [T6](T6-expo-hardening.md)**
- [x] Realtime replacement for `LessonChat` → **stays an [unowned open item](README.md#unowned-open-items)**, not Expo work

---

**Verdict: yes, do it — but not with a fire-and-forget agent.** See "Why not just delegate this" below.

**Depends on:** a green-ish baseline (see Prerequisites). **Superseded for all remaining work by [T6](T6-expo-hardening.md)** — Phases E, F and G moved there along with the deferred platform decisions. This brief is kept as the record of what the migration did.

---

## Status (2026-08-17)

**P1, Phase A–C done. Phase D done except the actual `expo run:android` build/launch (left for the app owner to run — an agent isn't the right place to verify a live build). Phase E (iOS) explicitly not started.**

What actually happened deviated from the plan in one big way: **`npx install-expo-modules@latest` doesn't support SDK 57 / RN 0.86.2 yet** (its version table tops out at SDK 56 and it hard-errors). Worked around it by hand-adding `expo`, `expo-modules-core`, `expo-font` at the versions `expo`'s own `package.json` pins, and — separately, mid-task — the app owner scaffolded a fresh `create-expo-app` project and moved the real `src/` into it, so the rest of the migration (package.json merge, `app.json`, `babel.config.js`, `metro.config.js`) happened against that base rather than incrementally on the original bare project. Net result is the same shape Phase B/C describe; see CLAUDE.md §2/§3 for the config that actually landed.

**Pusher was removed, not migrated.** It's the "genuine unknown" this brief flagged (§ "Why not just delegate this", point 2) — rather than prove autolinking under CNG, it was pulled out entirely. `LessonChat` now polls (5s `refetchInterval`) instead of subscribing realtime. **This is the biggest open item**: pick a real replacement (config plugin, plain WebSocket client, different provider) before this can be called done. See CLAUDE.md §3.

`android/` and `ios/` were deleted and gitignored (the brief's own Rollback section, item 3, suggested this *after* Phase D succeeded — it happened earlier than planned, at the app owner's direction). They regenerate via `npx expo prebuild`.

Two real bugs were caught and fixed as a direct result of the `app.json` restructuring (flat `{name, displayName}` → `{expo: {name, ...}}`): `index.js`'s `AppRegistry.registerComponent(appName, ...)` was reading the old shape (would have registered `undefined` — not caught by `tsc` since it's a `.js` file) and `src/reactotron.config.ts` had the same issue. Also found: a tsconfig alias the template merge introduced (`"@/assets/*": ["./assets/*"]`) was shadowing the app's real, heavily-used `@/assets/...` imports — removed.

Two Metro runtime crashes were hit and fixed after this doc's static work was "done" (see CLAUDE.md's "Native config" subsection under §3 for the technical detail): a `mergeConfig`-sourced-from-the-wrong-package bug, and `react-native-svg-transformer` needing its `/expo` entry point instead of `/react-native` under `expo/metro-config`. Both are exactly the class of "fails silently, surfaces as an unrelated-looking crash later" bug this brief's intro warns about.

Also found and fixed in passing: `react-native-webview` was never actually a declared dependency despite `react-native-youtube-iframe` requiring it (pre-existing gap, unrelated to Expo — just hadn't been exercised by Metro before).

Not done, not attempted: **the app icon** (neither platform has ever had a real one — pre-existing, unrelated to Expo, but `app.json` now needs a real 1024×1024 source) and **the native display name mismatch** (both platforms show "مبادرة" pre-migration; `app.json` now says "Binaa" — a real, user-visible change that needs a conscious yes/no, not a silent default). See CLAUDE.md §9.

---

## Why now

An earlier assessment said "no, not now" because of one hard blocker (WatermelonDB). That blocker turned out to be dead code and is gone. What's left is a favourable set-up:

| Condition | Status |
|---|---|
| WatermelonDB (needed native edits CNG destroys) | ✅ **Removed** — it was dead code |
| Custom native surface expressible in Expo config | ✅ Verified — fonts, 4 Info.plist keys, 1 permission, signing. Nothing else. |
| `MainActivity.kt` / `MainApplication.kt` / `AppDelegate.swift` | ✅ Unmodified template files |
| Deep links / URL schemes / custom intent-filters | ✅ **None** — only the standard LAUNCHER intent |
| RN version vs Expo SDK 57 | ✅ **0.86.2 == 0.86.2 exactly.** Zero version movement required |

That last row is the rare part. Normally an Expo migration also drags an RN version change with it; here it doesn't. You are already sitting on precisely the version SDK 57 pins. This is the cheapest this migration will ever be.

### The argument from your own repo

During the hand-upgrade, `ios/Podfile` was regenerated and silently lost `pod 'simdjson'` — a dependency WatermelonDB needed to function. Nothing failed loudly; it would have surfaced as a confusing iOS runtime bug. (Moot now, since WatermelonDB is gone — but it's a clean demonstration of the failure mode.)

Separately: `android/sentry.properties` exists, but **no commit in this repo has ever applied a Sentry gradle plugin** in `android/app/build.gradle`. Android symbol upload has never worked. Nobody noticed.

Both are the same class of problem — hand-maintained native config drifts and rots, quietly. Config plugins re-apply themselves on every `prebuild`, so they can't silently go missing. `@sentry/react-native` ships an official Expo plugin that wires **both** platforms, which would fix the second bug as a side effect of migrating.

### The one permanent cost

**Expo caps your RN version at whatever the current SDK ships.** Today that's 0.86.2 (0.87.0 is unavailable — no SDK ships it). You tried 0.87 and retreated; under Expo you wouldn't have had the option. Accept this consciously — it's the trade for never hand-editing AGP versions again.

---

## Why not just delegate this to an agent

You asked whether to fire an agent at it. Four reasons not to:

1. **iOS verification needs a real Xcode build on a real machine.** An agent can't confirm the half of the migration most likely to break.
2. **Pusher is a genuine unknown** — `@pusher/pusher-websocket-react-native` has no config plugin. It should autolink; nobody has proven it.
3. **Your baseline isn't verifiable right now.** Tests: 4 suites fail, 0 run. `tsc`: 163 errors. If the app breaks after migrating you won't be able to tell Expo from pre-existing damage.
4. **Signing and EAS need your credentials** — Play Console, Apple, Huawei.

Reason 3 is fixable in about ten minutes (see Prerequisites), and reasons 1 and 4 need you regardless.

**What an agent *can* usefully do:** Phases A–D (through the Android build). All reversible, all verifiable without Xcode. Phases E–G need you.

---

> ## ⚠️ Everything below is the executed plan — do not run it
>
> Phases P1 and A–D **have been done** and committed. They are kept here as the record of what the migration changed and why, which is worth having when something native breaks. **Do not follow these instructions**: several describe a repo state that no longer exists (`ios/Podfile`, `babel-plugin-inline-dotenv`, `yarn add`), and the current rules are in [`CLAUDE.md` §0.3](../../CLAUDE.md). Remaining work is [T6](T6-expo-hardening.md).

---

## Prerequisites — do these first

**P1. Fix the Babel plugin (one line).** `babel.config.js` references `'transform-inline-environment-variables'`, undeclared in `package.json`. This is why 0 tests run. Either `yarn add -D babel-plugin-transform-inline-environment-variables` or drop the plugin if `.env` handling moved.

**P2. Establish a known-good build, today, before touching anything.** Build and run **both** platforms on the current bare setup and note what works. Without this comparison point the migration is unfalsifiable.

`ios/Podfile.lock` is currently missing — run `pod install` as part of this.

**P3. Commit.** Migrate from a clean tree on a dedicated branch (`feat/expo`). You will want `git checkout .` at some point.

You do **not** need the 163 `tsc` errors fixed first. They're mostly `noUnusedLocals` noise, they pre-date all of this, and the success signal here is "the app builds and runs," not "tsc is green."

---

## Phase A — Reversible prep (no prebuild)

```bash
npx install-expo-modules@latest
```

This adds `expo` + `expo-modules-core` to a **bare** app and wires the native glue. It does *not* take over `android/`/`ios/`. Fully reversible.

Then verify **both platforms still build and run exactly as before.** If they don't, stop — nothing later will be easier.

At this point you can already use `expo-*` packages. If you go no further, this alone unlocks `expo-image` (replacing abandoned `react-native-fast-image`) and `expo-updates`.

---

## Phase B — Express the native config as Expo config

`app.json` is currently just `{ name, displayName }`. It needs to describe everything the native projects currently encode. Target shape:

```jsonc
{
  "expo": {
    "name": "Binaa",
    "slug": "binaa",
    "version": "1.0.1",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "ios": {
      "bundleIdentifier": "com.binaa",
      "buildNumber": "5",
      "infoPlist": {
        "CADisableMinimumFrameDurationOnPhone": true,
        "NSLocationWhenInUseUsageDescription": "<copy the existing string verbatim>",
        "NSAppTransportSecurity": { "NSAllowsArbitraryLoads": true, "NSAllowsLocalNetworking": true }
      }
    },
    "android": {
      "package": "com.binaa",
      "versionCode": 5,
      "permissions": ["android.permission.INTERNET"],
      "edgeToEdgeEnabled": false
    },
    "plugins": [
      ["expo-font", { "fonts": [
        "./src/assets/fonts/cairo/Cairo-Black.ttf",
        "./src/assets/fonts/cairo/Cairo-Bold.ttf",
        "./src/assets/fonts/cairo/Cairo-ExtraLight.ttf",
        "./src/assets/fonts/cairo/Cairo-Light.ttf",
        "./src/assets/fonts/cairo/Cairo-Regular.ttf",
        "./src/assets/fonts/cairo/Cairo-SemiBold.ttf"
      ]}],
      ["@sentry/react-native/expo", { "organization": "<from sentry.properties>", "project": "<from sentry.properties>" }]
    ],
    "newArchEnabled": true
  }
}
```

Notes:

- **`NSAppTransportSecurity` with `NSAllowsArbitraryLoads: true`** is currently set. Carry it over so nothing breaks, then **question it separately** — App Store review asks about it, and the API is HTTPS. Not this brief's job, but flag it.
- **Fonts move from `react-native.config.js` to `expo-font`.** The `assets: ['./src/assets/fonts/cairo']` entry and the `UIAppFonts` array both become generated. Font *filenames* must stay identical — `src/theme/typography.ts` references families by exact name.
- **`react-native.config.js` can be deleted** once fonts move. Its only other content is a `react-native-vector-icons` override for a package that isn't a dependency.
- **The Sentry plugin fixes a real bug** — it wires Android symbol upload, which has never worked here.
- **Keep `edgeToEdgeEnabled: false`** for now. Turning it on is a separate, visual change — it is [T6](T6-expo-hardening.md) §5, and no longer optional: prebuild already warns the setting is going away.
- **`newArchEnabled: true`** — already on; don't silently drop it.

---

## Phase C — Metro config

The fiddliest part. Current `metro.config.js` stacks three things on `@react-native/metro-config`:

```js
withSentryConfig( mergeConfig( defaultConfig, wrapWithReanimatedMetroConfig(config) ) )
```

plus `react-native-svg-transformer`, and `unstable_allowRequireContext: true` (needed by `src/theme/assets/getAssetsContext.ts`).

Swap the base to `expo/metro-config` and preserve all four:

```js
const { getDefaultConfig } = require('expo/metro-config');
// then re-apply: svg-transformer, unstable_allowRequireContext,
// wrapWithReanimatedMetroConfig, withSentryConfig — in that order
```

Verify explicitly after: an SVG import renders, Reanimated animates, `require.context` still resolves theme assets. These fail quietly, so check them by hand rather than assuming a clean bundle means success.

---

## Phase D — Prebuild and Android

```bash
npx expo prebuild --clean
```

This **regenerates `android/` and `ios/` from `app.json`.** Everything not expressed in config is lost — that's the entire point, and also the risk. Phase B is what makes it safe.

Before running it, diff your current native projects one last time and confirm nothing is left that Phase B didn't capture.

Then:

```bash
npx expo run:android
```

Verify: app launches · **Cairo fonts render** (most likely casualty) · Arabic/RTL correct · SVGs render · login works · PDF opens · video plays · lesson chat loads (it polls now — Pusher is gone, §3) · New Arch on (`global.nativeFabricUIManager` defined).

Restore the `MYAPP_UPLOAD_*` signing config — under CNG this moves to EAS credentials or an `expo-build-properties` plugin.

### The Pusher question — how it was actually settled

*(Historical. Do not execute this.)* The plan was to prove `@pusher/pusher-websocket-react-native` autolinks under prebuild, since it has no config plugin. That test was never run — **Pusher was removed instead**, and `LessonChat` now polls its react-query chat query every 5s (`TODO(T4)` in that file). Choosing a real realtime story is an [unowned open item](README.md#unowned-open-items).

---

## Phases E, F, G — moved to [T6](T6-expo-hardening.md)

The migration stopped after Phase D. Three phases were written here and never run:

| Phase | Was | Now |
|---|---|---|
| **E** | iOS prebuild, pods, signing, build | [T6](T6-expo-hardening.md) §7 |
| **F** | `expo-image` for `react-native-fast-image`; `expo-updates` for `react-native-restart` | [T6](T6-expo-hardening.md) §3 |
| **G** | EAS Build instead of Fastlane | [T6](T6-expo-hardening.md) §9 |

They moved because they aren't migration steps — they're ongoing Expo maintenance, and leaving them inside a completed brief meant nobody owned them. **Don't execute them from here.**

---

## Rollback

Phases A–C are ordinary commits — `git revert`.

Phase D is the one-way door, because `prebuild --clean` overwrites the native projects. Mitigations:

1. Work on `feat/expo`; `main` keeps working native projects.
2. **Tag the commit before prebuild** (`git tag pre-expo-prebuild`).
3. Consider adding `android/` and `ios/` to `.gitignore` *after* the migration succeeds — the Expo convention, since they're generated. Do it as a separate commit so the deletion is reviewable.

---

## Acceptance criteria

1. `npx expo prebuild --clean` regenerates both platforms from `app.json` with no manual edits afterward.
2. Both platforms build and run.
3. Full manual pass: login → programs → subscribe → today's lessons → PDF → video → **lesson chat** (now polling, not Pusher — §3) → menu → logout.
4. **Cairo fonts render on both platforms**, Arabic and RTL correct.
5. SVGs render; Reanimated animates; `require.context` theme assets resolve.
6. New Arch confirmed on.
7. Sentry reports a test crash from both platforms, **with symbols** — this is now expected to work on Android for the first time.
8. Release builds sign correctly.
9. `yarn test` no worse than the P1 baseline.
10. No file under `android/` or `ios/` is hand-edited after prebuild. If you needed to, that's a missing config plugin — write it.

Criterion 10 is the real test. If you're hand-patching generated files, you have the costs of both models and the benefits of neither.

## Report back

- ~~Pusher verdict~~ — answered by removal, not by test. See above.
- Anything that needed a hand-written config plugin.
- Anything in the old native projects that Phase B failed to capture, found only after prebuild.
- Whether ATS `NSAllowsArbitraryLoads` is still needed (separate question, but you'll be looking right at it).
