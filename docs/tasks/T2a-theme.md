# T2a — Token layer and a single theme system

**Depends on:** T1c. **Parallel-safe with:** T1d.

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

1. `src/theme/OldThem/**` is gone.
2. No `var` and no mutation anywhere in `src/theme/`. `toDark()`/`toLight()` no longer exist.
3. All five token files exist and are used by at least one real consumer.
4. `sizeX`/`sizeY`/`sizeAdaptivity`/`isLight` each have unit tests.
5. `useTheme()` returns a referentially stable object across renders where the theme hasn't changed — assert this in a test.
6. `useKeyboard` is a separate hook; `ThemeContext` no longer carries keyboard state.
7. `yarn lint` and `yarn test` green; app builds and looks **unchanged** — this brief is invisible to users.

## Report back

- The spacing and radii scales you derived, and what you derived them from.
- Whether `Cairo-Medium` exists (the `weights.medium` question).
- The list of files still importing `PALETTE` directly, so T2b/T2e/T2f know their targets.
