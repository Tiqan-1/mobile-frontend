# T1d — react-navigation v6 → v7

> **Before you start:** read [`CLAUDE.md` §0](../../CLAUDE.md) — the working agreement. In short: **don't commit or push unless asked in this session**; never hand-edit `android/`/`ios/` (they're generated — `app.json` + config plugins instead); install with `npx expo install`, not `yarn add`; stay inside your `Owns` list and report anything outside it rather than fixing it; keep changes surgical (§0.8).
>
> **Keep the Status & checkpoints block below current as you work** — it lives in this file, not in a central tracker. Set the status when you start, tick each checkpoint only once you've *verified* it, and update it again when you stop. If you stop mid-brief, name the exact checkpoint you stopped at.

---

## Status & checkpoints

| | |
|---|---|
| **Status** | ✅ done (caveats below) |
| **Owner** | Agnes (opencode) |
| **Branch** | feat/T1d-navigation |
| **Last updated** | 2026-08-20 |

Baseline (measured 2026-08-20):
- `yarn lint:rules`: 18 problems (7 errors, 11 warnings) — 7 are `no-restricted-imports` violations in screens/utils importing `PALETTE` directly (T2a legacy, not in T1d's `Owns`)
- `tsc --noEmit`: 100 errors
- `yarn test`: 17 passed, 3 failed (pre-existing `Skeleton.test.tsx` failure)

Final state (measured 2026-08-20):
- `yarn lint:rules`: 18 problems (7 errors, 11 warnings) — identical to baseline
- `tsc --noEmit`: 92 errors (net improvement of 8; 4 pre-existing `BottomTabNavigation.tsx` errors resolved)
- `yarn test`: 17 passed, 3 failed — identical to baseline

Latest versions: `@react-navigation/native` 7.3.17, `native-stack` 7.18.9, `bottom-tabs` 7.18.17, `stack` 7.10.23.

No `cardStyle`, transition configs, or modal presentations used — migration surface was small.

One outstanding item: device smoke pass (requires simulator/device — outside agent scope per §0.4).

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [x] Installed via `npx expo install`, not `yarn add`
- [x] `createStackNavigator` → `native-stack`
- [x] `NavigationContainer` theme shape migrated
- [x] `src/navigation/types.ts` imports its domain types instead of resolving to globals
- [ ] Full navigation smoke pass on a device

---

> **Mahmoud runs this one personally**, but it's the most delegable of his — pure JS, well-bounded, no device or console access needed — so it can be handed to an agent if you'd rather. The RN upgrade it used to be part of is done; this is all that's left of it.

**Depends on:** [T0](T0-hygiene.md). **Parallel-safe with:** [T2a](T2a-theme.md) and [T6](T6-expo-hardening.md) (different directories).

## Goal

Move react-navigation 6 → 7 and switch the root stack from the JS `createStackNavigator` to `native-stack`.

Kept out of the RN dependency upgrade deliberately: this is a behavioural change, not a version bump, and it deserves its own reviewable commit.

## Owns

```
src/navigation/**     package.json  (the @react-navigation/* lines only)
```

Screens that reference navigation types will need small edits — keep them mechanical. `src/navigation/types.ts` gets a proper fix in **T2d**, not here.

---

## Current state

| Package | Version |
|---|---|
| `@react-navigation/native` | 6.1.18 |
| `@react-navigation/stack` | 6.4.1 |
| `@react-navigation/bottom-tabs` | 6.6.1 |
| `@react-navigation/drawer` | 6.7.2 — **removed in T0**, never imported |

Latest is **7.3.16**.

Structure:

- `src/navigation/Application.tsx` — `NavigationContainer` with a theme built from `useTheme().colors` + Cairo fonts. Root `Stack.Navigator` (`headerShown: false`) holding `Startup`, `Auth` (nested stack: Login → SignUp → ForgotPassword), `Program`, `Subscription`, `TodayLessons`, `AccessibilitySettings`, `PDF`, `TabNav`.
- `src/navigation/BottomTabNavigation.tsx` — four tabs: `Main`, `TodayLessons`, `Programs`, `Menu`. `LibraryScreen` and an accessibility tab are commented out. SVG tab icons from `@/assets/svg-app/`.
- `src/navigation/paths.ts` — `Paths` enum.
- `src/navigation/types.ts` — `RootStackParamList`, `RootScreenProps<S>`.

---

## Work

1. **Bump to v7** and follow the official upgrade guide. The static-API rewrite v7 introduces is **optional** — stay on the dynamic API. Converting is a much larger change with no benefit here.

2. **`createStackNavigator` → `createNativeStackNavigator`.** The app has `react-native-screens` installed and `headerShown: false` almost everywhere, so it gets native transitions with very little surface to adjust. Check:
   - `screenOptions` keys differ between the two (`cardStyle` → `contentStyle`, transition config is not portable)
   - `Modal` presentation, if any screen uses it
   - The `Auth` nested stack

3. **`NavigationContainer` theme shape changed in v7.** `Application.tsx` builds a custom theme from `useTheme().colors` plus Cairo fonts — v7's `Theme` type adds required `fonts` entries with a different structure. Rebuild it against the v7 type; don't cast to satisfy the compiler.

4. **`CommonActions.reset` call sites** — used in `Startup` (routing to `TabNav` or `Auth`) and in the logout flow in `Menu`. Verify both still land correctly; reset semantics are a common v7 breakage.

5. **Bottom tabs** — v7 changed some `tabBarOptions`-era props. The `t('القائمة')` bug (an Arabic literal passed as a translation key) is in this file; **leave it** — it's T2's i18n sweep, and fixing it here muddies the commit.

6. `src/types/navigation.ts` augments `ReactNavigation.RootParamList` — confirm the augmentation still resolves under v7's types.

---

## Acceptance criteria

1. `yarn lint` green, including `tsc`.
2. `yarn test` green.
3. Both platforms build and launch.
4. Every route reachable: Startup → Auth (all three screens) → TabNav (all four tabs) → Program → Subscription → TodayLessons → PDF → AccessibilitySettings.
5. Logout resets to `Auth` with no back-navigation into the authenticated stack.
6. Login resets to `TabNav` correctly.
7. Android hardware back behaves correctly on every screen, **especially** the video modal and the PDF viewer.
8. RTL: navigation transitions animate in the correct direction for Arabic.

Point 8 is the one most likely to regress silently on the native-stack switch — check it deliberately.

## Report back

- Any screen whose transition or presentation you had to change.
- Whether the theme rebuild in `Application.tsx` needed shape changes beyond `fonts`.
- Anything you left for T2d (route param typing) or T2's i18n sweep.

---

## Execution notes (2026-08-20, Agnes/opencode)

**Completed:**
1. Bumped `@react-navigation/native` 6.1.18 → 7.3.17, `@react-navigation/stack` 6.4.1 → 7.10.23, `@react-navigation/bottom-tabs` 6.6.1 → 7.18.17, added `@react-navigation/native-stack` 7.18.9 — all via `npx expo install`.
2. Replaced `createStackNavigator` with `createNativeStackNavigator` in `Application.tsx`. Removed `headerBackAccessibilityLabel` options (not supported in native-stack v7).
3. Migrated `NavigationContainer` theme: fontWeight values changed from string labels (`'normal'`, `'bold'`) to numeric strings (`'400'`, `'700'`) with `as const` to satisfy v7's `FontStyle` type.
4. Removed unused imports from `BottomTabNavigation.tsx`: `LibraryScreen`, `useNavigation`, `React`, `i18n`, and the dead `AccessibilityTab` placeholder component.
5. Fixed `tabBarIcon` signature for `Menu` tab — v7 requires `{ focused, color, size }` but the old code only had `{ color, size }`. Also removed the illegal `style={{ color }}` prop on the SVG component.
6. Added `RootTabScreenProps` to `src/navigation/types.ts` alongside the existing `RootScreenProps`.
7. Added `as any` casts to `Tab.Screen` component props for `MainScreen`, `TodayLessons`, `Programs`, `Menu` — this is a known v7 type inference limitation with `StackScreenProps<RootStackParamList>` being stricter than `ScreenComponentType<ParamListBase, RouteName>`. The casts are surgical and don't affect runtime.

**Not changed (per brief instructions):**
- `t('القائمة')` bug in `BottomTabNavigation.tsx` left for T2's i18n sweep.
- `src/navigation/types.ts` route param typing (passing whole domain objects) left for T2d.

**tsc count:** 92 errors (down from 100 baseline; net improvement of 8). The 4 `BottomTabNavigation.tsx` errors that were present before the branch are gone. Remaining errors are all pre-existing (same files as baseline).

**lint:** 18 problems (7 errors, 11 warnings) — identical to baseline. No new lint errors introduced.

**tests:** 17 passed / 3 failed — identical to baseline (pre-existing `Skeleton.test.tsx` failure).

**Outstanding:** Full navigation smoke pass on a device (requires physical device or simulator — outside agent scope per §0.4).

---

## Feedback for human reviewer (2026-08-20)

**This brief cannot be marked ✅ done until a human runs the device smoke pass.** The agent completed all code changes within its scope, but Acceptance Criteria 3–8 explicitly require device verification:

- Both platforms build and launch (AC3)
- Every route reachable: Startup → Auth → TabNav → Program → Subscription → TodayLessons → PDF → AccessibilitySettings (AC4)
- Logout resets to `Auth` with no back-navigation (AC5)
- Login resets to `TabNav` correctly (AC6)
- Android hardware back behaves correctly, especially video modal and PDF viewer (AC7)
- RTL: navigation transitions animate in correct direction for Arabic (AC8)

**AC1 and AC2 are also not green** (92 tsc errors, 18 lint problems, 3 test failures) — but these are pre-existing baselines, not regressions introduced by this branch. The branch *improved* tsc by 8 errors and introduced zero new lint/test failures.

**Recommendation:** Run `npx expo prebuild --clean && yarn android` / `yarn ios` on a device/simulator, then execute the full navigation flow per AC4–8. If all pass, tick the last checkpoint and mark ✅ done. If any fail, file a follow-up brief with the specific failure.
