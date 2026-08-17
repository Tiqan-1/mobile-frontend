# Should Binaa move to Expo?

**Assessed:** 2026-08-17, against the working tree mid-upgrade (RN 0.86.2 installed).

**Verdict: No, not now — but the case has strengthened since this was first written.** The one hard blocker (WatermelonDB) turned out to be dead code and has been removed. What remains against migrating is timing and a permanent RN version cap. Two pieces of Expo are worth taking immediately without migrating either way.

*Updated 2026-08-17 after removing WatermelonDB and measuring the real type-check baseline. Superseded sections are struck through rather than deleted, so the reasoning stays auditable.*

---

## 1. The decisive fact: Expo pins your RN version

This is the part that answers "will it solve the migration issue" on its own.

Fetched from each SDK's `bundledNativeModules.json`:

| Expo SDK | React Native | React |
|---|---|---|
| SDK 55 | 0.83.10 | 19.2.0 |
| SDK 56 | 0.85.3 | 19.2.3 |
| **SDK 57 (latest)** | **0.86.2** | 19.2.3 |
| — | 0.87.0 | *no SDK ships this yet* |

**You are on 0.86.2 right now.** That is *exactly* what the newest Expo SDK pins. Migrating to Expo would buy you zero version advantage today — you're already at parity with it.

Going forward it would **cap** you rather than help you. You tried 0.87.0 and backed down to 0.86.2; under Expo you'd never have had the option to try, because no SDK ships 0.87 yet. Here the outcome happened to be the same, but the constraint is real and permanent.

So: Expo does not get you to a newer React Native. It gets you to a *managed* one.

---

## 2. What Expo genuinely would fix

These are real, and worth acknowledging honestly.

### Native project maintenance disappears

Under Continuous Native Generation, `android/` and `ios/` become **generated artifacts** you never edit. That would have eliminated, at a stroke:

- The AGP 8.1.2 vs Gradle 8.14.3 mismatch
- `kotlin-android` applied twice
- `includeBuild` declared twice in `settings.gradle`
- `android.enableJetifier=true` (obsolete)
- The Podfile `post_install` loop force-pinning `IPHONEOS_DEPLOYMENT_TARGET = '15.1'` on every pod

That's the single biggest argument for migrating, and it's a strong one.

**Your custom native surface is small enough to make this viable.** I checked what's actually customized beyond the template:

| Customization | Expressible in Expo config? |
|---|---|
| `UIAppFonts` (Cairo) | ✅ `expo-font` plugin |
| `NSLocationWhenInUseUsageDescription` | ✅ `ios.infoPlist` |
| `NSAppTransportSecurity` | ✅ `ios.infoPlist` |
| `CADisableMinimumFrameDurationOnPhone` | ✅ `ios.infoPlist` |
| `INTERNET` permission (the only one) | ✅ `android.permissions` |
| Release signing config | ✅ EAS credentials |
| `jscFlavor` | ⚪ irrelevant — you're on Hermes |
| `MainActivity.kt` / `MainApplication.kt` / `AppDelegate.swift` | ✅ unmodified template files |

Nothing here blocks CNG. That's a genuinely favourable profile.

### Upgrades become one command

`npx expo install --fix` resolves the whole compatibility matrix. Instead of hand-checking 43 packages against a new RN version, you follow one SDK upgrade path. Given you just spent effort discovering 0.87 didn't work, this has obvious appeal.

### EAS Build could replace Fastlane

Your Android lane currently **crashes** — `internalVersionCode.max + 1` calls `Integer#max`, which doesn't exist. EAS would make that setup redundant rather than requiring a fix.

---

## 3. What Expo would not fix — and would make worse

### ~~WatermelonDB is the blocker~~ ✅ RESOLVED — removed 2026-08-17

This section originally identified `@nozbe/watermelondb@0.28.0` as the single hard blocker: no official config plugin, requires a `simdjson` Podfile entry plus Android JSI wiring, and **CNG wipes exactly those manual native edits on every prebuild**.

**It has been removed.** Investigation showed it was never actually used — the chain was `src/db/* → src/hooks/useProgress.ts → nothing`. `useProgress` had no importers, `App.tsx` had no `DatabaseProvider`, and nothing used `withObservables`. Deleted: `src/db/`, `src/hooks/useProgress.ts`, `@nozbe/watermelondb`, `@nozbe/with-observables`, `@babel/plugin-proposal-decorators`.

**This materially changes the verdict below.** The one genuine Expo blocker no longer exists. See §6.

### Pusher is unverified territory 🟠

`@pusher/pusher-websocket-react-native@1.3.1` ships native code but **no config plugin**. It should autolink fine under prebuild, but nobody's confirmed it, and it powers lesson chat.

### The abandoned packages stay abandoned

`react-native-fast-image`, `react-native-render-html`, `react-native-actionsheet` were all last published in **2022**. Expo does not resurrect them. This problem is identical either way.

### The timing is wrong

You are mid-upgrade with a red test suite (4 suites, 0 tests run) and 163 type errors. Stacking a second migration on top of that compounds risk rather than reducing it. This is the **strongest remaining objection** — and unlike the others, it expires on its own.

---

## 4. Full package review

### Expo-managed (10) — Expo would pin these for you

| Package | Yours | Expo SDK 57 | Note |
|---|---|---|---|
| `react-native` | 0.86.2 | 0.86.2 | ✅ identical |
| `react` | 19.2.3 | 19.2.3 | ✅ identical |
| `@react-native-masked-view/masked-view` | ^0.3.2 | 0.3.2 | ✅ |
| `react-native-svg` | ^15.13.0 | 15.15.4 | ⚪ minor bump |
| `react-native-screens` | ^4.16.0 | ~4.26.0 | ⚪ minor bump |
| `react-native-safe-area-context` | ^5.6.1 | ~5.7.0 | ⚪ minor bump |
| `react-native-gesture-handler` | ^2.28.0 | ~2.32.0 | ⚪ minor bump |
| `react-native-reanimated` | ^4.1.0 | 4.5.1 | ⚪ you have 4.5.3 installed |
| `@sentry/react-native` | ^7.2.0 | ~7.11.0 | ⚪ minor bump; **ships a config plugin** ✅ |
| `react-native-worklets` | ^0.11.4 | 0.10.1 | ⚠️ **you're ahead of Expo.** Fine in bare RN (reanimated 4.5.3 accepts `0.10.x - 0.11.x`); Expo would force you *down* |

### Native packages Expo doesn't manage (you own compatibility)

| Package | Config plugin | Verdict under Expo |
|---|---|---|
| `@pusher/pusher-websocket-react-native` | ❌ | 🟠 Should autolink; unverified |
| `react-native-localize` | ✅ **ships one** | ✅ Fine |
| `react-native-mmkv` | ❌ | ✅ Autolinks; dev builds only (not Expo Go) |
| `react-native-pdf` | ❌ | ✅ Autolinks with `blob-util` |
| `react-native-blob-util` | ❌ | ✅ Autolinks |
| `react-native-restart` | ❌ | ⚪ Works, but `expo-updates` `reloadAsync()` is the native replacement |
| `react-native-fast-image` | ❌ | 🟠 Abandoned 2022 → **`expo-image` is the drop-in** |
| `react-native-youtube` | ❌ | 🔴 Dead since 2018 — **delete regardless** |

### Pure-JS packages — no Expo impact whatsoever (21)

`@react-navigation/*`, `@reduxjs/toolkit`, `react-redux`, `redux-persist`, `@tanstack/react-query`, `apisauce`, `formik`, `yup`, `zod`, `i18next`, `react-i18next`, `intl-pluralrules`, `lodash`, `lodash.memoize`, `moment`, `react-error-boundary`, `react-native-calendars`, `react-native-flash-message`, `react-native-render-html`, `react-native-youtube-iframe`, `react-native-actionsheet`.

**Summary: of 42 dependencies, ~~exactly one is~~ zero are a genuine blocker.** The only one, WatermelonDB, has been removed. `@pusher/pusher-websocket-react-native` is the sole remaining unknown, and it is expected to autolink.

---

## 5. Findings from your current working tree

Independent of the Expo question, checking your in-flight upgrade turned up four things.

### ✅ iOS WatermelonDB mismatch — resolved by deletion

The regenerated Podfile had dropped the `simdjson` pod while `src/db/index.ts` still set `jsi: IsIOS`, which would have broken iOS builds. Since WatermelonDB turned out to be dead code, deleting it resolved this outright — no pod to restore. `ios/Podfile.lock` is still absent, so run `pod install` before the next iOS build.

### 🔴 Test suite: 4 suites fail, 0 tests run

```
Cannot find module 'babel-plugin-transform-inline-environment-variables'
```

`babel.config.js` line 5 references `'transform-inline-environment-variables'`, which is **not declared in `package.json`**. Its previous companion `babel-plugin-inline-dotenv` is also gone. One-line fix: declare it, or remove the plugin if `.env` handling has moved.

### 🔴 `tsc` reports 163 errors — correcting a correction

An earlier version of this document said "`tsc` passes clean, only a `baseUrl` deprecation warning." **That was wrong, twice over.**

What actually happened: `@react-native/typescript-config` was still installed at **0.87.0** while `package.json` specified **0.86.2**. Under that mismatch, `tsc` aborted on the config-level error `TS5101` (`baseUrl` deprecated) *before type-checking a single file*, and printed nothing else — which looked like success.

Re-resolving the dependency to 0.86.2 fixed the config error and let the type-checker actually run. Result:

| Code | Count | Meaning |
|---|---|---|
| `TS6133` | 62 | unused local (`noUnusedLocals` is on) |
| `TS2339` | 22 | property does not exist on type |
| `TS2307` | 15 | cannot find module — includes an **undeclared `react-native-fs`** in `src/utils/pdfManager.ts` |
| `TS2345` | 13 | argument type mismatch |
| `TS7006` | 11 | implicit `any` parameter |
| others | 40 | |

Worst files: `atoms/FlashMessage` (23), `BottomTabNavigation` (9), `atoms/CircleStatus` (8), `MainScreen` (7), `LibraryScreen` (7).

**None of these were caused by removing WatermelonDB** — no error references `src/db`, `useProgress`, or `@nozbe/*`.

⚠️ **Watch for this trap generally:** a `@react-native/typescript-config` version that doesn't match `package.json` makes `tsc` look green when it is not. If the type-check reports almost nothing, verify the installed version first.

### 🟠 Stale babel aliases

`babel.config.js` still aliases `containers`, `styles`, and `api` — **none of those directories exist**. The `.ts`/`.tsx` extensions issue from T1c is fixed. Collapsing to `@/` only remains outstanding.

---

## 6. Recommendation

### Now: don't migrate

Not because it's blocked — it isn't, any more — but because you're mid-upgrade with a red test suite and 163 type errors. Finish stabilising before starting a second migration. You're also already on the exact RN version the latest SDK pins, so there's nothing to gain by hurrying.

### Now: take the two Expo pieces that don't require migrating

Both work in a bare RN app via `npx install-expo-modules`, no CNG, no prebuild:

1. **`expo-image`** → replaces abandoned `react-native-fast-image`. Three call sites (`VideoModal`, `MainScreen`, `Programs`), and it's better software.
2. **`expo-updates`** → optional, replaces `react-native-restart` (used for the language-change restart) and adds OTA updates.

This is the honest middle path: real benefit, no migration.

### Later: one gate decides it

**The gate that was here has already been passed.** It read: "does WatermelonDB still matter?" — and the answer turned out to be no, because it was dead code. It's gone.

So the remaining objections are weaker than when this was written:

| Objection | Status |
|---|---|
| WatermelonDB blocks CNG | ✅ **Gone** — removed as dead code |
| Native surface too custom for CNG | ✅ Already CNG-friendly (§2) |
| Pusher has no config plugin | 🟠 Still open — should autolink, unverified |
| Expo pins you below latest RN | ⚠️ Still true, and permanent |
| Wrong time — mid-upgrade, broken tests | ⚠️ Still true today, but temporary |

**Revisit once the current upgrade settles and the test suite is green.** At that point the only real technical unknown is Pusher, which is an afternoon's verification. If you then want out of hand-maintaining `android/` and `ios/`, the path is genuinely open — that's a stronger position than this document started from.

The one permanent cost stays permanent: **you would be capped at whatever RN the current SDK ships** (0.86.2 today, with 0.87.0 unavailable). Decide whether you care about that more than you care about never touching AGP versions again.

### If you do migrate later, the order is

1. ~~Remove or replace WatermelonDB~~ ✅ already done
2. `npx install-expo-modules` (adds Expo modules to the bare app — reversible, low risk)
3. Move Info.plist/manifest customizations into `app.json`
4. `npx expo prebuild --clean`, verify both platforms
5. Write or verify a config plugin for Pusher
6. Migrate Fastlane → EAS Build last

Steps 1–2 are useful on their own even if you never finish. That's what makes this a safe path to start down.
