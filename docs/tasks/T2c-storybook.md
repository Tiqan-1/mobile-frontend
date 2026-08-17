# T2c — Storybook

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

Add scripts: `yarn storybook` (enabled) and confirm plain `yarn android`/`yarn ios` still build with it off.

### 3. Decorators — the whole point

`.rnstorybook/preview.ts` needs global decorators providing:

- **`ThemeProvider`** with a **theme toggle control**, so any story can be flipped light↔dark from the Storybook UI
- **A direction toggle** for RTL/LTR
- `SafeAreaProvider`
- i18n provider (components call `t()`)

Without the theme and direction toggles this task delivers very little — that's the payload.

### 4. Stories

One `*.stories.tsx` per atom (12–13 after T2b's deletions), colocated. Cover for each: default, every variant, disabled/loading where applicable, long-text overflow, and **Arabic text** — not lorem ipsum. Arabic has different line heights and shaping, which is exactly what breaks.

Then the molecules. `LessonChat` needs mocked Pusher and query state — if that's disproportionate, skip it and say so.

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
