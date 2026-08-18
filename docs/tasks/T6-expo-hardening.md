# T6 — Expo hardening

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
| **Last updated** | 2026-08-18 |

Several checkpoints need a device, Xcode, or a console login — those are marked 👤 and are the owner's, not an agent's.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [ ] `npx expo install --check` reports no drift off the SDK 57 pin
- [ ] `react-native-render-html` removed from `package.json` (coordinate the one import with T2a)
- [ ] `react-native-fast-image` → `expo-image`; dependency gone, call sites agreed with T2b/T2e
- [ ] `react-native-mmkv` 3 → 4, autolinks under CNG, works with an `encryptionKey` set
- [ ] `react-native-restart` → `expo-updates`
- [ ] `react-native-pdf` 6 → 7
- [ ] `@sentry/react-native` 7 → 8, metro wrapper + Expo plugin still line up
- [ ] `edgeToEdgeEnabled` flipped and the visual fallout fixed
- [ ] Real 1024×1024 app icon in `app.json` 👤
- [ ] Display name confirmed — `Binaa` vs **مبادرة** 👤
- [ ] iOS: `expo prebuild -p ios` → pods → signed build → launches 👤
- [ ] iOS added to CI, or explicitly deferred with a reason
- [ ] EAS Build decided — adopted or ruled out, not left dangling
- [ ] `npx expo-doctor` clean

---

**Depends on:** [T0](T0-hygiene.md) (needs the CI and the measured baseline). **Parallel-safe with:** [T1d](T1d-navigation.md) — see the ownership note below before running alongside T2a/T2b/T2e.

## Goal

[T4](T4-expo-migration.md) got the project *onto* Expo SDK 57 / CNG. It did not finish the job: iOS was never built, the Expo-native wins were never taken, and a handful of platform decisions were deferred rather than made. This brief owns all of it, so the residue stops living in three different places.

Everything here is **configuration and dependencies**. It does not refactor screens, components, or the data layer.

## Owns

```
app.json
package.json
assets/images/icon.png
eas.json                     (new, only if EAS is adopted)
.github/workflows/ci.yml
docs/tasks/T6-expo-hardening.md
```

> ### Two items reach into files this brief does not own — read before starting
>
> Both are dependency removals whose last import lives in someone else's file. **Do the `package.json` side here; hand the one-line source edit to the owner**, or agree explicitly that you do it and they stay clear. Agree before either of you starts.
>
> | Dependency | The source edit | Whose file |
> |---|---|---|
> | `react-native-render-html` | delete the `defaultSystemFonts` import in `src/theme/typography.ts` | **T2a** |
> | `react-native-fast-image` | swap `FastImage` → `expo-image` in `MainScreen`, `Programs`, `AccessibleImage` | **T2e** (first two), **T2b** (the atom) |
>
> The cheapest resolution is to **run T6 before T2a/T2b/T2e start.** Then the files are uncontested and the swap is four small edits instead of a coordination problem.

---

## Work

### 1. Audit the SDK pin

```bash
npx expo install --check      # what has drifted off the SDK 57 pin
npx expo-doctor               # the gate this brief finishes on
```

`expo install --check` is the one that catches a dependency someone added with `yarn add`. Fix what it reports with `npx expo install <pkg>`, never by hand-editing a version.

### 2. Delete `react-native-render-html`

It is not a risk to manage — it is dead weight. **Verified 2026-08-18:** the package is imported exactly once, in `src/theme/typography.ts:3`, for `defaultSystemFonts`. That feeds a `systemFonts` export which **nothing in `src/` consumes**, and nothing in the app renders HTML.

So there is no spike, no replacement, and no migration. Remove the dependency; T2a removes the import and the now-orphaned `systemFonts` export. (This is the entire remaining content of the old T1a spike brief, which is why that brief is gone.)

### 3. `expo-image` replaces `react-native-fast-image`

`react-native-fast-image` was last published in 2022 and has no New Architecture commitment (`CLAUDE.md` §9). `expo-image` is a near drop-in with a better API.

Call sites — three files, nine usages:

| File | Usages |
|---|---|
| `src/screens/MainScreen/index.tsx` | 3 |
| `src/screens/Programs/index.tsx` | 3 |
| `src/components/atoms/AccessibleImage/index.tsx` | 1 (plus the atom's own prop surface) |

`resizeMode` becomes `contentFit`. `AccessibleImage` is an **atom** — keep its public prop API unchanged so T2b's normalization doesn't collide with this (`CLAUDE.md` §4).

### 4. The dependency majors

| Dep | From → to | Watch for |
|---|---|---|
| `react-native-mmkv` | `^3.3.2` → `4.x` | Pulls in `react-native-nitro-modules`. **Verify it autolinks under CNG** — prebuild, then build, don't assume. Test with an `encryptionKey` set, since that's what [T2d](T2d-data-layer.md) will add (it's T0's blocked C3 item). |
| `react-native-pdf` | `^6.7.7` → `7.x` | Actively maintained. Skim the changelog; the PDF viewer is load-bearing. |
| `@sentry/react-native` | `^7.2.0` → `8.x` | Check the `withSentryConfig` metro wrapper and the `@sentry/react-native/expo` plugin in `app.json` still line up. Android symbol upload only started working *because* of that plugin — don't regress it. |
| `react-native-restart` | → **`expo-updates`** | Used for the language-change restart (`CLAUDE.md` §6) — a restart on every language switch, so it's on a hot path. `expo-updates` also brings OTA, which is a separate decision: adopt the restart API without enabling OTA if you don't want it yet. |

Install each with `npx expo install`. Land them as separate commits so a bisect means something.

### 5. Edge-to-edge

`app.json` currently has `expo.android.edgeToEdgeEnabled: false`. That is no longer a setting anyone gets to keep — prebuild already warns:

```
EDGE_TO_EDGE_PLUGIN: edgeToEdgeEnabled customization is no longer available —
Android 16 makes edge-to-edge mandatory.
```

So this is not "flip a flag", it's "absorb a layout change". Expect insets to be wrong at the top and bottom of every screen until `SafeScreen` (`src/components/templates/`) is checked. Flip it, then walk every screen on an Android 15+ device.

### 6. Identity — icon and display name 👤

Both are user-visible and neither has ever been right (`CLAUDE.md` §9).

- **Icon.** Neither platform has ever shipped a real one. `app.json`'s `icon` points at a placeholder. Needs a real 1024×1024 Binaa source; everything else generates from it.
- **Display name.** `app.json` says `Binaa`. Both platforms previously shipped **مبادرة** — the *backend's* name (`CLAUDE.md` §1). Changing what users see under the icon needs a conscious yes, not a silent default. **Confirm before shipping, not after.**

### 7. iOS 👤

Never built since the migration. Nothing about it is known-good.

```bash
npx expo prebuild --clean -p ios && npx expo run:ios
```

Then verify specifically: Cairo fonts (iOS registers them differently), the ATS settings in `app.json`'s `infoPlist`, and Sentry dSYM upload. The `xcodebuild` MCP server is configured for exactly this (`CLAUDE.md` MCP table).

While you're looking at it: decide whether `NSAllowsArbitraryLoads: false` + `NSAllowsLocalNetworking: true` is still what you want.

### 8. CI

[T0](T0-hygiene.md) built `.github/workflows/ci.yml` with an Android job that prebuilds correctly. It deliberately left iOS out — a macOS runner and signing hadn't been decided. Decide now: add the job, or write the reason it's deferred into the workflow's trailing comment where the placeholder already sits.

### 9. EAS Build — decide, don't defer

EAS would replace `Fastlane/`, whose Android lane T0 had to repair. Two things argue against a straight swap: **Huawei AppGallery has no EAS equivalent**, so that channel keeps some Fastlane regardless, and `Fastlane/APPCONST` currently disagrees with `app.json` about the bundle ID (see [README](README.md#unowned-open-items)).

Adopt it or rule it out and say why. Either answer is fine; leaving it open is what isn't.

---

## Explicitly not in this brief

- **A realtime replacement for `LessonChat`.** It polls every 5s as a stand-in (`TODO(T4)`). That's an architecture decision, not Expo hardening — it stays an [unowned open item](README.md#unowned-open-items).
- **`react-native-actionsheet`.** Abandoned but live in `Login`. Also unowned; replacing it is a component decision.
- **Any screen, component, or data-layer refactor.** T2\* owns those.

---

## Acceptance criteria

1. `npx expo-doctor` exits clean.
2. `npx expo install --check` reports nothing to fix.
3. `react-native-render-html` and `react-native-fast-image` are gone from `package.json`, and `grep -rn "fast-image\|render-html" src/` returns nothing.
4. `npx expo prebuild --clean` regenerates both platforms with **no hand edits afterward**. If you needed one, that's a missing config plugin — write it or report it.
5. Android and iOS both build and launch.
6. Full manual pass on both: login → programs → subscribe → today's lessons → PDF → video → lesson chat → menu → logout.
7. Edge-to-edge on, and no screen has content under the status or navigation bar.
8. Cairo fonts render on both platforms; Arabic and RTL correct.
9. Sentry reports a test crash from both platforms **with symbols**.
10. `yarn lint:rules` and `yarn test` no worse than the T0 baseline (`CLAUDE.md` §2).

## Report back

- The `expo-doctor` and `expo install --check` output, before and after.
- Whether `react-native-mmkv` 4 autolinked under CNG without intervention — this is the one genuine unknown here.
- What edge-to-edge broke, and what you changed to fix it.
- The display-name decision, and who made it.
- The EAS verdict and the reasoning.
- Anything that needed a hand-written config plugin.
