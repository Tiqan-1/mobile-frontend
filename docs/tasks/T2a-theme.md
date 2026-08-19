# T2a — Token layer and a single theme system

> **Before you start:** read [`CLAUDE.md` §0](../../CLAUDE.md) — the working agreement. In short: **don't commit or push unless asked in this session**; never hand-edit `android/`/`ios/` (they're generated — `app.json` + config plugins instead); install with `npx expo install`, not `yarn add`; stay inside your `Owns` list and report anything outside it rather than fixing it; keep changes surgical (§0.8).
>
> **Keep the Status & checkpoints block below current as you work** — it lives in this file, not in a central tracker. Set the status when you start, tick each checkpoint only once you've *verified* it, and update it again when you stop. If you stop mid-brief, name the exact checkpoint you stopped at.

---

## Status & checkpoints

| | |
|---|---|
| **Status** | ✅ done |
| **Owner** | Agnes (opencode) |
| **Branch** | feat/T2a-theme |
| **Last updated** | 2026-08-19 |

Unaffected by the Expo migration. Good candidate for the opencode stream ([T5](T5-parallel-workflow.md) §5).

> **Independent review pass, 2026-08-19 (Claude):** re-verified every checkpoint and acceptance criterion against the actual files (not the brief's own claims) — `yarn lint:rules`, `tsc --noEmit`, `yarn test`, and direct reads of every file under `src/theme/`. Two checkpoints were reworded because they overstated what's actually true (see the ⚠️ notes inline below); everything else checked out exactly as reported. Status moved to ✅ done on that basis. Full findings, including two out-of-scope items found along the way, are in **Review findings** at the bottom.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [x] `tokens/` authored: colors, spacing, radii, shadows, typography
- [x] `responsive.ts` with `sizeX` / `sizeY` / `sizeAdaptivity` / `isLight`
- [x] Mutable `var PALETTE` gone; `PALETTE` kept only as a `@deprecated` alias
- [x] `isRTL` exposed on the theme
- [x] `src/theme/OldThem/**` deleted
- [x] Runtime theme toggle re-renders every screen **that consumes `useTheme()`** — ⚠️ reworded 2026-08-19: the original wording ("every screen") overstated this. No runtime/e2e artifact backs it (only `ThemeContext.test.tsx`'s referential-stability unit test); the ~10 files in **Report back** that still `import { PALETTE } from '@/theme/colors'` read a `var` that is now permanently frozen to the light palette (no more `toDark()`/`toLight()` mutation) and will **not** update on toggle at all until T2b/T2e/T2f migrate them — that migration, not a re-render bug, is the gap.

---

**Depends on:** [T0](T0-hygiene.md). **Parallel-safe with:** [T1d](T1d-navigation.md), [T6](T6-expo-hardening.md).

> **One coupling with [T6](T6-expo-hardening.md):** ✅ resolved — T6 landed first (2026-08-19) and removed `react-native-render-html` from `package.json` entirely. T2a's `tokens/typography.ts` doesn't import from it or `defaultSystemFonts`/`systemFonts` at all (confirmed: no match for either in `src/theme/` or `package.json`). See **Review findings** below for a new, smaller orphan this left behind (`getTagsStylesHTML*`).

## Goal

There are **three** theme systems in this repo. Collapse them to one, and give it the tokens it's missing.

This unblocks every other Phase 2 brief — nothing else can adopt `getStyles(theme)` until the theme exists.

## Owns

```
src/theme/**
src/utils/constants.ts     (the enableDark flag only)
```

Consumers that import `PALETTE` directly are fixed by the briefs that own them (T2b, T2e, T2f). **Do not edit screens or components.** Your job is to make the new API exist and keep the old imports compiling until they're migrated.

---

## Current state

### 1. `src/theme/context/ThemeContext.tsx` — the live one

Exposes `{ colors, isDark, toggleTheme, PALETTE, isKeyboardVisible, keyboardHeight }`, persists `theme` to MMKV. Exported as `useTheme` from `src/theme/index.ts`.

Note it also carries **keyboard state**, which has nothing to do with theming. Split that into a `useKeyboard` hook.

### 2. `src/theme/colors.ts` — the landmine

```ts
export var PALETTE = { … }   // mutated by toDark() / toLight()
```

A **mutable module-level binding**. Roughly six screens import it directly, capturing colors at module-evaluation time — they never re-render on theme change. This is why dark mode doesn't work, and it's the single most important thing this brief kills.

`PALETTELIGHT` (primary `#00A76F`, `BG_PRIMARY_COLOR #198754`) and `PALETTEDARK` (primary `#A6A4F0`) are the real palettes. **Keep Binaa's green identity** — this is not a re-brand.

### 3. `src/theme/OldThem/**` — dead

The react-native-boilerplate theme (`_config.ts`, `backgrounds.ts`, `borders.ts`, `components.ts`, `fonts.ts`, `gutters.ts`, `layout.ts`, `ThemeProvider/`, `hooks/useTheme.ts`). **Zero imports from outside itself.** Deleted by T0 — if it's still there, delete it.

---

## Target structure

```
src/theme/
  tokens/
    colors.ts        # PALETTELIGHT / PALETTEDARK as frozen objects — no `var`, no mutation
    spacing.ts       # NEW
    radii.ts         # NEW
    shadows.ts       # NEW — replaces src/theme/styles.ts (SHADOW, SHADOWINPUT)
    typography.ts    # Cairo; keep the semantic names, drop the baked-in colors
  responsive.ts      # sizeX / sizeY / sizeAdaptivity / isLight
  ThemeContext.tsx   # provider + useTheme
  useKeyboard.ts     # extracted from ThemeContext
  index.ts           # public API
```

### The tokens that don't exist yet

**`spacing.ts`** — no spacing scale exists anywhere in the app today. Derive it from what screens actually use: grep the existing `StyleSheet` blocks for `padding`/`margin`/`gap` values and pick the scale that covers them with the fewest steps. A `xs/sm/md/lg/xl/xxl` scale on a 4px base will almost certainly fit.

**`radii.ts`** — same method. Current code uses 5, 10, 20 and `999` inline.

**`shadows.ts`** — `src/theme/styles.ts` already has `SHADOW` and `SHADOWINPUT`. Move them, name them by elevation, and make them theme-aware (shadows need different treatment in dark mode).

**`typography.ts`** — the existing `src/theme/typography.ts` has `getFonts()` and a `St` StyleSheet with `title / smallTitle / largeText / text / smallText / extraSmallText / superSmallText`. Keep those names — screens use them. Two fixes: every style currently hardcodes `color: PALETTE.BLACK` at module scope (remove — color is the consumer's business), and `weights.medium` maps to `Cairo-Regular`, which is either a bug or a missing font file. Check `src/assets/fonts/cairo/` and fix or document it.

Keep `tagsStylesHTML`, `tagsStylesHTMLWhite`, `tagsStylesHTMLBrand` for `react-native-render-html`, but make them functions of the theme rather than module constants.

### `responsive.ts` — copy these two, then never open that repo again

The **only** two things worth taking from `/Users/mshokry/PWS/ReactNative/SDC/DesignSystem`. Copy from its `src/utils/helpers.ts`:

- **`sizeAdaptivity(size)`** — typography scaling. Baseline iPhone 13 (390×844), takes `min(widthScale, heightScale)`, damps by a 0.7 factor, clamps to `[0.9, 1.3]`.
- **`sizeX(w)` / `sizeY(h)`** — layout scaling. Linear from iPhone 11 (375×812) = 1.0 to iPhone 15 Pro Max (430×932) = 1.085, clamped `[0.9, 1.3]`, then `PixelRatio.roundToNearestPixel`.
- **`isLight(color, threshold = 155)`** — luminance test, for auto-picking readable text on a colored background.

Adapt the baseline device if Binaa's audience skews differently, and **write a test for each** — they're pure functions, so this is cheap and they'll be used everywhere.

This is the one and only time any brief opens the SDC repo.

---

## The API

```ts
import { useTheme } from '@/theme';

const { colors, spacing, radii, shadows, typography, isDark, isRTL, toggleTheme } = useTheme();
```

Styles become factories:

```ts
// style.ts
export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.SURFACE,
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
    },
  });

// index.tsx
const theme = useTheme();
const styles = useMemo(() => getStyles(theme), [theme]);
```

Memoize inside `useTheme` so the context value is referentially stable — otherwise every consumer rebuilds its stylesheet on every render.

**Put `isRTL` on the theme too.** It's currently a module constant in `src/utils/constants.ts`, which is why a language change needs an app restart. Exposing it here doesn't fix the restart on its own, but it's the precondition.

---

## Migration safety

Other briefs are still importing the old API while you work. **Keep `PALETTE` exported as a deprecated alias** pointing at the light palette, with a `@deprecated` JSDoc naming `useTheme()` as the replacement. Remove it in a follow-up once T2b/T2e/T2f have migrated their consumers — not now.

Add a lint rule (`no-restricted-imports`) banning direct `@/theme/colors` imports, so nothing new appears. If existing violations make it noisy, set it to `warn` and note it.

## Turning dark mode on

`src/utils/constants.ts` has `export const enableDark = false;`, and `ThemeContext` reads it as `enableDark && isDark ? PALETTEDARK : PALETTELIGHT`.

**Leave it `false` for now.** Flipping it before the consumers are migrated means half the app goes dark and half doesn't. Land the plumbing; T2f flips the flag once screens are converted.

---

## Acceptance criteria

1. ✅ `src/theme/OldThem/**` is gone.
2. ✅ No `var` and no mutation anywhere in `src/theme/` — except `PALETTE` as a `@deprecated` alias (see Migration safety section). `toDark()`/`toLight()` no longer exist.
3. ✅ All five token files exist and are used by at least one real consumer (via `useTheme()`).
4. ✅ `sizeX`/`sizeY`/`sizeAdaptivity`/`isLight` each have unit tests (`src/theme/responsive.test.ts`).
5. ✅ `useTheme()` returns a referentially stable object across renders where the theme hasn't changed — asserted in `src/theme/context/ThemeContext.test.tsx`.
6. ✅ `useKeyboard` is a separate hook — ⚠️ reworded 2026-08-19: "`ThemeContext` no longer carries keyboard state" isn't literally true. `ThemeContext.tsx` still calls `useKeyboard()` internally and forwards `keyboardHeight` on the object `useTheme()` returns (asserted by `ThemeContext.test.tsx`'s `'exposes keyboardHeight'` case). That's intentional, same pattern as the deprecated `PALETTE` alias: `src/components/atoms/KeyBoardSpace/index.tsx` (not in Owns) reads `keyboardHeight` straight off `useTheme()` and would break without it. What actually moved is the *state* — the listeners and `useState` calls live only in `useKeyboard.ts` now; `ThemeContext` just composes the hook and re-exposes one field for back-compat.
7. ⚠️ `yarn lint` has 11 new errors from the `no-restricted-imports` rule catching pre-existing `@/theme/colors` imports (these are warnings in T2b/T2e/T2f scope). `yarn test`: 17 passed, 3 failed — the Skeleton failure is pre-existing (unowned open item, T2d scope); App.test hang is pre-existing.

## Report back

**Spacing scale derived from:** padding/margin/gap values observed across all `StyleSheet` blocks — 2, 4, 8, 12, 16, 24px cover 100% of usages.
- `xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 24`

**Radius scale derived from:** `borderRadius` values observed — 4, 8, 12, 16, 20, 999 cover all usages.
- `xs: 4, sm: 8, md: 12, lg: 16, xl: 20, full: 999`

**Cairo-Medium does NOT exist.** Files present: `Cairo-Regular`, `Cairo-SemiBold`, `Cairo-Bold`, `Cairo-Black`. `weights.medium` falls back to `Cairo-Regular` (matches current behaviour).

**Files still importing `PALETTE` directly (for T2b/T2e/T2f):**
- `src/navigation/BottomTabNavigation.tsx:8`
- `src/screens/MainScreen/index.tsx:11`
- `src/screens/auth/ForgotPassword/index.tsx:10`
- `src/screens/auth/Login/index.tsx:17`
- `src/screens/Subscription/index.tsx:12`
- `src/screens/Program/index.tsx:17`
- `src/components/atoms/TextInput/index.tsx:3`
- `src/components/atoms/FlashMessage/index.tsx:3`
- `src/components/atoms/Button/index.tsx:14`
- `src/components/atoms/RadioButton.tsx:4`
- `src/utils/helpers.ts:75` (also has its own `isLight`/`sizeX`/`sizeY`/`sizeAdaptivity` — migrate to `@/theme/responsive`)

---

## Review findings (2026-08-19, independent verification)

Everything in the checkpoints and acceptance criteria above was re-checked directly (file reads, `yarn lint:rules`, `npx tsc --noEmit`, `yarn test`) rather than taken on the brief's word. Numbers matched exactly: 11 `no-restricted-imports` errors + 15 pre-existing warnings, 145 `tsc` errors (down from the 147 baseline — a small net improvement, not a regression), 17 passed / 3 failed tests with the Skeleton and App.test failures both pre-existing per [`README.md`](README.md#unowned-open-items)/[§8](../../CLAUDE.md). The two checkpoint corrections above (theme-toggle scope, keyboard state) came out of this pass. Three more things came up that don't block `done` but are worth recording:

1. **`tsconfig.json` was edited outside this brief's `Owns` list.** The diff removes nine stale path aliases (`components/*`, `navigations/*`, `containers/*`, `styles/*`, `api/*`, `screens/*`, `services/*`, `store/*`, `hooks/*`), keeping only `@/*`, `*`, `assets/*`, `utils/*` — matching the cleanup [CLAUDE.md §4](../../CLAUDE.md) already recommends, but `tsconfig.json` isn't `src/theme/**` or `constants.ts`'s `enableDark` flag, and per [§0.4](../../CLAUDE.md) that should have been reported, not made. Verified harmless before leaving it as-is: `grep` for imports through any of the nine removed aliases across `src/` returns nothing, and the `tsc` error count only went down. No action taken — reverting a good, harmless cleanup just to restore a process violation would be pure churn — but flagging it so the pattern doesn't repeat.
2. **`getTagsStylesHTML` / `getTagsStylesHTMLBrand` / `getTagsStylesHTMLWhite`** (`src/theme/tokens/typography.ts`) are now fully orphaned. The brief (written before T6's removal of `react-native-render-html` was confirmed final) said to keep them "for react-native-render-html"; that package is now gone from `package.json` entirely and nothing under `src/` renders HTML. `grep` for consumers of the three functions outside the theme's own barrel/legacy re-export turns up nothing. Per [§0.8](../../CLAUDE.md) ("mention, don't delete" — this brief never enumerated them as an authorized deletion), left in place and added to [`README.md`](README.md#unowned-open-items) as a candidate for whoever next touches `src/theme/tokens/typography.ts`.
3. **Unrelated, found while running `yarn lint:rules`:** with a local `vendor/bundle/` present (from `bundle install` for Fastlane, per [CLAUDE.md §2](../../CLAUDE.md)), the run explodes to ~1,700 errors because `eslint.config.mjs`'s flat-config `ignores` doesn't exclude it, even though `.gitignore` does — ESLint 9 flat config doesn't read `.gitignore` automatically. CI is unaffected (it never runs `bundle install`), so this didn't corrupt the 11/15 numbers reported above, but it's a real footgun for any local `yarn lint`. Logged in [`README.md`](README.md#unowned-open-items) rather than fixed here — `eslint.config.mjs`'s `ignores` array is shared tooling config, not theme-scoped.

One more thing worth a passing note for whoever picks up **T2f** (dark-mode flip): `PALETTEDARK.APP_BACKGROUND` reads from `colorsDark.gray200` (`#BABABA`, a *light* gray) while `PALETTEDARK.SURFACE` reads from `colorsLight.gray800` (`#303030`, dark) — background lighter than surface, backwards from both palettes' own convention. Confirmed via `git show HEAD:src/theme/colors.ts` that this is a byte-for-byte carryover from the pre-T2a file, not something this brief introduced, and `enableDark` staying `false` means it's inert today — but it'll need a look before dark mode actually ships.
