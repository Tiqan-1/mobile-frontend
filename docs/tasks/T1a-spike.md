# T1a — RN upgrade risk spike

> **Mahmoud is doing the RN upgrade personally.** T1a–T1d are a runbook for him, not agent tasks.
>
> This spike is what decides the target version. **0.87.0 is the goal; 0.83.10 is the fallback** — see the decision rule in [T1c](T1c-js-deps.md#which-version-to-target). Run the tests below against 0.87 first; if two or more fail, re-run against 0.83.10 before concluding anything, since the answer may simply be "0.87 is too far."

**Depends on:** T0. **Parallel-safe with:** T1b.

## Goal

Two dependencies could sink the whole 0.81.4 → 0.87.0 upgrade. Find out **before** anyone starts migrating, in a throwaway app, so the answer costs half a day instead of a week of half-finished migration.

## Owns

A scratch RN 0.87 app outside this repo, plus one output file: `docs/tasks/T1a-findings.md`.

**Change nothing in this repository** other than adding that findings file.

---

## The risk

> ### ✅ WatermelonDB — resolved, no longer a risk
>
> `@nozbe/watermelondb` was originally the headline risk here: JSI-level, a `simdjson` pod, unmoved since 0.28.0.
>
> **On 2026-08-17 it was found to be entirely unused and removed.** The dependency chain was `src/db/* → src/hooks/useProgress.ts → nothing` — `useProgress` was never imported, there was no `DatabaseProvider` in `App.tsx`, and no `withObservables` anywhere. `@nozbe/watermelondb`, `@nozbe/with-observables`, `@babel/plugin-proposal-decorators`, `src/db/` and `useProgress.ts` are all gone.
>
> **Do not spike it.** If the Family feature needs offline progress later, use MMKV (already present) or `@op-engineering/op-sqlite` — one flat table doesn't warrant a reactive ORM.

### `react-native-render-html@6.3.4` — the remaining high risk

Last published **2022**. No New Arch commitment. Renders lesson body HTML, and `src/theme/typography.ts` carries three tagsStyles maps for it (`tagsStylesHTML`, `tagsStylesHTMLWhite`, `tagsStylesHTMLBrand`), so it's load-bearing for content display.

**Test:** render a representative lesson HTML payload (pull a real one from the dev API) on 0.87 with New Arch. Check custom `tagsStyles`, embedded images, and **RTL text** — Arabic is the primary content language and a renderer that mangles RTL is a non-starter.

**If it fails:** options are a maintained fork, `react-native-markdown-display` if the backend can serve Markdown instead, or a small custom renderer for whatever tag subset the content actually uses. Sample real content before recommending — if lessons only use `<p>`, `<strong>`, `<ul>` and `<img>`, a 100-line renderer beats a dependency.

---

## Also worth 15 minutes each

Cheap to check while the spike app exists:

- **`react-native-pdf` 6.7.7 → 7.0.5** — actively maintained (published 2026-08-13), so likely fine, but v7 is a major. Skim its changelog for breaking changes and confirm it pairs with `react-native-blob-util`.
- **`@pusher/pusher-websocket-react-native` 1.3.1** — native module, unclear New Arch status. Powers lesson chat.
- **`react-native-mmkv` 3 → 4** — v4 requires `react-native-nitro-modules`. Confirm it installs cleanly; MMKV backs both redux-persist and the theme/language preferences, so a failure here is broad.

---

## Acceptance criteria

`docs/tasks/T1a-findings.md` exists and states, for each of the four packages:

- **Verdict:** works / works with changes / broken
- Exact versions tested, and on which platforms
- If broken: the error, and a concrete recommended replacement with a rough migration estimate
- If it needs changes: the exact patch, podfile entry, or config change required

The point is that T1b and T1c can act on this without re-deriving anything. A verdict without a reproduction or an error message isn't useful — include them.

Be honest about what you couldn't test. "Android only, no iOS device available" is a fine finding; a confident verdict based on one platform presented as both is not.
