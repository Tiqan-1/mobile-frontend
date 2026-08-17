# T2b — Normalize atoms and molecules

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

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [ ] Flat atoms promoted to folders
- [ ] Every `StyleSheet` split into a sibling `style.ts`
- [ ] `forwardRef` + `memo` + `displayName` on every atom
- [ ] Both barrels export every component **and** its prop types
- [ ] `AssetByVariant` / `IconByVariant` — fixed or deleted, decision recorded here
- [ ] `Text` / `Button` prop APIs unchanged
- [ ] `LessonChat` given its `style.ts` split, `TODO(T4)` polling left intact

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

1. Every atom and molecule is a folder with `index.tsx` + `style.ts`.
2. No `StyleSheet.create` at module scope with theme values in any owned file.
3. No `PALETTE` imports remain under `src/components/`.
4. Both barrels export every component plus its prop types.
5. **No component's public props changed** — verify by confirming you edited zero files under `src/screens/`.
6. `yarn lint`, `yarn test` green; app builds and is visually identical.
7. Existing tests (`Skeleton.test.tsx`) still pass.

## Report back

- Your `AssetByVariant`/`IconByVariant` decision and reasoning.
- Any component where `forwardRef` didn't make sense.
- Hardcoded values you couldn't map to a token — T2a may need to extend the scale.
- Confirmation that no screen file was touched.
