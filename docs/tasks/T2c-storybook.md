# T2c — Storybook

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
| **Last updated** | 2026-08-17 |

Metro wiring notes updated for `expo/metro-config` — read the trap box before touching the config.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [ ] `.rnstorybook/` config
- [ ] `STORYBOOK_ENABLED` flag; production bundle verified clean
- [ ] Metro wrapper added without breaking SVG / Reanimated / Sentry
- [ ] A story per atom, light + dark, RTL + LTR, with real Arabic text
- [ ] Token stories: colour swatches, type ramp, spacing ruler
- [ ] `yarn start` / `yarn android` / `yarn ios` unaffected with the flag off

---

**Depends on:** T2b. **Parallel-safe with:** T2d.

## Goal

Make the component layer reviewable without running the whole app — and give light/dark and RTL/LTR a place where they're actually verified rather than assumed.

## Owns

```
.rnstorybook/**            *.stories.tsx  (new files only)
metro.config.js            package.json   (storybook deps + scripts)
src/config/index.ts        (the STORYBOOK_ENABLED flag)
scripts/storybook-flag.js  (new)
```

**Do not modify any component.** If a component can't be story-ised without changing it, that's a finding for T2b, not a fix for you.

---

## Why this matters here specifically

Two of this app's hardest-to-test dimensions are invisible in normal development:

- **Dark mode** is currently gated off (`enableDark = false`) and has been broken by the mutable-`PALETTE` bug. When T2f flips it on, Storybook is where you find out which components never handled it.
- **RTL** is the *primary* direction — Arabic is the default language — but most development happens LTR. Icon mirroring, padding asymmetry and text alignment break silently.

A story that renders in all four combinations catches both cheaply.

---

## Work

### 1. Install

`@storybook/react-native` v10 with `@storybook/addon-ondevice-controls` and `@storybook/addon-ondevice-actions`. Follow the library's own setup docs — don't copy another project's config.

Config in `.rnstorybook/`: `main.ts` with `stories: ['../src/**/*.stories.@(ts|tsx)']`, plus `preview.ts`, `index.ts`.

### 2. Build-time flag

Storybook must be **excluded from production bundles entirely**.

Add `STORYBOOK_ENABLED` to `src/config/index.ts`, resolved at bundle time by a `scripts/storybook-flag.js`, and wire it in `metro.config.js` with a `resolveRequest` that returns `{ type: 'empty' }` for `.rnstorybook` when disabled.

`metro.config.js` already stacks `wrapWithReanimatedMetroConfig`, `withSentryConfig`, and the SVG transformer. **Order matters** — add the Storybook wrapper without disturbing them, and verify a normal `yarn start` still resolves SVGs and Reanimated after your change.

> ### ⚠️ The metro config is Expo's now — two traps, both of which have already bitten
>
> Since the T4 migration, `metro.config.js` is built on **`expo/metro-config`**, and it mutates the object `getDefaultConfig()` returns rather than merging. Both details matter:
>
> 1. **Do not introduce `mergeConfig`** from `metro-config` or `@react-native/metro-config`. Expo's default config isn't safe to merge that way — you get a `Bundler` whose `_transformer` is never set, which fails *silently* and surfaces much later as an unrelated-looking `Cannot read properties of undefined (reading 'transformFile')`. Extend the returned object in place (spread `defaultConfig.transformer` / `defaultConfig.resolver`).
> 2. **`react-native-svg-transformer` must stay on its `/expo` entry point**, not `/react-native`. The `/react-native` variant replaces Expo's transformer wrapper instead of composing with it — same silent failure.
>
> Full detail in `CLAUDE.md` §3 under "Native config". If your Storybook wrapper causes a `transformFile` crash, this is why — don't go hunting Storybook.

Add scripts: `yarn storybook` (enabled) and confirm plain `yarn android`/`yarn ios` — now `expo run:android` / `expo run:ios` — still build with it off. Note that those commands **prebuild** if `android/`/`ios/` are missing, so a first run is slow; that's expected, not a Storybook regression.

### 3. Decorators — the whole point

`.rnstorybook/preview.ts` needs global decorators providing:

- **`ThemeProvider`** with a **theme toggle control**, so any story can be flipped light↔dark from the Storybook UI
- **A direction toggle** for RTL/LTR
- `SafeAreaProvider`
- i18n provider (components call `t()`)

Without the theme and direction toggles this task delivers very little — that's the payload.

### 4. Stories

One `*.stories.tsx` per atom (12–13 after T2b's deletions), colocated. Cover for each: default, every variant, disabled/loading where applicable, long-text overflow, and **Arabic text** — not lorem ipsum. Arabic has different line heights and shaping, which is exactly what breaks.

Then the molecules. `LessonChat` needs mocked query state — Pusher is gone, so there's no realtime client to stub; it polls react-query on a 5s `refetchInterval` instead. Mock the query and make sure your story doesn't leave a poll running. If that's disproportionate, skip it and say so.

Also add stories for the **token scales** from T2a: a color swatch sheet (light and dark side by side), a type ramp, a spacing ruler. These are the fastest way to review the token work.

---

## Acceptance criteria

1. `yarn storybook` launches on device and lists every atom.
2. Every atom has a story rendering in **light, dark, LTR and RTL** without crashing.
3. Production builds contain no Storybook code — verify by bundle size or by grepping the release bundle for a Storybook string.
4. `yarn start` / `yarn android` / `yarn ios` unaffected with the flag off.
5. `yarn lint` and `yarn test` green.
6. No file under `src/components/` modified other than added `*.stories.tsx`.

## Report back

- **Every component that renders wrong in dark mode or RTL.** This is the most valuable output of the task — it's the first time anyone will have looked. File it as a list for T2f.
- Any component that couldn't be story-ised, and why.
- Whether the metro wrapper stack needed reordering.
