# T1b — Native upgrade (Android + iOS)

> **Mahmoud is doing the RN upgrade personally.** T1a–T1d are a runbook for him, not agent tasks.
>
> Target version is decided by [T1a](T1a-spike.md) — 0.87.0 preferred, 0.83.10 fallback. Everything below applies to either; only the specific AGP/Kotlin/NDK numbers change, and those come from the matching RN template.

**Depends on:** T0. **Parallel-safe with:** T1a.

> **Worth knowing before you start:** the AGP fix in this brief (8.1.2 → current) is **overdue for the RN version already installed**. Even if you decide to postpone the RN upgrade entirely, this part is worth landing on its own.

## Goal

Bring the native projects up to what RN 0.87 expects. The Android build config is currently **under-spec for the RN version already installed**, so some of this is overdue regardless of the upgrade.

## Owns

```
android/**    (except gradle.properties secrets, already handled in T0)
ios/**
```

Not `package.json` — that's T1c. You may need to bump JS deps locally to test; hand the required versions to T1c rather than committing them.

---

## Android

### Current state

| Setting | Value | Note |
|---|---|---|
| AGP | **8.1.2** | ⚠️ far below what Gradle 8.14.3 + compileSdk 36 need |
| Gradle wrapper | 8.14.3 | |
| compileSdk / targetSdk | 36 / 36 | |
| minSdk | 24 | |
| NDK | 27.1.12297006 | |
| Kotlin | 2.1.20 | |
| buildTools | 36.0.0 | |
| `newArchEnabled` | true | keep |
| `hermesEnabled` | true | keep |
| `edgeToEdgeEnabled` | **false** | see below |

### Work

1. **AGP is the headline.** 8.1.2 against Gradle 8.14.3 and compileSdk 36 is an unsupported combination — it was already wrong for 0.81. Move it to whatever RN 0.87's template ships, and align Kotlin, NDK and buildTools to that template rather than picking versions independently.

2. **Take the template diff as the reference.** Generate a clean `npx @react-native-community/cli init` at the target version and diff its `android/` against ours. Apply deliberately — this project has diverged, so a blind copy will clobber real config (the JSC flavor fallback, the `MYAPP_UPLOAD_*` signing config).

   > **Correction:** an earlier draft of this brief listed "Sentry gradle plugin" among the config to preserve. That was wrong — `android/app/build.gradle` has **never** contained a Sentry plugin in any commit, though `android/sentry.properties` exists. **Android symbol upload has therefore never been wired.** Treat that as a separate bug to fix, not as config to protect.

3. **Remove accumulated cruft:**
   - `android.enableJetifier=true` in `gradle.properties` — obsolete, slows every build
   - `kotlin-android` applied **twice** in `android/app/build.gradle` (once as `org.jetbrains.kotlin.android`, once as `kotlin-android`)
   - `includeBuild('../node_modules/@react-native/gradle-plugin')` declared **twice** in `settings.gradle` (in `pluginManagement` and again at top level)
   - duplicated `android.useAndroidX=true` in `gradle.properties`

4. **`edgeToEdgeEnabled`.** RN 0.87 assumes edge-to-edge, and targetSdk 36 forces it on Android 15+ regardless. Turning it on is the right call — but it **will** change layout on every screen. Enable it, then check each screen for content sliding under the status/nav bars; the app already uses `react-native-safe-area-context` and a `SafeScreen` template, which should absorb most of it. **If the visual fallout is large, note it and hand the screen fixes to T2e/T2f rather than editing screens yourself.**

5. Keep `enableProguardInReleaseBuilds = false` as-is — changing it is a separate decision with its own testing burden.

---

## iOS

### Current state

- `platform :ios, '15.1'`, with `post_install` force-setting `IPHONEOS_DEPLOYMENT_TARGET = '15.1'` on **every** pod target
- The `min_ios_version_supported` line is commented out
- `hermes_enabled` / `new_arch_enabled` args commented out (inherited from env)
- CocoaPods 1.16.2, Podfile.lock present, Fabric pods confirmed

### Work

1. **Raise the deployment target** to 0.87's floor, in both places (`platform :ios` and the `post_install` loop). Better: **uncomment `min_ios_version_supported`** and delete the hardcoded `15.1` from `platform`, so it tracks RN automatically. The `post_install` override should use the same value rather than a literal — that loop is what silently pins pods to an old target.

2. **No `simdjson` pod needed.** It existed only for WatermelonDB, which has been removed. If you find that line in an older Podfile, drop it.

3. Diff against the 0.87 template's `ios/` the same way as Android. Watch for changes to `AppDelegate` (the Swift/ObjC++ migration path has moved across recent versions) and to the `.xcode.env` handling.

4. `ios/sentry.properties` and the Sentry dSYM upload in `Fastlane/Fastfile` must survive — verify a release build still uploads symbols.

5. Regenerate `Podfile.lock` and commit it.

---

## Acceptance criteria

1. `cd android && ./gradlew clean assembleDebug` succeeds.
2. `cd android && ./gradlew assembleRelease` succeeds (signing via the relocated keystore config from T0).
3. `cd ios && pod install` succeeds; the app builds in Xcode for simulator **and** device.
4. Both platforms launch to the login screen.
5. `global.nativeFabricUIManager` is defined at runtime — New Arch genuinely on, not silently disabled.
6. CI's `assembleDebug` job still passes.

## Report back

- The exact AGP / Gradle / Kotlin / NDK / buildTools set you landed on, and where you got it from.
- **Edge-to-edge fallout**: which screens need layout fixes, so T2e/T2f can pick them up.
- Any dependency that failed to compile natively — that's T1c's problem, but it needs to hear about it from you.
- Anything in the template diff you deliberately did *not* apply, and why.
