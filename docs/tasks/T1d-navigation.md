# T1d — react-navigation v6 → v7

> **Before you start:** read [`CLAUDE.md` §0](../../CLAUDE.md) — the working agreement. In short: **don't commit or push unless asked in this session**; never hand-edit `android/`/`ios/` (they're generated — `app.json` + config plugins instead); install with `npx expo install`, not `yarn add`; stay inside your `Owns` list and report anything outside it rather than fixing it; keep changes surgical (§0.8).
>
> **Keep the Status & checkpoints block below current as you work** — it lives in this file, not in a central tracker. Set the status when you start, tick each checkpoint only once you've *verified* it, and update it again when you stop. If you stop mid-brief, name the exact checkpoint you stopped at.

---

## Status & checkpoints

| | |
|---|---|
| **Status** | ⚪ not started |
| **Owner** | Mahmoud (most delegable of T1*) |
| **Branch** | — |
| **Last updated** | 2026-08-17 |

Fully live — `@react-navigation/*` is still on `^6`.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [ ] Installed via `npx expo install`, not `yarn add`
- [ ] `createStackNavigator` → `native-stack`
- [ ] `NavigationContainer` theme shape migrated
- [ ] `src/navigation/types.ts` imports its domain types instead of resolving to globals
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
