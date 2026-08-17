# CLAUDE.md

Guidance for Claude Code and other agents working in this repository.

---

## 1. Identity — read this first

This repo has **three different names for itself**. Getting them straight prevents most confusion:

| Name | What it refers to |
|---|---|
| **Mobadra** | The *folder* on disk (`~/PWS/ReactNative/Mobadra`). Appears nowhere in the code. |
| **Binaa** (بناء) | The **app**. `app.json` displayName, `package.json` `"name": "binaa"`, Android `applicationId com.binaa`, iOS target/scheme `Binaa`, Gradle `rootProject.name = "Binaa"`. |
| **Mubadarah** | The **backend**. `https://mubadarah.ce-svcs.cc` (prod) / `https://dev-mubadarah.ce-svcs.cc` (dev). |

Git remote is `git@github.com:Tech-Support-Team/mobile-frontend.git`. Default branch `main`.

**What the app does:** an Arabic-first structured-learning app. Students browse multi-level programs, subscribe, follow a daily lesson schedule, consume PDF and video lessons in-app, track completion offline, and chat per-lesson in realtime.

---

## 2. Commands

Package manager is **Yarn Classic (v1)**. There is only a `yarn.lock` — do not introduce `npm install` or a second lockfile.

```bash
yarn install
yarn pod-install          # npx pod-install, for iOS

yarn start                # Metro
yarn android              # react-native run-android
yarn ios                  # react-native run-ios

yarn lint                 # runs all three below, in order
yarn lint:rules           # eslint . --cache
yarn lint:code-format     # prettier --check "{src,__mocks__}/**/*.{js,json,md,ts,tsx,yml,yaml}"
yarn lint:type-check      # tsc
yarn lint:fix             # autofix rules + format, then type-check

yarn test                 # jest
```

Release (Fastlane lives in `Fastlane/` — **capital F**, which macOS's case-insensitive filesystem hides):

```bash
bundle exec fastlane android build   # bundle release -> Play internal track (1% rollout) + Huawei AppGallery
bundle exec fastlane ios beta        # build -> TestFlight + Sentry dSYM upload
```

Ruby deps are pinned in `Gemfile` (CocoaPods `>= 1.13`, with specific bad versions excluded). Node `>= 20` per `engines`.

> **Current state** (measured 2026-08-17 against RN 0.86.2, `node_modules` installed):
>
> - **`tsc` reports 163 errors.** Largest groups: 62× `TS6133` (unused locals — `noUnusedLocals` is on), 22× `TS2339` (property doesn't exist), 15× `TS2307` (cannot find module, incl. an undeclared `react-native-fs` in `src/utils/pdfManager.ts`). Worst files: `atoms/FlashMessage` (23), `BottomTabNavigation` (9), `atoms/CircleStatus` (8).
> - **`yarn test` fails: 4 suites, 0 tests run.** `babel.config.js` references `'transform-inline-environment-variables'`, which is not declared in `package.json`.
> - `__tests__/App.test.tsx` imports `../App` — the leftover **root** template file — not `src/App.tsx`, so it asserts nothing real.
> - `jest.config.js` has no `moduleNameMapper`, so `@/…` imports in tests won't resolve once the Babel issue is fixed.
>
> ⚠️ **A stale `@react-native/typescript-config` will silently hide all of this.** If that package's installed version doesn't match `package.json`, `tsc` aborts on a config error (`TS5101`, `baseUrl` deprecation) *before type-checking any file* and appears to pass. If `tsc` reports almost nothing, verify the installed version matches before believing it.
>
> Do not assume a green baseline. Establish one first.

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
├── config/          index.ts (APP_LANGUTAGE), pusher.ts, telegram.ts
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
- **Pusher** (`src/config/pusher.ts`) for realtime lesson chat.

### API layer

`src/services/API.ts` exports `GET`/`POST`/`PUT`/`DELETE` wrappers over **apisauce**. The base URL is selected by an `isTest` boolean **hardcoded in that file**.

The legacy idiom is `REQUESTING(...)` taking a React `setState` and writing `{loading, error, results, pagination}` into component state. **Do not write new code against this pattern** — new data fetching uses react-query.

`axios` and `ky` are both in `package.json` and both unused. apisauce is the real client.

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
2. `kind: 'hosted'` plays through `react-native-video`. Prefer it whenever it's available.
3. `kind: 'youtube'` plays through `react-native-youtube-iframe` pointed at **`youtube-nocookie.com`**, with `WebView` `onShouldStartLoadWithRequest` rejecting every navigation outside the embed origin, plus `setSupportMultipleWindows={false}` and `allowsFullscreenVideo={false}`.
4. Do **not** rely on `modestbranding` — YouTube deprecated it in Aug 2023 and it is a no-op. `rel=0` no longer hides related videos either; it only restricts them to the same channel. The navigation interception is what actually works.
5. Never extract or proxy YouTube streams. It violates their ToS. Re-hosting is only for content the user has rights to.

---

## 8. Testing

Jest + `@testing-library/react-native`. Tests sit next to their subject as `*.test.tsx`.

> **Current state:** `jest.config.js` is bare `{ preset: 'react-native' }` — no `moduleNameMapper` for `@/` or SVGs, no `transformIgnorePatterns`, no `setupFiles`. The mocks in `__mocks__/` are never loaded, and `__tests__/App.test.tsx` renders the leftover root `/App.tsx` template rather than `src/App.tsx`. Fix the harness before trusting a result.

Do not set coverage thresholds the suite cannot currently meet.

---

## 9. Gotchas

**Secrets — never commit them.** The repo currently violates this in five places (Telegram bot token in `src/config/telegram.ts`, keystore passwords in `android/gradle.properties`, Huawei client secret in `Fastlane/Fastfile`, Sentry DSN in `src/App.tsx`, `__DEV__` login credentials in `src/screens/auth/Login/index.tsx`). Do not add a sixth, and do not copy these patterns.

**`isTest` in `src/services/API.ts` selects the API host** and is currently `true` — builds point at the dev backend. Check it before any release build.

**New Architecture is ON** (`newArchEnabled=true`, `hermesEnabled=true`, Fabric pods in `Podfile.lock`). Any native module you add must support it.

**`react-native-beautiful-timeline` is pinned to an absolute path** on the original author's Mac (`file:/Users/mshokry/...`) and is imported nowhere. `yarn install` fails anywhere else.

**Abandoned dependencies** — `react-native-fast-image`, `react-native-actionsheet` and `react-native-render-html` were all last published in 2022 and have no New Arch commitment. Don't build new features on them.

**Navigation params are effectively untyped.** `src/navigation/types.ts` references `Lesson`/`Program`/`Subscription` without importing them, so they silently resolve to globals. Prefer passing IDs over whole domain objects.

**`.history/` is committed** (editor history). Ignore it; don't add to it.

**`README.md` is wrong.** It documents a theme API (`colors.primary`, `spacing.md`, `react-native-config`) that has never existed in this codebase. Trust this file over that one.
