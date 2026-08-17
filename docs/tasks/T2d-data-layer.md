# T2d — Data layer

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

401 handling depends on an unanswered BE question — see README's unowned items.

**Legend:** ⚪ not started · 🔵 in progress · ⏸️ blocked · ✅ done · 🟣 superseded

Tick a box only when you have **verified** it, not when you've written the code. Add a checkpoint if this brief turns out to need one — don't silently widen the one you're on. This brief is `✅ done` only when every box is ticked **and** the Acceptance criteria below pass.

- [ ] `QueryClientProvider` in `src/App.tsx`
- [ ] apisauce auth-header interceptor
- [ ] 401 handling (blocked on whether a refresh endpoint exists)
- [ ] `REQUESTING` retired in favour of react-query
- [ ] `baseURL` read from `EXPO_PUBLIC_*`
- [ ] Route param types real; IDs passed instead of whole domain objects

---

**Depends on:** T2a. **Parallel-safe with:** T2b, T2c.

## Goal

Replace the bespoke `setState`-injecting fetch layer with react-query — **which is already a dependency and has simply never been wired up** — and fix auth token handling.

## Owns

```
src/services/**       src/store/**       src/App.tsx       src/navigation/types.ts
src/hooks/            (new query hooks only)
```

**Do not rewrite screens.** Your job is to build the new layer, wire the provider, and migrate *one* screen as a reference implementation. T2e and T2f migrate the rest.

---

## Current state

### The `REQUESTING` pattern

`src/services/API.ts` (303 LOC) exports `GET`/`POST`/`PUT`/`DELETE` over apisauce. All funnel into `REQUESTING`, a ~100-line `new Promise(async …)` that:

- takes a React `setState` and writes `{loading, error, results, pagination}` into component state
- dedupes in-flight requests via a module-level `Map<string, boolean>`
- retries `TIMEOUT_ERROR` up to 3 times
- coerces every error into a string
- both resolves *and* calls `setState` — two channels for one result

Every screen uses it. It is a hand-rolled react-query with fewer features and no cache.

### Auth

- `Authorization: bearer <token>` set **imperatively in exactly two places** — `Login` after a successful POST, and `Startup` on rehydrate. Nothing else.
- **No interceptor. No 401 handling.**
- `refreshToken` is stored in the auth slice and **never read**. Sessions just die.
- (T0 added the MMKV `encryptionKey`; storage is safe by the time you start.)

### Other

- `@tanstack/react-query` v5 installed; **no `QueryClientProvider` in `src/App.tsx`**. It only functions inside test wrappers and `LessonChat`.
- `src/store/user.ts` is 0 bytes (deleted in T0). `redux-observable`/`redux-devtools-extension` removed in T0.
- `src/services/Pagination.ts` — a paginated-list helper class, superseded by `useInfiniteQuery`.

---

## Work

### 1. `QueryClientProvider`

Add it to `src/App.tsx` with sensible defaults — `retry`, `staleTime`, and `refetchOnWindowFocus: false` (meaningless and wasteful on mobile). Wire `reactotron-react-query` in dev; it's already a devDependency.

### 2. Auth interceptor

Add an apisauce request transform that reads the token from the store and sets the header on **every** request. Delete the two imperative `api.setHeader` calls.

Then a response transform for **401**: attempt a refresh using the stored `refreshToken`, retry the original request once, and on failure dispatch `logout()` + reset navigation to `Auth`.

**Ask the backend team what the refresh endpoint is.** It isn't in the current endpoint list — `refreshToken` is stored but no code ever sends it anywhere. If no refresh endpoint exists, implement clean 401 → logout and **report that the refresh flow is blocked on backend work**. Don't invent an endpoint.

Concurrent 401s must not fire N refreshes — single-flight it.

### 3. Query hooks

One hook per endpoint, in `src/services/queries/` or `src/hooks/queries/`. Current endpoints:

| Endpoint | Method | Used by |
|---|---|---|
| `/app` | GET | `Startup` |
| `/api/authentication/login` | POST | `Login` |
| `/api/authentication/forgot-password/{email}` | GET | `ForgotPassword` |
| `/api/students/sign-up` | POST | `SignUp` |
| `/api/students` | DELETE | `Menu` |
| `/api/students/subscriptions/v2` | GET | `MainScreen` |
| `/api/students/subscriptions/{id}` | DELETE | `Program` |
| `/api/students/subscriptions/v2/create` | POST | `Program` |
| `/api/students/v3/programs` | GET | `Programs` |
| `/chat/{roomId}/join` · `/send` | GET/POST | `LessonChat` |

Establish a **query key convention** and document it in `CLAUDE.md`-adjacent comments — it's what makes invalidation predictable later.

Mutations invalidate rather than hand-rolling refetches. `Programs` is paginated (`usePagination`, `Append`) → `useInfiniteQuery`.

**Keep `REQUESTING` working** while T2e/T2f migrate. Mark it `@deprecated` pointing at the hooks. Don't delete it in this brief.

### 4. Migrate one screen as the reference

Pick **`Startup`** (58 LOC — smallest, and exercises the auth path). Convert it fully. It becomes the pattern T2e/T2f copy, so make it exemplary and comment the non-obvious parts.

### 5. Base URL

T0 moved the URL out of source. Verify `src/services/API.ts` reads it from config rather than the `isTest` boolean, and that the "Test API" banner in `Login` keys off the same source.

> **How env works here now:** there is no `react-native-config` and no `babel-plugin-inline-dotenv`. Values reach the bundle as **`EXPO_PUBLIC_*`**, which `babel-preset-expo` inlines at build time — so read `process.env.EXPO_PUBLIC_API_URL`, and expect T0 to have renamed the keys. Anything named `EXPO_PUBLIC_*` **ships inside the app** and is not a secret; if you find yourself wanting to put a real secret there, that's a signal the call belongs on the backend.

### 6. Route param types

`src/navigation/types.ts`:

```ts
[Paths.PDF]: Lesson;              // ← Lesson is never imported
[Paths.Program]: Program;         // ← nor Program
[Paths.Subscription]: Subscription;
```

These resolve to ambient globals, so **route params are effectively `any`**. Import them from `@/types/program`. Also add the missing `Paths.Programs` and `Paths.LIBRARY_SCREEN` entries.

Then change the params to **IDs** — `{ programId: string }` rather than the whole `Program`. Passing entities through navigation state means stale data and non-serializable warnings; with react-query the screen refetches from cache instantly by ID.

**This changes call sites in screens.** Make the type change and update the `navigate()` calls minimally so it compiles, then hand the full screen rework to T2e/T2f. Note exactly what you touched.

### 7. `subscriptionSlice`

T0 restored its commented-out assignment. Now decide: with react-query owning server state, **this slice probably shouldn't exist** — it's blacklisted from persistence anyway. If T0 found no real consumers, remove it and let the query cache be the source of truth. Say what you decided.

---

## Acceptance criteria

1. `QueryClientProvider` in `src/App.tsx`; Reactotron shows queries in dev.
2. Every endpoint has a typed hook.
3. Auth header set by interceptor; the two imperative `setHeader` calls are gone.
4. 401 → refresh-and-retry, or 401 → clean logout if no refresh endpoint exists (**reported either way**).
5. `Startup` fully migrated and working.
6. Route params typed against real imports; `Lesson`/`Program`/`Subscription` genuinely resolve.
7. `REQUESTING` still works for unmigrated screens.
8. `yarn lint`, `yarn test` green; full manual smoke passes.

## Report back

- **Whether a refresh endpoint exists** — if not, this is a backend request, and it's the highest-value thing you'll surface.
- Your query key convention.
- The `subscriptionSlice` decision.
- Exactly which screen files you touched for point 6 (should be a short list).
