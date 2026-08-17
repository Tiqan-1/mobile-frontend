# T1a — RN upgrade risk spike — 🟣 mostly spent

> **Before you start:** read [`CLAUDE.md` §0](../../CLAUDE.md) — the working agreement. In short: **don't commit or push unless asked in this session**; never hand-edit `android/`/`ios/` (they're generated — `app.json` + config plugins instead); install with `npx expo install`, not `yarn add`; stay inside your `Owns` list and report anything outside it rather than fixing it; keep changes surgical (§0.8).
>
> **Keep the Status & checkpoints block below current as you work** — it lives in this file, not in a central tracker. Set the status when you start, tick each checkpoint only once you've *verified* it, and update it again when you stop. If you stop mid-brief, name the exact checkpoint you stopped at.

---

## Status & checkpoints

| | |
|---|---|
| **Status** | 🟣 mostly spent — one live item |
| **Owner** | Mahmoud |
| **Branch** | — |
| **Last updated** | 2026-08-17 |

Blocks nothing until T2f touches lesson content. 3 of the original 4 risks were resolved by removal, not by spiking.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [x] WatermelonDB — resolved by removal, not spiked
- [x] Pusher — resolved by removal, not spiked
- [x] RN target — settled at 0.86.2
- [ ] `react-native-render-html` on 0.86.2 + New Arch, incl. Arabic/RTL and custom `tagsStyles`
- [ ] `react-native-pdf` 6 → 7 changelog skim
- [ ] `react-native-mmkv` 3 → 4 (`react-native-nitro-modules`) installs and autolinks under CNG
- [ ] `docs/tasks/T1a-findings.md` written

---

> ## Revision, 2026-08-17 — read before anything below
>
> This brief existed to de-risk a version decision **that has since been made**, and three of its four risks were resolved by removal rather than by spiking. What's left is one real question.
>
> | Original risk | Outcome |
> |---|---|
> | `@nozbe/watermelondb` | ✅ **Removed.** Found entirely unused (`src/db/* → useProgress → nothing`). Never spiked, never needed to be. |
> | `@pusher/pusher-websocket-react-native` | ✅ **Removed** in the T4 Expo migration rather than proven. No config plugin, autolinking under CNG unverified. `LessonChat` now polls every 5s. Choosing a real realtime replacement is an **open item** — see [README](README.md#unowned-open-items) — but it is no longer a *spike*. |
> | The version decision itself | ✅ **Settled at RN 0.86.2.** 0.87.0 was attempted and abandoned. 0.86.2 is what Expo SDK 57 pins. Ignore every "0.87 vs 0.83.10" decision rule below. |
> | **`react-native-render-html@6.3.4`** | ⏸️ **Still open. This is the only live work in this brief.** |
>
> **Also changed:** the scratch app is now an **Expo SDK 57** app (`npx create-expo-app` at SDK 57, which pins RN 0.86.2), not a bare `@react-native-community/cli init` at 0.87. Install into it with `npx expo install`, per [`CLAUDE.md` §0.3](../../CLAUDE.md).
>
> **Blocks nothing.** Nothing waits on this until T2f touches lesson content — so it can be done whenever, by whoever, rather than gating the pipeline the way the graph originally implied.
>
> `react-native-mmkv` 3 → 4 and `react-native-pdf` 6 → 7 are still worth the 15 minutes each, and are now tracked as T1c residuals.

**Depends on:** nothing. **Parallel-safe with:** everything.

## Goal

Find out whether `react-native-render-html` survives RN 0.86.2 on the New Architecture **before** anyone builds on it, in a throwaway app, so the answer costs half a day instead of a week of half-finished migration.

## Owns

A scratch Expo SDK 57 app outside this repo, plus one output file: `docs/tasks/T1a-findings.md`.

**Change nothing in this repository** other than adding that findings file — and keeping this brief's Status & checkpoints block current.

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

**Test:** render a representative lesson HTML payload (pull a real one from the dev API) on **RN 0.86.2 with New Arch on** — which is what an Expo SDK 57 scratch app gives you by default. Check custom `tagsStyles`, embedded images, and **RTL text** — Arabic is the primary content language and a renderer that mangles RTL is a non-starter.

**If it fails:** options are a maintained fork, `react-native-markdown-display` if the backend can serve Markdown instead, or a small custom renderer for whatever tag subset the content actually uses. Sample real content before recommending — if lessons only use `<p>`, `<strong>`, `<ul>` and `<img>`, a 100-line renderer beats a dependency.

---

## Also worth 15 minutes each

Cheap to check while the spike app exists. Install with `npx expo install` so you get SDK-57-compatible versions:

- **`react-native-pdf` 6.7.7 → 7.0.5** — actively maintained (published 2026-08-13), so likely fine, but v7 is a major. Skim its changelog for breaking changes and confirm it pairs with `react-native-blob-util`. Check whether either ships an Expo config plugin, since both are native.
- **`react-native-mmkv` 3 → 4** — v4 requires `react-native-nitro-modules`. Confirm it installs cleanly **and autolinks under CNG**; MMKV backs redux-persist, the theme, and the language preference, so a failure here is broad. T0 also adds an `encryptionKey`, so test with one set.
- ~~`@pusher/pusher-websocket-react-native`~~ — removed in T4, don't spike it. If you're picking a realtime replacement, that's its own piece of work, not this one.

---

## Acceptance criteria

`docs/tasks/T1a-findings.md` exists and states, for each of the three remaining packages (`render-html`, `pdf`, `mmkv`):

- **Verdict:** works / works with changes / broken
- Exact versions tested, and on which platforms
- If broken: the error, and a concrete recommended replacement with a rough migration estimate
- If it needs changes: the exact patch, podfile entry, or config change required

The point is that T1b and T1c can act on this without re-deriving anything. A verdict without a reproduction or an error message isn't useful — include them.

Be honest about what you couldn't test. "Android only, no iOS device available" is a fine finding; a confident verdict based on one platform presented as both is not.
