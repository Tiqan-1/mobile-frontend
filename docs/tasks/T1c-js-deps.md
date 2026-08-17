# T1c — JS dependency upgrades

> **Mahmoud is doing the RN upgrade personally.** T1a–T1d are written as a runbook for him, not as agent tasks. An agent should only pick one up if explicitly handed it.

**Depends on:** T1a (verdicts), T1b (native ready). **Parallel-safe with:** nothing — this touches the dependency graph everyone else builds on.

## Goal

Move `react-native` off 0.81.4 and bring every dependency to a version that works with the target.

---

## Which version to target

**Attempt 0.87.0. Fall back to 0.83.10 without hesitation if it fights back.**

There is no prize for landing on the newest release, and this app carries three abandoned dependencies plus a JSI-level database — the exact profile that makes a six-minor jump expensive.

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

- WatermelonDB cannot be made to work on 0.87, **and** replacing it now isn't acceptable
- `react-native-render-html` has no viable path, **and** the backend can't switch to Markdown
- Three or more of the five spiked packages fail
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

`docs/tasks/T1a-findings.md`. If T1a says WatermelonDB or render-html is broken, the replacement work happens **here**, and it changes the size of this task considerably. Don't start until you've read the verdicts.

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

Confirm `@babel/plugin-proposal-decorators` (legacy mode, for WatermelonDB models) still works on 0.87's Babel preset — T1a should have answered this.

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
6. Offline progress still persists across an app restart (or the T1a-recommended replacement does).
7. Each major landed as its own commit, so `git bisect` is meaningful.

## Report back

- Final version table: package → old → new.
- Anything you pinned below latest, and why.
- Every source file you edited and the reason (should be short and mechanical — a long list means scope crept).
- Anything that needs real refactoring, handed to the right Phase 2 brief.
