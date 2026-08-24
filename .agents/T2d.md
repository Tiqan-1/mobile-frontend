# T2d — Data layer

> The spine of the pipeline. Every role reads this file and appends to it.
> **Nothing is passed between roles by prose alone.** If a fact is not
> written here, the next role does not know it.

**Status:** draft
**Owner right now:** lead
**Implementer for this task:** — (task skipped before this was set)
**OpenCode session id:** none yet — no `oc.sh` call was ever made for this task
**Review loop count:** 0 / 2
**Latest handoff:** lead → HELD again by explicit user request (2026-08-23, second time) → next: T3a

---

## Goal

Replace the bespoke `setState`-injecting fetch layer (`REQUESTING` in `src/services/API.ts`) with `@tanstack/react-query` — already a dependency, never wired up — and fix auth token handling: a request interceptor that sets the auth header on every call (replacing the two imperative `api.setHeader` call sites), and 401 handling (refresh-and-retry if a refresh endpoint exists, otherwise a clean logout with that gap reported). Migrate exactly one screen (`Startup`) as the reference implementation for T2e/T2f to copy later. Also fix `src/navigation/types.ts` route param types, which currently reference `Lesson`/`Program`/`Subscription` without importing them (silently resolving to `any`).

Full context, current-state analysis, and per-item guidance: `docs/tasks/T2d-data-layer.md`. This state file tracks the pipeline run; that brief remains the source of truth for *why* and *how*.

## Acceptance criteria

- [ ] AC1 — `QueryClientProvider` added to `src/App.tsx` with `retry`/`staleTime`/`refetchOnWindowFocus: false` defaults; `reactotron-react-query` wired in dev and shows queries.
- [ ] AC2 — Every endpoint in the table below has a typed react-query hook (in `src/services/queries/` or `src/hooks/queries/`): `/app`, `/api/authentication/login`, `/api/authentication/forgot-password/{email}`, `/api/students/sign-up`, `/api/students` (DELETE), `/api/students/subscriptions/v2`, `/api/students/subscriptions/{id}` (DELETE), `/api/students/subscriptions/v2/create`, `/api/students/v3/programs` (paginated → `useInfiniteQuery`), `/chat/{roomId}/join` + `/send`.
- [ ] AC3 — Auth header set by an apisauce request transform reading the token from the store; the two imperative `setHeader` calls (`Login`, `Startup`) are deleted.
- [ ] AC4 — 401 response transform: single-flight refresh-and-retry if a refresh endpoint exists, else clean `logout()` + reset navigation to `Auth` — **reported either way**, since "does a refresh endpoint exist" is an open backend question (see README unowned items). Concurrent 401s must not fire N refreshes.
- [ ] AC5 — `Startup` screen fully migrated to the new hooks/provider and confirmed working.
- [ ] AC6 — `src/navigation/types.ts` route params import real types (`Lesson`/`Program`/`Subscription` from `@/types/program`) and are changed to IDs (e.g. `{ programId: string }`) rather than whole entities; `navigate()` call sites updated minimally to compile; touched screen files listed in the report.
- [ ] AC7 — `REQUESTING` still works for unmigrated screens (marked `@deprecated` pointing at the new hooks, not deleted).
- [ ] AC8 — `yarn lint` and `yarn test` green (or no worse than the documented baseline); base URL confirmed read from `EXPO_PUBLIC_*` (not the `isTest` boolean) and the `Login` "Test API" banner keyed off the same source; `subscriptionSlice` decision made and stated (keep vs. remove now that react-query owns server state).

## Constraints

- Surgical changes only. Every changed line traces to this Goal.
- No new runtime dependency — `@tanstack/react-query` and `reactotron-react-query` are already present; wiring only.
- **Do not rewrite screens** beyond `Startup` and the minimal `navigate()` call-site fixes AC6 requires. T2e/T2f own the rest.
- Do not invent a refresh endpoint if none is documented — report the gap instead (§CLAUDE.md 0.6).
- Stay inside Files in scope below; anything else goes to Open questions, not a direct edit (§CLAUDE.md 0.4).

## Files in scope

| File | Why |
| --- | --- |
| `src/services/**` | `API.ts` interceptors, new `queries/` hooks, `Pagination.ts` disposition |
| `src/store/**` | `subscriptionSlice` decision; auth slice read by the interceptor |
| `src/App.tsx` | `QueryClientProvider` + Reactotron wiring |
| `src/navigation/types.ts` | Route param type fixes (AC6) |
| `src/hooks/` | New query hooks only (if placed here instead of `src/services/queries/`) |
| `src/screens/Startup/**` | Reference migration (AC5) |
| Minimal `navigate()` call sites elsewhere | Only what AC6 needs to keep the type change compiling — list exactly what's touched |

## New permissions required

| Permission / dependency | Why it is unavoidable |
| --- | --- |
| (none expected) | `@tanstack/react-query` and `reactotron-react-query` are already installed dependencies |

## Decisions log

| When | Role | Decision | Why |
| --- | --- | --- | --- |
| 2026-08-23 | lead | Skipped the `planner` subagent dispatch | `docs/tasks/T2d-data-layer.md` is already a complete, checkable spec (Goal, 8 ACs, Owns list, per-item work) — re-planning would just restate it. User explicitly asked to skip the planner when not needed. |
| 2026-08-23 | lead | Task id `T2d` (not a sequential `T-01`) | Keeps this pipeline run traceable 1:1 to the existing docs/tasks brief it's executing. |
| 2026-08-23 | lead | Task **skipped** — pipeline run ended here, before Implement | User asked to skip this feature and move to the next unblocked one. Not a rejection of the spec; `docs/tasks/T2d-data-layer.md` itself is left `⚪ not started` (unchanged) and remains available to pick up later. |

## Review verdicts

> Written by the reviewer only. PASS or CHANGES_REQUESTED, then numbered findings with file:line and severity.

### Pass 1 — <date> — verdict: <PASS | CHANGES_REQUESTED>

<findings, or "none">

## Test results

> Written by the tester only. Never edits source; reports and triages.

### Run 1 — <date>

- Command:
- Result:
- Failures with reproduction steps:

## Findings for docs

> Any role may append a line here when something learned in this task is
> true beyond this task.

## Open questions

- [ ]
