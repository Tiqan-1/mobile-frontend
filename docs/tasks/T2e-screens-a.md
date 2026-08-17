# T2e — Screen refactor: Programs and MainScreen

**Depends on:** T2b, T2d. **Parallel-safe with:** T2f.

## Goal

The two largest screens in the app — 1,115 LOC between them. Convert both to the new theme and data layers, and extract their inline components.

## Owns

```
src/screens/Programs/**       src/screens/MainScreen/**
src/components/molecules/     (new files only — extracted components)
src/components/organisms/     (new files only)
```

Coordinate with T2f: you both may want to extract a shared card component. **If you extract something T2f also needs, do it first and tell them** — or leave it in place and let one of you own it. Don't both create `ProgramCard`.

---

## The screens

### `src/screens/Programs/index.tsx` — 625 LOC

The biggest file in the app. Hits `GET /api/students/v3/programs`, paginated via `usePagination`/`Append`. Contains inline sub-components (`ProgramCard` and others), `moment` date math, and a large `StyleSheet` block.

### `src/screens/MainScreen/index.tsx` — 490 LOC

Hits `GET /api/students/subscriptions/v2`. Includes a timeline view, empty state, and refresh-on-focus. Imports `PALETTE` directly.

---

## Work

### 1. Data → react-query

Follow the reference implementation T2d built in `Startup`, and use the hooks it created. `Programs` is paginated → `useInfiniteQuery`.

Delete the `useState<APISTATE<T>>` + `REQUESTING(url, body, setState, params)` pattern from both. Refresh-on-focus becomes react-query's `refetchOnMount` / a focus effect, not a manual `useFocusEffect` + refetch.

### 2. Theme → `useTheme()`

Replace every direct `PALETTE` import (T2a's report lists them). Move each `StyleSheet` into a `style.ts` with `getStyles(theme)`. Replace hardcoded spacing/radii with tokens.

### 3. Extract inline components

`ProgramCard` and its siblings become real molecules/organisms with their own folders, per T2b's conventions (`index.tsx` + `style.ts`, `forwardRef`/`memo`, exported from the barrel).

Tier rule: if it takes props and renders, it's a molecule. If it fetches or dispatches, **lift that out** — organisms stay presentational (`CLAUDE.md` §4).

### 4. Route params

T2d changed nav params from whole objects to IDs. Update `navigation.navigate(Paths.Program, program)` → `navigate(Paths.Program, { programId: program.id })`, and read via the query cache on the other side.

### 5. i18n sweep

Any hardcoded Arabic string in these files moves to `ar.json` (with an `en.json` counterpart). Use real translation **keys** — not Arabic text as the key.

### 6. `moment` → note only

Both screens use `moment`, which is in maintenance mode. **Don't migrate it here** — a date-library swap across the app is its own task. Note the call sites in your report.

---

## Acceptance criteria

1. Neither screen imports `PALETTE` or calls `REQUESTING`.
2. Both have a `style.ts`; no theme values in module-scope `StyleSheet.create`.
3. Extracted components live under `molecules/`/`organisms/` and are barrel-exported.
4. Each screen's `index.tsx` is meaningfully smaller — if `Programs` is still 500 LOC, the extraction didn't happen.
5. **Behaviour is identical.** Verify manually: programs list loads, paginates on scroll, subscribe works, main screen shows subscriptions, empty state renders, refresh-on-focus works.
6. Renders correctly in **RTL** and in **dark mode** (T2c's Storybook findings may name specific problems here).
7. `yarn lint`, `yarn test` green.

## Report back

- What you extracted and where it landed.
- Anything shared with T2f, and how you divided it.
- `moment` call sites.
- Any behaviour that changed, even slightly — this brief is meant to be invisible to users, so a diff in behaviour is a finding.
