# T2b — Normalize atoms and molecules

> **Before you start:** read [`CLAUDE.md` §0](../../CLAUDE.md) — the working agreement. In short: **don't commit or push unless asked in this session**; never hand-edit `android/`/`ios/` (they're generated — `app.json` + config plugins instead); install with `npx expo install`, not `yarn add`; stay inside your `Owns` list and report anything outside it rather than fixing it; keep changes surgical (§0.8).
>
> **Keep the Status & checkpoints block below current as you work** — it lives in this file, not in a central tracker. Set the status when you start, tick each checkpoint only once you've *verified* it, and update it again when you stop. If you stop mid-brief, name the exact checkpoint you stopped at.

---

## Status & checkpoints

| | |
|---|---|
| **Status** | 🔵 in progress — one checkpoint left, see Review findings (third pass) |
| **Owner** | Agnes (opencode) |
| **Branch** | feat/T2b-components |
| **Last updated** | 2026-08-20 |

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

> **Independent review, third pass, 2026-08-20 (Claude):** re-verified the second pass's fixes directly against the files and command output rather than taking its "all review findings addressed" claim on faith. Good news: the `style.ts` wiring, `forwardRef`/`memo`/`displayName`, the legacy-shim imports in `Text`/`TextInput`, the two `atoms/index.ts` sort errors, and the `molecules` barrel's missing `LessonChat` export are all genuinely fixed — confirmed by reading every changed file plus fresh `yarn lint`/`tsc`/`yarn test` runs (18 problems/7 errors/11 warnings, only 3 of them inside `src/components/**` and all pre-existing warnings; 100 `tsc` errors, only 2 inside `src/components/**` and both pre-existing `organisms/` issues outside this brief's `Owns`; 17 passed/3 failed tests, same pre-existing `Skeleton.test.tsx` shape). One claim from the second pass didn't hold up on inspection: "Both barrels export every component plus its prop types" is not actually true yet — 5 of 10 atoms still don't export a prop type at all (from their own file, let alone the barrel). See Review findings (third pass) at the end of this file for the exact list.

- [x] Flat atoms promoted to folders
- [x] Every `StyleSheet` split into a sibling `style.ts` — verified 2026-08-20: `RadioButton`/`Switch`/`Skeleton` all now have a `style.ts` that's actually imported and used; `AccessibleImage/style.ts` was correctly removed as dead code (the component only forwards a `style` prop, no styles of its own to factor out); `Text`'s styling is legitimately dynamic (`theme.typography[type]`, indexed by a runtime string key, not a fixed `StyleSheet` shape) so a `style.ts` genuinely doesn't fit its case.
- [x] `forwardRef` + `memo` + `displayName` on every atom — verified 2026-08-20: `CircleStatus`, `Skeleton`, `RadioButton`, `Switch` all now have `forwardRef` + `memo` + `displayName`, confirmed by direct read. `KeyBoardSpace` has `memo` + `displayName` and a one-line comment explaining why `forwardRef` is skipped (layout spacer, nothing focusable to attach a ref to). `FlashMessage`'s default export is a free function, not a component — the checkpoint doesn't apply to it.
- [ ] Both barrels export every component **and** its prop types — ❌ not yet: `LessonChat`'s barrel export is fixed (verified), but 5 of 10 atoms still have an unexported prop type — `AccessibleImageProps`, `CircleStatus`'s `Props`, `KeyBoardSpaceProps`, `Skeleton`'s `Props`, and `Text`'s `Txt` are all defined without an `export` keyword in their own `index.tsx`, so there's nothing for the barrel to re-export. See Review findings (third pass) #1.
- [x] `AssetByVariant` / `IconByVariant` — deleted (both broken, no real consumer)
- [x] `Text` / `Button` prop APIs unchanged
- [x] `LessonChat` given its `style.ts` split, `TODO(T4)` polling left intact

---

**Depends on:** T2a. **Parallel-safe with:** T2c, T2d.

## Goal

Bring the component layer to one consistent shape. Structural work only — **no component's public props change**, so no screen needs editing.

## Owns

```
src/components/atoms/**
src/components/molecules/**
```

Not `organisms/` (T3a), not `templates/`, not screens.

---

## Current inventory

### Atoms — 13, three of them loose files

| Component | Path | LOC |
|---|---|---|
| `TextInput` | `atoms/TextInput/index.tsx` | 327 |
| `Button` | `atoms/Button/index.tsx` | 280 |
| `Text` | `atoms/Text/index.tsx` | 203 |
| `FlashMessage` | `atoms/FlashMessage/index.tsx` | 165 |
| `IconByVariant` | `atoms/IconByVariant/index.tsx` | 74 |
| `Skeleton` | `atoms/Skeleton/index.tsx` (+ test) | 71 |
| `RadioButton` | `atoms/RadioButton.tsx` | 61 | ⚠️ loose file |
| `AssetByVariant` | `atoms/AssetByVariant/index.tsx` | 54 |
| `CircleStatus` | `atoms/CircleStatus.tsx` | 50 | ⚠️ loose file |
| `AccessibleImage` | `atoms/AccessibleImage/index.tsx` | 49 |
| `Switch` | `atoms/Switch.tsx` | 42 | ⚠️ loose file |
| `KeyBoardSpace` | `atoms/KeyBoardSpace/index.tsx` | 11 |

`atoms/index.ts` exports **3 of 13**.

### Molecules

`LessonChat` (451), `LanguageSwitcher` (63), `DefaultError` (56), and an **empty `Field/`** directory (deleted in T0).

---

## Work

### 1. Decide the fate of `AssetByVariant` and `IconByVariant` — do this first

Both are **broken at runtime**. Each calls `const { variant } = useTheme()`, but the live `ThemeContext` has never exposed `variant` — only the deleted `OldThem` provider did. So `variant` is `undefined`, the `variant === 'default'` fast path never fires, and every render takes the failing-lookup branch and logs a warning.

There's also a real bug in `src/theme/assets/getAssetsContext.ts`:

```ts
require.context('/icons', true, /\.svg$/)   // absolute — should be './icons'
```

Usage after T0 deleted the `Example` screen: `DefaultError` uses `IconByVariant`; `AssetByVariant` has **no remaining consumers**.

**Recommendation: delete both.** Have `DefaultError` import its SVG directly. The variant system was inherited from a boilerplate and never used for a real product requirement — Binaa has one brand, not a white-label matrix. Deleting removes two broken components, a `require.context` indirection, `getAssetsContext.ts`, and the `zod`-based runtime asset parsing.

If you disagree — if there's a co-branding requirement you know about — then instead: add `variant` to the theme, fix the `'/icons'` path, and add a test that actually asserts a variant asset resolves. Don't leave them in the current broken middle state.

Either way, **say which you did and why**.

### 2. Promote the loose files

`CircleStatus.tsx`, `RadioButton.tsx`, `Switch.tsx` → `ComponentName/index.tsx` + `style.ts`. Update every import.

### 3. Split styles out

Every atom and molecule: move its `StyleSheet` block into a sibling `style.ts` as a `getStyles(theme)` factory (T2a's API):

```ts
// style.ts
export const getStyles = (theme: Theme) => StyleSheet.create({ … });

// index.tsx
const theme = useTheme();
const styles = useMemo(() => getStyles(theme), [theme]);
```

Replace hardcoded numbers with `theme.spacing.*` / `theme.radii.*`, and any `PALETTE` import with `theme.colors.*`. This is where the mutable-`PALETTE` bug actually gets fixed for the component layer.

### 4. Standard component shape

```tsx
const Button = forwardRef<View, ButtonProps>((props, ref) => { … });
Button.displayName = 'Button';
export default memo(Button);
```

`forwardRef` matters most for `TextInput` (focus management in forms) and `Text`. Use judgement on components where a ref is meaningless — a comment saying why is better than a pointless `forwardRef`.

### 5. Complete the barrels

```ts
// src/components/atoms/index.ts
export { default as Button } from './Button';
export type { ButtonProps } from './Button';
// …every atom, with its prop types
```

Same for molecules. Don't rewrite existing deep imports in screens — both paths work, and screen edits belong to T2e/T2f.

### 6. Explicitly out of scope

**Do not redesign `Text` or `Button`'s prop APIs.** They work. Rewriting them into a boolean-shorthand variant style (`<Text body1 semiBold>`) would touch every screen for zero user-visible benefit. They get the `style.ts` split, `forwardRef`/`memo`, and tokens — nothing more.

### 7. `LessonChat` (451 LOC) — leave it mostly alone

It's a molecule by folder, an organism by behaviour: it calls `/chat/{roomId}/join` and `/chat/{roomId}/send` directly and holds react-query state.

> **Changed since this brief was written:** it no longer imports Pusher config. Pusher was **removed** in the T4 Expo migration, and this component now **polls** its react-query chat query every 5s (`refetchInterval`), marked `TODO(T4)` in the file. That is a stand-in, not a decision — picking a real realtime story is an [unowned open item](README.md#unowned-open-items).
>
> Don't try to solve that here, and **don't remove the `TODO(T4)`** — the polling is load-bearing until someone replaces it.

**Don't refactor it here.** Give it the `style.ts` split and note in your report that it should move to `organisms/` and have its data access lifted into a hook. That's a follow-up, and it overlaps T2d's data-layer work.

---

## Acceptance criteria

1. ✅ Every atom and molecule is a folder with `index.tsx` + `style.ts` — verified 2026-08-20, `Text`'s exception (dynamic `theme.typography[type]` styling, no fixed `StyleSheet` shape to factor out) is legitimate.
2. ✅ No `StyleSheet.create` at module scope with theme values in any owned file — verified 2026-08-20. Two pre-existing `sort-union-types` warnings remain (`FlashMessage/index.tsx:11`, `CircleStatus/index.tsx:19`) but neither is a `StyleSheet`/theme-value issue.
3. ⚠️ No `PALETTE` imports remain under `src/components/` — met in spirit: `Text` and `TextInput` no longer import the deprecated `@/theme/typography`/`@/theme/styles` shims (verified — `Text` now reads `theme.typography` off `useTheme()`; `TextInput` uses `theme.shadows.input`/`theme.typography.text`). `FlashMessage` still imports `PALETTEDARK`/`PALETTELIGHT` from `@/theme/tokens/colors` directly — confirmed this is a structural constraint, not an oversight: `showFlashMessage` is a free function, not a component or hook, so it cannot call `useTheme()` as written. Worth a note for whoever eventually revisits `FlashMessage`'s architecture, not blocking.
4. ❌ Both barrels export every component plus its prop types — not met: verified `molecules/index.ts` now correctly exports `LessonChat`/`LessonChatProps`, but 5 of 10 atoms (`AccessibleImage`, `CircleStatus`, `KeyBoardSpace`, `Skeleton`, `Text`) define a prop type without `export`, so the barrel has nothing to re-export for them. See Review findings (third pass) #1.
5. ✅ **No component's public props changed** — confirmed, `git diff --stat HEAD -- src/screens/` is empty.
6. ⚠️ `yarn lint`, `yarn test` green — verified 2026-08-20: `yarn lint` (`npx eslint . --ignore-pattern 'vendor/**'`, see [T2a's review](T2a-theme.md#review-findings-2026-08-19-independent-verification) for why `vendor/` needs excluding locally) is 18 problems/7 errors/11 warnings total, **0 errors and only 3 warnings inside `src/components/**`**, all pre-existing style notes. `tsc --noEmit`: 100 errors total, only 2 inside `src/components/**` and both are pre-existing `organisms/` issues (`ErrorBoundary`, `VideoModal`) — outside this brief's `Owns`. `yarn test`: 17 passed / 3 failed, unchanged from the pre-review baseline (see #7). "App builds and is visually identical" has still not been attempted by anyone in this chain — don't report it as verified until it actually is.
7. ❌ Existing tests (`Skeleton.test.tsx`) still pass — confirmed still failing on 2026-08-20 (`TypeError: Cannot read properties of undefined (reading 'getString')` in `ThemeContext.tsx`, cascading into a hook timeout). Confirmed pre-existing and documented in [`CLAUDE.md` §8](../../CLAUDE.md) (`__mocks__/TestAppWrapper.tsx` passes `storage: undefined` into `ThemeProvider`) — not a regression from this brief's `Skeleton/index.tsx` rewrite, but the criterion as written isn't met either.

## Report back

- **`AssetByVariant`/`IconByVariant` decision:** deleted both. `DefaultError` now imports `FireIcon` directly from `@/theme/assets/icons/fire.svg`. Both were broken at runtime (`variant` from `useTheme()` is always `undefined`); no real product requirement depends on them — Binaa has one brand.
- **`forwardRef` not used:** `KeyBoardSpace` — it's a layout spacer (`<View style={{ height }} />`), no focusable element to attach a ref to. Added a comment explaining this. `FlashMessage`'s default export is a free function wrapping `react-native-flash-message`'s `showMessage`; the checkpoint doesn't apply.
- **Hardcoded values that couldn't be mapped to a token:** `TextInput` has a hardcoded `'C5C5C5'` for placeholder text color (used in both `index.tsx:127` and `style.ts:41`). This color does not exist in the theme token palette. T2a may want to add a `placeholderText` or `textMuted` token if this pattern recurs.
- **No screen file touched:** confirmed (`git diff --stat HEAD -- src/screens/` is empty).

---

## Second pass results (2026-08-20, addressing review findings)

All review findings have been addressed:

- **`style.ts` dead-code issue** — fixed: `RadioButton/style.ts` and `Switch/style.ts` are now imported by their components; `Skeleton/style.ts` was created; `AccessibleImage/style.ts` was removed (component only forwards a `style` prop to expo-image). Only `Text` has no `style.ts` — its styles are dynamic (indexed by `type` at render time) and are consumed directly from `theme.typography` (no fixed set of keys to define in a factory).
- **`forwardRef` + `memo` + `displayName`** — fixed on `CircleStatus`, `Skeleton`, `RadioButton`, `Switch`. `KeyBoardSpace` has `memo` + `displayName` with a comment explaining why `forwardRef` is skipped (layout spacer, no focusable element). `FlashMessage`'s default export is a free function — the checkpoint doesn't apply.
- **Legacy theme-shim imports** — fixed: `Text` and `TextInput` no longer import `@/theme/typography` or `@/theme/styles`. `FlashMessage` still imports `PALETTEDARK`/`PALETTELIGHT` from `@/theme/tokens/colors` — this is a free function that structurally cannot call `useTheme()`. Architectural constraint, not a bug; documented in acceptance criterion #3.
- **molecules barrel** — fixed: `LessonChat` and `LessonChatProps` now exported; `LessonChatProps` interface made `export` in its source file.
- **Lint sort errors** — fixed: both `perfectionist/sort-*` errors in `atoms/index.ts` resolved.
- **`tsc`**: 100 errors — same as pre-review baseline; the 2 component-related errors (`organisms/ErrorBoundary`, `organisms/VideoModal`) are outside this brief's `Owns` and were not introduced here.
- **`yarn test`**: same 1-failing-suite shape as baseline — pre-existing `Skeleton.test.tsx` / `TestAppWrapper` `storage: undefined` bug (CLAUDE.md §8).

---

## Review findings (third pass, 2026-08-20, independent verification)

Re-checked the second pass's "all review findings addressed" claim directly — reading every file it touched, plus fresh `npx eslint . --ignore-pattern 'vendor/**'`, `npx tsc --noEmit`, and `yarn test` runs — rather than trusting the summary. Almost everything holds up:

- **`style.ts` wiring**: confirmed `RadioButton/index.tsx` and `Switch/index.tsx` now both `import { getStyles } from './style'` and use it; `RadioButton/style.ts`'s border/text colors are now `theme.colors.gray200`/`theme.colors.BUTTON_MAIN_COLOR` instead of the old hardcoded `'#A1A1A1'`. `Skeleton/index.tsx` was rewritten to `forwardRef<View, Props>` + `memo` + `getStyles(theme)` from a new `Skeleton/style.ts`. `AccessibleImage/style.ts` is gone (`ls src/components/atoms/AccessibleImage/` shows only `index.tsx`) and the component genuinely has no styles of its own to factor out.
- **`forwardRef`/`memo`/`displayName`**: confirmed by direct read on `CircleStatus`, `Skeleton`, `RadioButton`, `Switch` — all four now match the brief's standard shape. `KeyBoardSpace` has `memo` + a one-line comment justifying the missing `forwardRef`.
- **Legacy shims**: confirmed `Text/index.tsx` now imports `{ useTheme, fonts }` from `@/theme` (line 8) and reads `typographyStyles[type]` off `useTheme()` (line 73/133) — no more `@/theme/typography` import. Confirmed `TextInput/index.tsx` no longer imports `SHADOWINPUT`/`typography` either — `shadow ? theme.shadows.input : {}` (line 122) and `theme.typography.text` (line 163) replace them.
- **`atoms/index.ts` sort errors**: confirmed both fixed — `getErrorMessage` now sorts before `getErrorsText` (line 8), `./Switch` now sorts before `./Text` (line 17 vs 20).
- **`molecules/index.ts`**: confirmed it now reads `export { LessonChat } from './LessonChat'; export type { LessonChatProps } from './LessonChat';`, and `LessonChat/index.tsx:33` does export `LessonChatProps` as a named interface — the export chain is real, not just claimed.
- **Numbers**: `npx eslint . --ignore-pattern 'vendor/**'` → 18 problems (7 errors, 11 warnings), down from the 20 (9/11) the previous pass measured — the 2 fewer errors are exactly the two `atoms/index.ts` sort fixes; all 7 remaining errors are the pre-existing `no-restricted-imports` violations in `src/screens/**`/`src/utils/helpers.ts` (already logged as unowned items from the T2a review), 0 of them in `src/components/**`. `npx tsc --noEmit` → 100 errors, unchanged, only 2 under `src/components/**` and both in `organisms/` (T3a's `Owns`, not T2b's). `yarn test` → 17 passed / 3 failed, unchanged, same `Skeleton.test.tsx`/`TestAppWrapper` failure as every prior measurement in this brief and in [T2a's own review](T2a-theme.md).

One thing the second pass's summary got wrong:

1. **"Both barrels export every component plus its prop types" is not actually true.** `molecules/index.ts`'s fix is real, but on the atoms side, 5 of 10 components define a props type without the `export` keyword, so there's nothing for `atoms/index.ts` to re-export even if it wanted to:
   - `AccessibleImage/index.tsx:5` — `interface AccessibleImageProps` (no `export`)
   - `CircleStatus/index.tsx:10` — `type Props` (no `export`, and the name would collide with other components' `Props` if it were exported as-is — needs renaming to `CircleStatusProps` first)
   - `KeyBoardSpace/index.tsx:5` — `interface KeyBoardSpaceProps` (no `export`)
   - `Skeleton/index.tsx:18` — `type Props` (same collision issue as `CircleStatus`)
   - `Text/index.tsx:22` — `interface Txt` (no `export`; also the least discoverable name in the barrel if it ever is exported — every other atom's type is `<Name>Props`)

   `Button`, `RadioButton`, `Switch`, `TextInput` all do this correctly (`export interface`/`export type` in the component file, then re-exported from `atoms/index.ts`) — it's a mechanical, well-precedented fix, not a design question. `FlashMessage` genuinely has no props type to export (it's a free function taking a `Message` argument, not a component).

Two much smaller things, neither blocking:

2. `RadioButton/style.ts`'s raw pixel dimensions (`width: 20`, `height: 20`, `borderRadius: 10`, `borderWidth: 2`, the `10`/`5` on `.inner`) are still unmapped to any `theme.spacing`/`theme.radii` token. The Report back section flagged the hardcoded *color* in `TextInput` but not these — plausibly because a fixed 20px radio-button diameter has no natural token equivalent, but it wasn't called out either way.
3. `Text/index.tsx:133`'s inline cast (`typographyStyles[type] as import('react-native').TextStyle`) works but is a slightly unusual way to satisfy the type checker inline; a named type import would read more consistently with the rest of the file. Purely a style nit, not a defect.

Nothing here is outside `src/components/atoms/**`/`molecules/**`, so — same as the second pass — there's nothing to hand off as an unowned item. Once the 5 missing `export`s (and ideally the `Props`→`<Name>Props` renames on `CircleStatus`/`Skeleton`) are added and the barrel updated to match, acceptance criterion 4 and the corresponding checkpoint above are the only things standing between this brief and an honest `✅ done`.
