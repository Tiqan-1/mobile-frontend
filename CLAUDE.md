# CLAUDE.md

Guidance for Claude Code and other agents working in this repository.

---

## 0. Working agreement — applies to every agent, every task

**These are binding. They apply whether or not you were handed a brief, and they override any habit to the contrary.**

### 0.1 Do not commit, push, or open a PR unless explicitly asked

The repo owner reviews every change himself before it lands. So:

- **Never run `git commit`, `git push`, `git tag`, or `gh pr create` on your own initiative.** Leave your work in the working tree.
- Finish by *reporting* what you changed — a file list and a one-line why for each. Let the owner stage it.
- If a brief tells you to "land several reviewable commits", that means **structure** the work so it *can* be split that way, and say where the boundaries are. Still ask before committing.
- `git status`, `git diff`, `git log`, `git stash list` and other read-only commands are always fine, and you should use them freely.

The only exception is an explicit, current instruction from the owner in that session — "commit this", "make the PR". Approval given for one commit does not carry to the next one.

### 0.2 Keep your brief's status and checkpoints current

**Every brief in `docs/tasks/` carries its own `## Status & checkpoints` block near the top.** Progress is tracked *there*, in the brief itself — not in a central tracker. That way the work and its state are one file, and there's nothing to keep in sync.

- **Starting work:** set `Status` to `🔵 in progress` and fill in Owner, Branch, and the date.
- **During work:** tick each checkpoint as you *verify* it. Not when you write the code — when you've confirmed it does what it claims.
- **Finishing or stopping:** update the block. If you stopped mid-brief, say in the notes line **exactly which checkpoint you stopped at** and what the next one needs.
- **Never tick a box you didn't verify.** `⏸️ blocked` with a reason is worth more than an optimistic `✅`. A brief is `✅ done` only when every checkpoint is ticked *and* its Acceptance criteria pass.
- If you discover a checkpoint the brief missed, **add it** rather than quietly widening the one you're on.

Two things live outside the briefs, both in [`docs/tasks/README.md`](docs/tasks/README.md): the **unowned open items** list (real work no brief owns — add to it when you find something, and don't let a finding evaporate into a report nobody re-reads) and the **History** log (one line when something lands). The status column in that README is a convenience snapshot and is expected to go stale; the brief is authoritative.

This applies to ad-hoc work too: if you change something a brief owns, note it in that brief's block.

### 0.3 This is an Expo (CNG) project — the native rules are absolute

`android/` and `ios/` are **generated build output**. They are gitignored and absent from a fresh checkout.

- **Never hand-edit anything under `android/` or `ios/`.** `expo prebuild --clean` deletes it. If you find yourself patching a generated file, you have found a **missing config plugin** — write one, or report it. Never patch and move on.
- **`app.json`'s `expo` key is the source of truth** for bundle IDs, permissions, fonts, Info.plist keys, Sentry, icons, `newArchEnabled`, `edgeToEdgeEnabled`. Native config changes go there.
- Native *build* settings that `app.json` doesn't expose (deployment target, NDK, Proguard, compileSdk) go through **`expo-build-properties`**, not a gradle or Podfile edit.
- **Install dependencies with `npx expo install <pkg>`, not `yarn add`.** Expo pins versions per SDK; `yarn add` grabs `latest` and will silently give you something SDK 57 doesn't support. `npx expo install --check` audits what's already there.
- **Expo SDK pins the React Native version.** SDK 57 pins RN **0.86.2** — which is what the repo is on, so the migration cost nothing. Going forward that pin is a **ceiling, not a floor**: you cannot jump to an RN release before an SDK ships it. (0.87.0 was tried and abandoned before the migration; under Expo it wouldn't have been an option at all.) Plan upgrades around SDK releases, not RN releases.
- Any new native module must **support the New Architecture** (`newArchEnabled: true`) and should have an Expo config plugin or be autolink-clean under CNG. If it has neither, say so before adding it.
- To verify native work: `npx expo prebuild -p android --no-install` (or `--clean` to regenerate from scratch), then build. Don't assume prebuild output is current — it usually isn't.
- Env vars reach the bundle via **`EXPO_PUBLIC_*`**, which `babel-preset-expo` inlines at build time. There is no `react-native-config` and no `babel-plugin-inline-dotenv` any more. Remember that `EXPO_PUBLIC_*` values **ship inside the app** — they are not secrets.

### 0.4 Stay inside your `Owns` list

Every brief in `docs/tasks/` names the files it owns. Parallel work is only safe because of it.

- **Do not edit a file outside your `Owns` list.** If a change there looks necessary, **stop and report it** — don't make it. Another brief owns it and will conflict with you.
- This includes tempting one-liners: an unused import, a type error, a stray `console.log` in someone else's file. Report, don't fix.
- Don't reformat another brief's files to satisfy a linter. Disable the rule with a comment and report it instead.

### 0.5 Measure, don't assume

- Capture the **before** state before you change anything: `npx tsc --noEmit` error count, `yarn test` suite/test counts, whether `yarn lint` runs at all. Compare after.
- The baselines written in this file and in the briefs were true when measured (2026-08-17). **Confirm them; don't trust them.** They are a starting point, not a guarantee.
- Never report a build or a device check as passing if you didn't run it. If you can't run it, say so and hand it back explicitly.

### 0.6 Report honestly

- If a step is blocked, skipped, or partially done, say that plainly. Partial success reported as done is the one failure mode that costs more than the bug.
- If you find a problem outside your scope, list it in your report. That list is valuable; a silent fix is not.
- Correct your own earlier claims when you find them wrong, in the doc where they live — the briefs carry explicit correction notes for exactly this reason.

### 0.7 Do not open `/Users/mshokry/PWS/ReactNative/SDC/DesignSystem`

It is a separate production app, not a library — not installable by any mechanism. Everything worth taking from it is restated in §4 of this file or copied by T2a. Reading it costs tokens and yields nothing.

### 0.8 Karpathy guidelines

Behavioural guidelines that reduce common LLM coding mistakes, from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on where models go wrong.

**Tradeoff:** these bias toward caution over speed. For trivial tasks, use judgement.

#### 1. Think before coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

#### 2. Simplicity first

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "would a senior engineer say this is overcomplicated?" If yes, simplify.

#### 3. Surgical changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, **mention it — don't delete it.**

When your changes create orphans:

- Remove imports/variables/functions that **your** changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the request.

> **One scoped exception:** a few briefs — T0 most of all — explicitly scope *deletions* of pre-existing dead code. There, deleting is the assignment and "mention, don't delete" doesn't apply. It's the enumerated list in the brief that authorises it; anything not on that list still falls under the rule above. Outside a brief that names them, never delete dead code on your own initiative.

#### 4. Goal-driven execution

**Define success criteria. Loop until verified.**

Turn tasks into verifiable goals:

- "Add validation" → "write tests for invalid inputs, then make them pass"
- "Fix the bug" → "write a test that reproduces it, then make it pass"
- "Refactor X" → "ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") force constant clarification. This is the same instinct as §0.5 — and it's why each brief carries Acceptance criteria rather than a description of done.

---

## 1. Identity

This repo has **three different names for itself**. Getting them straight prevents most confusion:

| Name | What it refers to |
|---|---|
| **Mobadra** | The *folder* on disk (`~/PWS/ReactNative/Mobadra`). Appears nowhere in the code. |
| **Binaa** (بناء) | The **app's codebase identity**: `app.json`'s `expo.slug`, `package.json` `"name": "binaa"`, `expo.ios.bundleIdentifier`/`expo.android.package` `com.binaa`. **Not** the user-visible name — see below. |
| **Mubadarah** | The **backend**, and — as of 2026-08-19, confirmed by the owner — also the **app's user-visible display name**. `app.json`'s `expo.name` is `"مبادرة"`, shown under the home-screen icon on both platforms. `https://mubadarah.ce-svcs.cc` (prod) / `https://dev-mubadarah.ce-svcs.cc` (dev). |

Git remote is `git@github.com:Tech-Support-Team/mobile-frontend.git`. Git's configured default branch is `main`, but the active integration branch as of 2026-08-19 (confirmed by the owner) is `feat/expo` — target PRs there, not `main`, until told otherwise.

**What the app does:** an Arabic-first structured-learning app. Students browse multi-level programs, subscribe, follow a daily lesson schedule, consume PDF and video lessons in-app, track completion offline, and chat per-lesson (currently polling, not realtime — see §3).

---

## 2. Commands

Package manager is **Yarn Classic (v1)**. There is only a `yarn.lock` — do not introduce `npm install` or a second lockfile.

**This is now an Expo (CNG / bare-managed) project as of the 2026-08-17 T4 migration** (`docs/tasks/T4-expo-migration.md`). `android/` and `ios/` are **generated, gitignored, and not committed** — they don't exist in a fresh checkout.

```bash
yarn install
npx expo prebuild          # regenerates android/ and ios/ from app.json — run this first on a fresh checkout
                           # it runs pod install itself; `npx pod-install` is only a fallback

yarn start                 # expo start (Metro)
yarn android                # expo run:android — prebuilds automatically if android/ is missing/stale
yarn ios                    # expo run:ios     — same, for iOS

yarn lint                  # lint:rules && lint:type-check && lint:format
yarn lint:rules            # eslint .
yarn lint:type-check       # tsc --noEmit
yarn lint:format           # prettier --check .
yarn test                  # jest

npx expo-doctor            # the Expo health check — run before calling any native work done
npx expo install --check   # audits installed deps against the SDK 57 pin
```

The four `lint*` scripts landed in T0. Note that `yarn lint` is now a **gate on all three**, while CI runs `lint:type-check` and `lint:format` as non-blocking ratchets — the residual errors belong to briefs that haven't run yet, not to new code.

**Never hand-edit anything under `android/` or `ios/`.** `expo prebuild --clean` overwrites them from `app.json` + the plugins in `app.json`'s `plugins` array. If you find yourself patching a generated file, that's a missing config plugin — write one instead (see `docs/tasks/T4-expo-migration.md` acceptance criterion 10).

Release (Fastlane lives in `Fastlane/` — **capital F**, which macOS's case-insensitive filesystem hides). Fastlane still expects `android/`/`ios/` to exist, so **run `expo prebuild` before any Fastlane lane**:

```bash
bundle exec fastlane android build   # bundle release -> Play internal track (1% rollout) + Huawei AppGallery
bundle exec fastlane ios beta        # build -> TestFlight + Sentry dSYM upload
```

Ruby deps are pinned in `Gemfile` (CocoaPods `>= 1.13`, with specific bad versions excluded). Node `>= 20` per `engines`.

> **Current state** (measured 2026-08-18, after T0 landed. **Confirm these, don't trust them** — §0.5):
>
> - **`yarn lint:rules` runs and exits 0** (0 errors, 15 warnings). Before T0 it hard-crashed with `sourceCode.getRange is not a function` — ESLint 8 against a config needing ESLint 9. Lint *existing at all* is new.
> - **`tsc` reports 147 errors** (was 170 before T0). Do not assume a green baseline and **do not chase zero**: the bulk belong to T2b/T2d/T2e/T2f and get fixed when those briefs run. The single worst file is `src/components/atoms/FlashMessage/index.tsx` at 23. The number is a ratchet, not a gate.
> - **`yarn test`: 1 of 2 suites passes** (1 of 4 tests). `__tests__/App.test.tsx` renders the real `src/App.tsx` (Redux, PersistGate, ThemeProvider, navigator, Sentry) instead of the deleted root template. The failure is `src/components/atoms/Skeleton/Skeleton.test.tsx`, blocked on a pre-existing `__mocks__/TestAppWrapper.tsx` bug — see §8.
> - **CI exists** (`.github/workflows/ci.yml`): install → lint → type-check + format (non-blocking) → test → `expo prebuild -p android` → `assembleDebug`. **As of [T6](docs/tasks/T6-expo-hardening.md), 2026-08-19**: an iOS prebuild-only job runs on `macOS-latest` (no signing yet), and an EAS build job exists for Android. The trigger is scoped to `feat/expo` (not every branch): the cheap `checks` job runs on PRs into it, the three expensive jobs (Android build, iOS prebuild, EAS build) only run on `push` — i.e. after merge — to keep Actions minutes and EAS credits from being spent on WIP branches.

---


## MCP Servers (Debugging Tools)

Project MCP config: `.mcp.json` — `maestro`, `metro`, `mobile`, `xcodebuild` (plus Figma/Notion/Drive, unrelated to app debugging). **Don't probe all of them by default.** Pick one server per task and call only the tools you need — never call `ToolSearch` with a broad/empty query expecting the full catalog; search for the specific capability instead (e.g. `ToolSearch("+metro console logs")`).

**A server only shows up in `ToolSearch` if this session loaded it at startup.** If `.mcp.json` was edited after the session began, `/mcp` reconnecting may not surface its tools here — verify with a targeted `ToolSearch` call before assuming a tool exists; if it's missing, tell the user a fresh session is needed rather than guessing at tool names.

| Task | Use | Not |
|---|---|---|
| Inspect Redux/console/network/component tree/nav state while app is running | **metro** | mobile, maestro |
| Runtime JS errors, evaluate expressions in the running app | **metro** | xcodebuild |
| Write/run Maestro YAML E2E flows, view hierarchy for tests | **maestro** | mobile |
| One-off tap/swipe/screenshot, no Metro connection | **mobile** or **maestro** | metro |
| iOS build/scheme/simulator boot, native build failures, lldb | **xcodebuild** | metro, mobile |
| Android build/run | Bash (`yarn android`) | xcodebuild |
| Design-system/code edits, refactors | No MCP — Read/Grep/Edit | any MCP |

- **metro** (`npx metro-mcp`) — connects to a *running* Metro (`yarn start` + app open) via CDP: console logs, network, React tree, Redux state/dispatch, navigation state, JS eval. Prefer this over ad-hoc `console.log` + on-screen debug overlays for reading native/runtime state.
- **maestro** (`maestro mcp`) — deterministic E2E flows (YAML), device control, view-hierarchy inspection. Requires Maestro CLI + booted simulator.
- **mobile** (`npx @mobilenext/mobile-mcp`) — ad-hoc device control without Metro (tap/swipe/screenshot/launch). Overlaps with maestro; prefer maestro when the interaction should become a repeatable test.
- **xcodebuild** (`npx xcodebuildmcp`) — native iOS build/test/simulator/debug tooling (schemes, `build-and-run`, log capture, lldb). Not for Android or pure-JS issues.


## 3. Architecture

```
src/
├── assets/          fonts (Cairo), images, logo, svg, svg-app
├── components/      atoms / molecules / organisms / templates
├── config/          index.ts (APP_LANGUTAGE), telegram.ts
├── hooks/           useAccessibility, usePDFDocument, language/useI18n
├── navigation/      Application.tsx, BottomTabNavigation.tsx, paths.ts, types.ts
├── screens/         one folder per screen
├── services/        API.ts (apisauce) + documentService, telegramAPI, logger, …
├── store/           Redux Toolkit slices + redux-persist over MMKV
├── theme/           colors, typography, ThemeContext
├── translations/    ar.json, en.json, fr.json
├── types/           program.ts, pdf.ts, navigation.ts
└── utils/           constants, dateTime, helpers, accessibility
```

Entry: `index.js` → `src/App.tsx`.

### Domain model — `src/types/program.ts`

This is the spine of the whole app:

```
Program  ──has many──▶  Level  ──has many──▶  Task  ──has many──▶  Lesson
   │                                                                  │
   └── Subscription { program, currentLevel, state, subscriptionDate } └── type: 'video' | 'pdf' | 'other'
```

A `Task` is a **day** (it has a `date`). A `Lesson` is a single item with a `url`. Read this as *curriculum → unit → day → item* — that mapping matters for the Family feature (§7).

### State — two systems, deliberately split

- **Redux Toolkit + redux-persist over MMKV** (`src/store/index.ts`) for session/app state: `auth`, `documents`, `accessibility`, `app`, `subscriptions`. Persist key `root`; `currentDownloading`, `accessibility` and `subscriptions` are blacklisted from persistence.
- **`@tanstack/react-query`** for server state. *(Installed, but there is no `QueryClientProvider` in `src/App.tsx` yet — it currently only works inside test wrappers and `LessonChat`.)*

Server state belongs in react-query. Do not add new server-data slices to Redux.

- **No local database.** WatermelonDB was removed on 2026-08-17 — it was fully unused (`src/db/` → `useProgress` → nothing; no `DatabaseProvider`, no `withObservables`). PDF read position lives in the Redux `documents` slice. If the Family feature needs offline progress, use MMKV or `op-sqlite` — do **not** reintroduce a reactive ORM for one flat table.
- **Pusher was removed on 2026-08-17** (same T4 Expo migration — `@pusher/pusher-websocket-react-native` has no Expo config plugin and was an unproven quantity under CNG; nobody had verified it autolinks). `src/config/pusher.ts` is gone. `LessonChat` (`src/components/molecules/LessonChat/`) now polls its react-query chat query every 5s (`refetchInterval`) instead of subscribing to a realtime channel — this is a stand-in, not a decision, flagged with `TODO(T4)` in that file. Before reintroducing realtime chat, pick one: a hand-written Expo config plugin for Pusher, a plain WebSocket client against Pusher's protocol, or a different realtime provider with Expo support.

### API layer

`src/services/API.ts` exports `GET`/`POST`/`PUT`/`DELETE` wrappers over **apisauce**. The base URL is selected by an `isTest` boolean **hardcoded in that file**.

The legacy idiom is `REQUESTING(...)` taking a React `setState` and writing `{loading, error, results, pagination}` into component state. **Do not write new code against this pattern** — new data fetching uses react-query.

`axios` and `ky` are both in `package.json` and both unused. apisauce is the real client.

### Native config — `app.json`, not hand-edited native projects

`app.json`'s `expo` key is the **source of truth** for everything the native projects need: bundle IDs, permissions, Cairo fonts (via the `expo-font` plugin), Sentry (via `@sentry/react-native/expo`, which fixed Android symbol upload as a side effect — it had never worked). `android/` and `ios/` are generated from it via `npx expo prebuild` and are gitignored — see §2.

`metro.config.js` is built on `expo/metro-config`, not `@react-native/metro-config`. Two non-obvious things if you touch it:
- Don't import `mergeConfig` from `metro-config` (the plain community package) or `@react-native/metro-config` — Expo's `getDefaultConfig()` output isn't safe to merge that way; it produces a config whose `Bundler` never gets a `_transformer` (fails silently — Metro's `Bundler.js` swallows the real error into a `console.error`, so what you actually see is a much-later, unrelated-looking `Cannot read properties of undefined (reading 'transformFile')` crash). Extend the object `getDefaultConfig()` returns in place instead (spread `defaultConfig.transformer`/`defaultConfig.resolver`).
- `react-native-svg-transformer`'s `babelTransformerPath` must be the `/expo` entry point (`react-native-svg-transformer/expo`), not `/react-native`. The `/react-native` variant replaces Expo's own transformer wrapper outright instead of composing with it, which causes the same silent `_transformer` failure above.

`babel.config.js` uses `babel-preset-expo` (not `@react-native/babel-preset` directly — `babel-preset-expo` wraps it). It auto-detects `react-native-worklets` and injects `react-native-worklets/plugin` itself; don't add that plugin explicitly.

---

## 4. Conventions

### Imports

**`@/` is the only alias.** `@/components/atoms`, `@/theme`, `@/services/API`.

`tsconfig.json` currently also declares a catch-all `"*": ["./src/*"]` plus per-folder aliases for `containers/`, `styles/`, `api/`, `navigations/` — **four of which do not exist**. Do not use them; do not add more. Some files import as `assets/...` via the catch-all — normalize those to `@/` when you touch them.

`noUnusedLocals` is on. An unused import fails the type-check, not just lint.

### Component structure

Atomic design, four tiers under `src/components/`:

| Tier | Contains | Rule |
|---|---|---|
| `atoms/` | Primitives: `Text`, `Button`, `TextInput`, `Switch`, `Skeleton` | Know **nothing** about business rules — no currency logic, no app context, no feature flags |
| `molecules/` | Small compositions of atoms: `Field`, `LanguageSwitcher`, `LessonChat` | Compose atoms; minimal direct theme access beyond layout |
| `organisms/` | Larger units: `ErrorBoundary`, `FocusPlayer` | **Presentational only** — props in, callbacks out. No redux, no API imports, no navigation coupling. Data access lives in screens/hooks. |
| `templates/` | Page scaffolding: `SafeScreen` | Layout shells |

Shape of every component folder:

```
ComponentName/
  index.tsx      # component only
  style.ts       # getStyles(theme) factory — see below
  ComponentName.test.tsx
  ComponentName.stories.tsx
```

Write components as:

```tsx
const Button = forwardRef<View, ButtonProps>((props, ref) => { … });
Button.displayName = 'Button';
export default memo(Button);
```

Export every component **and its prop types** from the tier barrel (`src/components/atoms/index.ts`). A barrel is complete or absent — never a stub. *(The atoms barrel currently exports 3 of 13. Add to it when you touch a component.)*

### Styling

Plain `StyleSheet` + theme tokens. There is **no** unistyles, styled-components, or nativewind, and none should be added.

**The one rule that matters:**

```ts
// ✅ styles are a function of the theme
export const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.SURFACE, padding: theme.spacing.md },
  });

// ❌ never — this captures colors at module load and can never re-render
import { PALETTE } from '@/theme/colors';
const styles = StyleSheet.create({ container: { backgroundColor: PALETTE.SURFACE } });
```

No raw numbers in a `style.ts`. Spacing, radii, shadows and z-index come from tokens.

Use `sizeX`/`sizeY` for layout dimensions and `sizeAdaptivity` for typography (in `src/theme/responsive.ts`).

---

## 5. Theming

**`useTheme()` from `@/theme` is the only supported way to reach colors.**

```ts
import { useTheme } from '@/theme';
const { colors, isDark, toggleTheme } = useTheme();
```

**Never `import { PALETTE } from '@/theme/colors'`.** That module exports a *mutable* `var PALETTE` that `toDark()`/`toLight()` reassign. Anything importing it captures colors at module-evaluation time and silently never re-renders on theme change. Roughly six screens still do this; fix them as you touch them.

Dark mode is currently gated off by `enableDark = false` in `src/utils/constants.ts`.

`src/theme/OldThem/**` is **dead code** — the react-native-boilerplate theme, with zero imports from outside itself. Do not add to it, do not import from it.

Related: `AssetByVariant` and `IconByVariant` both read `const { variant } = useTheme()`, but the live `ThemeContext` does not expose `variant` — only the removed `OldThem` provider did. **Both are broken at runtime** and take a failing-lookup path on every render.

---

## 6. i18n and RTL

**Arabic-first.** `ar` is the `fallbackLng` (`APP_LANGUTAGE = 'ar'` in `src/config/index.ts`). Font is **Cairo** throughout.

- i18next + react-i18next. Namespaces default to `['screens', 'common']`.
- Language persists in MMKV under `app_language`.
- `I18nManager.forceRTL(...)` runs at module load; changing language calls `RNRestart.Restart()` after 500 ms. **A language change restarts the app** — that is by design given the current architecture.
- `isRTL` is re-exported from `src/utils/constants.ts`.

**Every user-facing string goes through `t()`.** Current violations to fix on contact: signup validation messages, Menu buttons, and the delete-account alert are hardcoded Arabic, and `BottomTabNavigation.tsx` passes a literal Arabic string *as a key* — `t('القائمة')`.

`src/translations/fr.json` exists on disk but is **not registered** in `resources`, while `SupportedLanguages` includes `FR`. Either wire it up or remove it; don't leave it half-connected.

---

## 7. Family feature (parent control)

Feature-flagged behind `FEATURE_FAMILY`. Full design in `docs/tasks/` and `docs/api/family-contract.md`.

A parent-authored curriculum is **just a `Program`** with `ownerType: 'guardian'` and `visibility: 'private'`. No new core entities — `Program → Level → Task → Lesson` already models a curriculum.

Lesson content is described by a discriminated union:

```ts
type LessonSource =
  | { kind: 'hosted'; playbackUrl: string; posterUrl?: string; durationSec?: number }
  | { kind: 'youtube'; videoId: string; startSec?: number; endSec?: number }
  | { kind: 'pdf'; url: string }
  | { kind: 'link'; url: string };
```

### Video playback rules — non-negotiable

The point of this feature is that a child never needs to open the YouTube app.

1. **Never call `Linking.openURL()` on a lesson URL.** Not from the player, not from a menu, not behind a long-press. *(The current `VideoModal` has exactly such a button; `FocusPlayer` removes it.)*
2. `kind: 'hosted'` plays through **`expo-video`** — chosen over `react-native-video` in [T3a](docs/tasks/T3a-focus-player.md): first-party under Expo CNG (SDK 57), config plugin ships in-box, no manual native wiring, versioned with the SDK so it can't drift.
3. `kind: 'youtube'` plays through `react-native-youtube-iframe` pointed at **`youtube-nocookie.com`**, with `WebView` `onShouldStartLoadWithRequest` rejecting every navigation outside the embed origin, plus `setSupportMultipleWindows={false}` and `allowsFullscreenVideo={false}`. **The library itself (2.4.1, latest) never sets this** — YouTube's IFrame Player API `host` option is a hardcoded omission in its `PlayerScripts.js`, not something `playerVars`/`baseUrlOverride`/`origin` can reach. Patched via `patch-package` (`patches/react-native-youtube-iframe+2.4.1.patch`) to add `host: 'https://www.youtube-nocookie.com'` to its `new YT.Player(...)` call. `patch-package` was removed from this repo in T0 for being unused; T3a reintroduced it, scoped to this one library.
4. Do **not** rely on `modestbranding` — YouTube deprecated it in Aug 2023 and it is a no-op. `rel=0` no longer hides related videos either; it only restricts them to the same channel. The navigation interception is what actually works.
5. Never extract or proxy YouTube streams. It violates their ToS. Re-hosting is only for content the user has rights to.

---

## 8. Testing

Jest + `@testing-library/react-native`. Tests sit next to their subject as `*.test.tsx`.

**The harness works now.** T0 wired it: `jest.config.js` has `moduleNameMapper` for `@/` and SVGs, `transformIgnorePatterns` (ESM packages like `immer` crashed the transform without it), `setupFiles`/`setupFilesAfterEach` pointing at `__mocks__/libs/*`, and a custom `jest/resolver.js` — which is what unblocks Reanimated 4 + `react-native-worklets` under Jest. `__tests__/App.test.tsx` renders the real `src/App.tsx`; the root template it used to render is deleted.

> **One known failure:** `src/components/atoms/Skeleton/Skeleton.test.tsx` crashes because `__mocks__/TestAppWrapper.tsx` imports `queryClient` and `storage` from `@/App`, and `src/App.tsx` exports neither (there's no `QueryClientProvider` yet — §3). Pre-existing, not a harness gap. It's an [unowned open item](docs/tasks/README.md#unowned-open-items) and a natural fit for T2d.

Do not set coverage thresholds the suite cannot currently meet.

---

## 9. Gotchas

**Secrets — never commit them.** T0 moved the hardcoded values out of source into `EXPO_PUBLIC_*` (Telegram token, Sentry DSN, the Huawei secret into `Fastlane/.env`) and removed the `__DEV__` login credentials from `Login`.

**`.env` is tracked, deliberately** — the owner removed it from `.gitignore` in `06fa36e`. Two consequences to keep in mind rather than re-litigate: the Telegram bot token in it is live and readable by anyone with repo access, and it is in git history regardless of what happens to the file now. **Rotation is the only real fix** — see the [unowned open items](docs/tasks/README.md#unowned-open-items). Anything that genuinely must not ship should not be an `EXPO_PUBLIC_*` value at all; it belongs on the backend. When you regenerate release signing config (`MYAPP_UPLOAD_*`), use EAS credentials or a gitignored local override — **don't reintroduce plaintext passwords**. Do not add to this list, and do not copy these patterns.

**`isTest` in `src/services/API.ts` selects the API host** and is currently `true` — builds point at the dev backend. Check it before any release build.

**New Architecture is ON** (`newArchEnabled: true` in `app.json`). Any native module you add must support it.

**Abandoned dependencies** — `react-native-fast-image`, `react-native-actionsheet` and `react-native-render-html` were all last published in 2022 and have no New Arch commitment. **As of [T6](docs/tasks/T6-expo-hardening.md), 2026-08-19, two of three are gone:**

- **`react-native-render-html` is removed.** It was dead weight, not a risk to manage — imported once, in `src/theme/typography.ts`, for `defaultSystemFonts`, which fed a `systemFonts` export nothing consumed. Nothing in `src/` renders HTML.
- **`react-native-fast-image` is removed, replaced by `expo-image`.** `resizeMode` became `contentFit`. Three call sites (`MainScreen`, `Programs`, `AccessibleImage`).
- **`react-native-actionsheet` is still live** in `Login` and **no brief owns replacing it** — it's an [unowned open item](docs/tasks/README.md#unowned-open-items).

**Navigation params are effectively untyped.** `src/navigation/types.ts` references `Lesson`/`Program`/`Subscription` without importing them, so they silently resolve to globals. Prefer passing IDs over whole domain objects.

**`.history/`** (editor history) is no longer tracked — it was untracked during the T4 cleanup. Don't reintroduce it.

**`README.md` was rewritten on 2026-08-18** and is now accurate — it had been the untouched bare-RN template, documenting a theme API (`colors.primary`, `spacing.md`, `react-native-config`) that never existed here. It is now a short orientation doc that points back to this file. This file is still the deeper source of truth; the two should agree.

**Neither platform has ever had a real app icon.** Android shows the default React Native robot placeholder (`android/app/src/main/res/mipmap-*/ic_launcher.png` — well, it did, before that directory became generated; the source of truth is now `app.json`'s `icon` field, currently pointed at a generic placeholder). iOS's `AppIcon.appiconset` was completely empty. Pre-existing, unrelated to Expo. Needs a real 1024×1024 Binaa icon before shipping.

**The native display name is "مبادرة", not "Binaa" — this is now a settled decision, not an open question.** Before the T4 migration, both platforms' compiled resources showed "مبادرة" as the home-screen label. T4 briefly changed `app.json`'s `expo.name` to `"Binaa"` as a default; **the owner confirmed 2026-08-19 that "مبادرة" is correct** and it was reverted. Don't "fix" this back to Binaa — it's deliberate.
