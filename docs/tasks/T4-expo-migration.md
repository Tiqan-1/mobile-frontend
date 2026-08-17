# T4 — Migrate to Expo (SDK 57 / CNG)

**Verdict: yes, do it — but not with a fire-and-forget agent.** See "Why not just delegate this" below.

**Depends on:** a green-ish baseline (see Prerequisites). **Conflicts with:** any brief owning `android/**`, `ios/**`, `metro.config.js`, or `package.json` — this cannot run in parallel with T1b or T1c.

---

## Why now

The [assessment](../expo-migration-assessment.md) said "no, not now" because of one hard blocker. That blocker is gone. What's left is a favourable set-up:

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
- **Keep `edgeToEdgeEnabled: false`** for now. Turning it on is a separate, visual change (see T1b).
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

Verify: app launches · **Cairo fonts render** (most likely casualty) · Arabic/RTL correct · SVGs render · login works · PDF opens · video plays · **lesson chat connects (this is the Pusher test)** · New Arch on (`global.nativeFabricUIManager` defined).

Restore the `MYAPP_UPLOAD_*` signing config — under CNG this moves to EAS credentials or an `expo-build-properties` plugin.

### The Pusher question — settle it here

`@pusher/pusher-websocket-react-native` has no config plugin. It should autolink under prebuild. If lesson chat connects on Android, it's fine. If it doesn't, options are: write a small config plugin, replace with a plain WebSocket client against Pusher's protocol, or stop the migration. **Test this before Phase E** — it's the one thing that could invalidate the whole exercise.

---

## Phase E — iOS (needs you)

```bash
npx expo prebuild --clean -p ios && npx expo run:ios
```

Same verification list. Additionally: fonts (iOS registers them differently), the ATS settings, and Sentry dSYM upload.

You have `xcodebuild` MCP configured — useful for build/scheme/simulator work and log capture here.

---

## Phase F — Take the wins

Now that Expo modules are available:

- **`expo-image`** replaces `react-native-fast-image` (abandoned 2022, no New Arch support). Three call sites: `VideoModal`, `MainScreen`, `Programs`. Coordinate with T2e/T3a, which refactor those files.
- **`expo-updates`** optionally replaces `react-native-restart` (used for the language-change restart) and adds OTA.

---

## Phase G — EAS Build (optional, later)

Would replace `Fastlane/`, whose Android lane currently crashes (`internalVersionCode.max + 1` — `Integer#max` doesn't exist).

**Don't bundle this into the migration.** Get CNG working and stable first. Huawei AppGallery has no EAS equivalent, so if that distribution channel matters you'll keep some Fastlane regardless.

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
3. Full manual pass: login → programs → subscribe → today's lessons → PDF → video → **lesson chat (Pusher)** → menu → logout.
4. **Cairo fonts render on both platforms**, Arabic and RTL correct.
5. SVGs render; Reanimated animates; `require.context` theme assets resolve.
6. New Arch confirmed on.
7. Sentry reports a test crash from both platforms, **with symbols** — this is now expected to work on Android for the first time.
8. Release builds sign correctly.
9. `yarn test` no worse than the P1 baseline.
10. No file under `android/` or `ios/` is hand-edited after prebuild. If you needed to, that's a missing config plugin — write it.

Criterion 10 is the real test. If you're hand-patching generated files, you have the costs of both models and the benefits of neither.

## Report back

- **Pusher verdict** — the one genuine unknown.
- Anything that needed a hand-written config plugin.
- Anything in the old native projects that Phase B failed to capture, found only after prebuild.
- Whether ATS `NSAllowsArbitraryLoads` is still needed (separate question, but you'll be looking right at it).
