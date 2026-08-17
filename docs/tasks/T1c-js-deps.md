# T1c — JS dependency upgrades — ✅ mostly done

> **Before you start:** read [`CLAUDE.md` §0](../../CLAUDE.md) — the working agreement. In short: **don't commit or push unless asked in this session**; never hand-edit `android/`/`ios/` (they're generated — `app.json` + config plugins instead); install with `npx expo install`, not `yarn add`; stay inside your `Owns` list and report anything outside it rather than fixing it; keep changes surgical (§0.8).
>
> **Keep the Status & checkpoints block below current as you work** — it lives in this file, not in a central tracker. Set the status when you start, tick each checkpoint only once you've *verified* it, and update it again when you stop. If you stop mid-brief, name the exact checkpoint you stopped at.

---

## Status & checkpoints

| | |
|---|---|
| **Status** | ✅ mostly done — residuals open |
| **Owner** | Mahmoud |
| **Branch** | `feat/expo` (uncommitted) |
| **Last updated** | 2026-08-17 |

RN 0.81.4 → 0.86.2 landed by hand. Everything below the revision block is historical.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [x] RN 0.86.2 + React 19.2.3 landed
- [x] `@react-native/*` and `@react-native-community/cli` aligned
- [x] Legacy decorators plugin removed
- [ ] `@react-navigation/*` v6 → v7 — **this is [T1d](T1d-navigation.md)**
- [ ] `react-native-mmkv` 3 → 4
- [ ] `react-native-pdf` 6 → 7
- [ ] `@sentry/react-native` 7 → 8
- [ ] `react-native-fast-image` → `expo-image` — **this is T4 Phase F**
- [ ] `npx expo-doctor` clean

---

> ## Revision, 2026-08-17 — read before anything below
>
> **The RN upgrade in this brief has already happened.** Mahmoud landed **0.81.4 → 0.86.2** by hand. 0.87.0 was attempted and abandoned. Everything below about *choosing* a version is spent — 0.86.2 is also exactly what Expo SDK 57 pins, which is what made [T4](T4-expo-migration.md) free.
>
> ### Landed
>
> `react-native@0.86.2` · `react@19.2.3` · `@react-native/*` and `@react-native-community/cli@20.1.0` aligned · `reanimated@4.5.1` + `worklets@0.10.1` · `gesture-handler@~2.32.0` · `screens@~4.26.0` · `safe-area-context@~5.7.0` · `webview@13.16.1`. `@babel/plugin-proposal-decorators` removed (it existed only for WatermelonDB).
>
> ### Residual — still open, each one small
>
> | Dep | From → to | Note |
> |---|---|---|
> | `@react-navigation/*` | `^6` → `7.x` | This is **[T1d](T1d-navigation.md)**, not here. |
> | `react-native-mmkv` | `^3.3.2` → `4.x` | Pulls in `react-native-nitro-modules`. Verify it autolinks under CNG. T0 also adds an `encryptionKey` — test with one set. |
> | `react-native-pdf` | `^6.7.7` → `7.x` | Major, actively maintained. |
> | `@sentry/react-native` | `^7.2.0` → `8.x` | Check the `withSentryConfig` metro wrapper and the `@sentry/react-native/expo` plugin still line up. |
> | `react-native-fast-image` | → **`expo-image`** | Abandoned since 2022. This is **T4 Phase F**. |
> | `react-native-actionsheet` | → *something maintained* | Abandoned 2022, but **live** in `Login`. Not T0's job, not scoped anywhere yet. |
>
> ### The rule that changed
>
> **Use `npx expo install <pkg>`, never `yarn add`.** Expo pins versions per SDK; `yarn add` fetches `latest` and will hand you something SDK 57 doesn't support. `npx expo install --check` audits what's already installed, and `npx expo-doctor` is the gate to finish on. See [`CLAUDE.md` §0.3](../../CLAUDE.md).
>
> Also: `metro.config.js` is now built on **`expo/metro-config`**, and this brief's `mergeConfig` advice would break it. See `CLAUDE.md` §3 — two silent-failure traps are documented there, both of which were hit for real.
>
> Everything from here down is **historical**, kept because the version-choice reasoning would apply again on a future jump.

---

## Which version to target *(historical — decided: 0.86.2)*

**Attempt 0.87.0. Fall back to 0.83.10 without hesitation if it fights back.**

There is no prize for landing on the newest release, and this app still carries three abandoned dependencies — the profile that makes a six-minor jump expensive. (The JSI-level database that used to compound this has been removed.)

### The npm picture

`npm view react-native dist-tags` shows which lines are actually maintained:

```
0.81-stable → 0.81.6      ← current line (we're on 0.81.4)
0.83-stable → 0.83.10     ← nearest maintained line above us
latest      → 0.87.0      ← target
```

There is no `0.82-stable`, `0.84/85/86-stable`. **0.83 is the fallback**, not an arbitrary midpoint.

### Decision rule — apply after T1a reports

Abandon 0.87 and go to **0.83.10** if any of these is true:

- `react-native-render-html` has no viable path, **and** the backend can't switch to Markdown
- Three or more of the four spiked packages fail
- You've spent more than two days fighting native build errors with no clear end

Going to 0.83.10 costs you a second upgrade later. Getting stuck halfway through a 0.87 migration costs more, and blocks Phase 2 and 3 behind it.

### Free win, do it first

**0.81.4 → 0.81.6 is a patch bump within your current line.** Land it on its own before anything else. It's near-zero risk, picks up fixes, and gives you a clean commit to bisect against when the real upgrade starts misbehaving.

### If you land on 0.83.10 instead of 0.87.0

Everything below still applies — the dependency table's *majors* are mostly driven by their own release cycles, not by RN. Check each one's peer range against 0.83 rather than 0.87 and pin accordingly. `react-native-gesture-handler` 3.x and `react-native-mmkv` 4.x in particular may want different versions.

## Owns

```
package.json      babel.config.js      metro.config.js      tsconfig.json      yarn.lock
```

You may need small source edits for renamed APIs. Keep them **mechanical and minimal** — behaviour changes belong to Phase 2. If a dependency upgrade demands real refactoring, stop and report it.

---

## Read first

`docs/tasks/T1a-findings.md`. If T1a says `react-native-render-html` is broken, the replacement work happens **here**, and it changes the size of this task considerably. Don't start until you've read the verdict.

*(WatermelonDB was the other headline risk. It has been removed as dead code, so it is no longer a factor.)*

---

## The upgrade set

Verified against npm. Land these as **separate commits**, roughly in this order.

### Core

| Package | From | To |
|---|---|---|
| `react-native` | 0.81.4 | **0.87.0** |
| `react` | 19.1.0 | whatever 0.87 pins |
| `@react-native/*` (babel-preset, metro-config, typescript-config) | 0.81.4 | 0.87.0 |
| `@react-native-community/cli*` | 20.0.0 | the 0.87-compatible line |

Use the [Upgrade Helper diff](https://react-native-community.github.io/upgrade-helper/?from=0.81.4&to=0.87.0) for the JS-side config files. Native files are T1b's — don't re-apply them.

### Majors — one commit each, test between

| Package | From | To | Watch for |
|---|---|---|---|
| `react-native-gesture-handler` | 2.28.0 | **3.2.1** | v3 is a major; check the migration guide |
| `react-native-webview` | 13.16.0 | **14.0.1** | T3a's locked player depends on this — verify `onShouldStartLoadWithRequest` and `setSupportMultipleWindows` still behave |
| `react-native-mmkv` | 3.3.2 | **4.3.2** | needs `react-native-nitro-modules`; backs redux-persist **and** theme/language prefs. T0 added an `encryptionKey` — confirm it survives |
| `@sentry/react-native` | 7.2.0 | **8.23.0** | metro `withSentryConfig` wrapper and the gradle plugin both move |
| `react-native-pdf` | 6.7.7 | **7.0.5** | per T1a |

### Minors

`react-native-reanimated` 4.1.0 → 4.5.3 (pair with `react-native-worklets` 0.5.1 → 0.11.4 — they're version-locked), `react-native-screens` 4.16.0 → 4.27.0, `react-native-safe-area-context` 5.6.1 → 5.9.0, `react-native-svg` 15.13.0 → 15.15.5, `react-native-calendars` → 1.1314.0.

### Abandoned — replace, don't upgrade

- **`react-native-fast-image`** (last published 2022, no New Arch support). Three call sites: `VideoModal`, `MainScreen`, `Programs`. RN's built-in `Image` now does caching; `expo-image` is the richer option. **Note:** `VideoModal` is deleted by T3a and the other two are refactored by T2e — coordinate, or do the minimum to make them compile and let those briefs finish the job.
- **`react-native-render-html`** — per T1a's verdict.

### Not upgraded

`@react-navigation/*` stays at v6 here. **T1d** owns the v7 migration — it's a behavioural change, not a version bump, and it deserves its own reviewable commit.

---

## Config cleanup

### `babel.config.js`

The `module-resolver` plugin's `extensions` array lists only `.js` and `.json` — **no `.ts`/`.tsx`**. Alias resolution for TypeScript files is currently working by accident (Metro's own resolution covers it). Add them.

`@babel/plugin-proposal-decorators` has been removed — it existed only for WatermelonDB models. Confirm nothing else in the tree relies on legacy decorators.

### `tsconfig.json`

Currently:

```jsonc
"paths": {
  "@/*": ["./src/*"],
  "*": ["./src/*"],           // ← catch-all, remove
  "assets/*": ["./src/assets/*"],
  "components/*": ["./src/components/*"],
  "navigations/*": ["./src/navigations/*"],   // ← directory does not exist
  "containers/*": ["./src/containers/*"],     // ← does not exist
  "styles/*": ["./src/styles/*"],             // ← does not exist
  "api/*": ["./src/api/*"],                   // ← does not exist
  "utils/*": …, "screens/*": …, "services/*": …, "store/*": …, "hooks/*": …
}
```

**Collapse to `@/*` only.** Four of these point at directories that don't exist. Some source files import via the catch-all (e.g. `assets/...` in `BottomTabNavigation.tsx` and `Login/index.tsx`) — rewrite those to `@/` as part of this, since removing the catch-all breaks them. Keep it mechanical.

`noUnusedLocals: true` stays on.

### `metro.config.js`

Preserve the existing wrappers — `wrapWithReanimatedMetroConfig`, `withSentryConfig`, the SVG transformer, and `unstable_allowRequireContext: true` (used by `src/theme/assets/getAssetsContext.ts`). Both Reanimated and Sentry change their wrapper APIs across majors; re-check both.

---

## Acceptance criteria

1. `yarn install --frozen-lockfile` clean.
2. `yarn lint` green — including `tsc` after the alias collapse.
3. `yarn test` green.
4. Both platforms build **debug and release**.
5. Manual smoke on a real device, both platforms: login → programs list → subscribe → today's lessons → open a PDF → open a video → lesson chat connects → menu → logout.
7. Each major landed as its own commit, so `git bisect` is meaningful.

## Report back

- Final version table: package → old → new.
- Anything you pinned below latest, and why.
- Every source file you edited and the reason (should be short and mechanical — a long list means scope crept).
- Anything that needs real refactoring, handed to the right Phase 2 brief.
